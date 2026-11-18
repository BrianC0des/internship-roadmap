import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3001);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-local-secret-change-in-prod';
const DATABASE_URL = process.env.DATABASE_URL || '';
const DB_FILE = resolve(__dirname, 'data/db.json');

const SEED_ACCOUNTS = [
  { username: 'devchan', displayName: 'Devchan', password: process.env.SEED_PASS_1 || 'roadmap2027' },
  { username: 'akizeno', displayName: 'Akizeno', password: process.env.SEED_PASS_2 || 'akizeno2027' },
  { username: 'satori', displayName: 'Satori', password: process.env.SEED_PASS_3 || 'satori2027' },
];

const EMPTY_POINTS = {
  totalPoints: 0,
  nodePoints: 0,
  taskPoints: 0,
  notePoints: 0,
  projectPoints: 0,
  doneNodes: 0,
  completedTasksCount: 0,
  completedProjectsCount: 0,
  overallPercent: 0,
};

// ---------------------------------------------------------------------------
// Storage Abstraction: PostgreSQL (Render) with local JSON file fallback
// ---------------------------------------------------------------------------
let pool = null;

async function initStorage() {
  if (DATABASE_URL) {
    pool = new pg.Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roadmap_users (
        username TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        state_json JSONB,
        points_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    for (const acc of SEED_ACCOUNTS) {
      const existing = await pool.query(
        'SELECT username FROM roadmap_users WHERE username = $1',
        [acc.username]
      );
      if (existing.rowCount === 0) {
        const hash = await bcrypt.hash(acc.password, 10);
        await pool.query(
          `INSERT INTO roadmap_users (username, display_name, password_hash, state_json, points_json)
           VALUES ($1, $2, $3, NULL, $4::jsonb)`,
          [acc.username, acc.displayName, hash, JSON.stringify(EMPTY_POINTS)]
        );
      }
    }
    return;
  }

  // Local JSON file fallback
  if (!existsSync(DB_FILE)) {
    mkdirSync(dirname(DB_FILE), { recursive: true });
    writeFileSync(DB_FILE, JSON.stringify({ users: {} }, null, 2), 'utf-8');
  }
  const db = readFileDb();
  let changed = false;
  for (const acc of SEED_ACCOUNTS) {
    if (!db.users[acc.username]) {
      db.users[acc.username] = {
        username: acc.username,
        displayName: acc.displayName,
        passwordHash: await bcrypt.hash(acc.password, 10),
        state: null,
        points: EMPTY_POINTS,
        updatedAt: new Date().toISOString(),
      };
      changed = true;
    }
  }
  if (changed) writeFileDb(db);
}

function readFileDb() {
  return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
}

function writeFileDb(db) {
  writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

async function findUser(username) {
  if (pool) {
    const res = await pool.query(
      'SELECT username, display_name, password_hash, state_json, points_json, updated_at FROM roadmap_users WHERE username = $1',
      [username]
    );
    if (res.rowCount === 0) return null;
    const r = res.rows[0];
    return {
      username: r.username,
      displayName: r.display_name,
      passwordHash: r.password_hash,
      state: r.state_json,
      points: r.points_json ?? EMPTY_POINTS,
      updatedAt: r.updated_at,
    };
  }
  const db = readFileDb();
  return db.users[username] ?? null;
}

async function saveUserState(username, state, points) {
  const updatedAt = new Date().toISOString();
  if (pool) {
    await pool.query(
      `UPDATE roadmap_users
       SET state_json = $2::jsonb, points_json = $3::jsonb, updated_at = NOW()
       WHERE username = $1`,
      [username, JSON.stringify(state), JSON.stringify(points)]
    );
    return updatedAt;
  }
  const db = readFileDb();
  if (db.users[username]) {
    db.users[username].state = state;
    db.users[username].points = points;
    db.users[username].updatedAt = updatedAt;
    writeFileDb(db);
  }
  return updatedAt;
}

async function updateUserProfile(username, { displayName, password }) {
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;
  if (pool) {
    if (displayName && passwordHash) {
      await pool.query(
        'UPDATE roadmap_users SET display_name = $2, password_hash = $3 WHERE username = $1',
        [username, displayName, passwordHash]
      );
    } else if (displayName) {
      await pool.query(
        'UPDATE roadmap_users SET display_name = $2 WHERE username = $1',
        [username, displayName]
      );
    } else if (passwordHash) {
      await pool.query(
        'UPDATE roadmap_users SET password_hash = $2 WHERE username = $1',
        [username, passwordHash]
      );
    }
    return findUser(username);
  }
  const db = readFileDb();
  if (db.users[username]) {
    if (displayName) db.users[username].displayName = displayName;
    if (passwordHash) db.users[username].passwordHash = passwordHash;
    writeFileDb(db);
  }
  return db.users[username] ?? null;
}

async function getLeaderboard() {
  let rows = [];
  if (pool) {
    const res = await pool.query(
      'SELECT username, display_name, points_json, updated_at FROM roadmap_users'
    );
    rows = res.rows.map((r) => ({
      username: r.username,
      displayName: r.display_name,
      points: r.points_json ?? EMPTY_POINTS,
      updatedAt: r.updated_at,
    }));
  } else {
    const db = readFileDb();
    rows = Object.values(db.users).map((u) => ({
      username: u.username,
      displayName: u.displayName,
      points: u.points ?? EMPTY_POINTS,
      updatedAt: u.updatedAt,
    }));
  }

  return rows
    .sort((a, b) => (b.points?.totalPoints ?? 0) - (a.points?.totalPoints ?? 0))
    .map((entry, idx) => ({
      rank: idx + 1,
      ...entry,
    }));
}

async function getSquadShowcase() {
  let rows = [];
  if (pool) {
    const res = await pool.query(
      'SELECT username, display_name, state_json, updated_at FROM roadmap_users'
    );
    rows = res.rows.map((r) => ({
      username: r.username,
      displayName: r.display_name,
      projects: Array.isArray(r.state_json?.projects) ? r.state_json.projects : [],
      updatedAt: r.updated_at,
    }));
  } else {
    const db = readFileDb();
    rows = Object.values(db.users).map((u) => ({
      username: u.username,
      displayName: u.displayName,
      projects: Array.isArray(u.state?.projects) ? u.state.projects : [],
      updatedAt: u.updatedAt,
    }));
  }

  const showcase = [];
  for (const row of rows) {
    for (const proj of row.projects) {
      if (proj && (proj.status === 'completed' || proj.status === 'in_progress')) {
        showcase.push({
          ...proj,
          ownerUsername: row.username,
          ownerDisplayName: row.displayName,
        });
      }
    }
  }
  return showcase;
}

// ---------------------------------------------------------------------------
// Express App
// ---------------------------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Missing auth token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.username = payload.username;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, storage: pool ? 'postgres' : 'file' });
});

app.post('/api/auth/login', async (req, res) => {
  const username = String(req.body?.username || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const user = await findUser(username);
  if (!user) return res.status(401).json({ error: 'Invalid username or password' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid username or password' });

  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '30d' });
  res.json({
    token,
    user: { username: user.username, displayName: user.displayName },
  });
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  const user = await findUser(req.username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { username: user.username, displayName: user.displayName } });
});

app.put('/api/auth/profile', requireAuth, async (req, res) => {
  const displayName =
    typeof req.body?.displayName === 'string' && req.body.displayName.trim()
      ? req.body.displayName.trim().slice(0, 40)
      : undefined;
  const password =
    typeof req.body?.password === 'string' && req.body.password.length >= 6
      ? req.body.password
      : undefined;

  const updated = await updateUserProfile(req.username, { displayName, password });
  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { username: updated.username, displayName: updated.displayName } });
});

app.get('/api/state', requireAuth, async (req, res) => {
  const user = await findUser(req.username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ state: user.state, points: user.points, updatedAt: user.updatedAt });
});

app.put('/api/state', requireAuth, async (req, res) => {
  const { state, points } = req.body ?? {};
  if (!state || typeof state !== 'object') {
    return res.status(400).json({ error: 'Missing state payload' });
  }
  const updatedAt = await saveUserState(req.username, state, points ?? EMPTY_POINTS);
  res.json({ ok: true, updatedAt });
});

app.get('/api/leaderboard', async (_req, res) => {
  const entries = await getLeaderboard();
  res.json({ entries });
});

app.get('/api/showcase', async (_req, res) => {
  const projects = await getSquadShowcase();
  res.json({ projects });
});

initStorage()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Roadmap API running on http://localhost:${PORT} (${pool ? 'postgres' : 'file'})`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
