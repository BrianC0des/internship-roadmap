import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Award, LogIn, RefreshCw, Trophy } from 'lucide-react';
import { AuthUser, fetchLeaderboard, getApiBaseUrl, LeaderboardEntry } from '../../utils/api';
import { POINT_VALUES, PointsBreakdown } from '../../utils/points';

interface LeaderboardPageProps {
  currentUser: AuthUser | null;
  localPoints: PointsBreakdown;
  onLogin: (username: string, password: string) => Promise<void>;
}

const RANK_STYLES: Record<number, string> = {
  1: 'border-amber-400 bg-amber-50/70 dark:border-amber-600 dark:bg-amber-950/30',
  2: 'border-slate-300 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900',
  3: 'border-orange-300 bg-orange-50/50 dark:border-orange-800/70 dark:bg-orange-950/20',
};

export function LeaderboardPage({
  currentUser,
  localPoints,
  onLogin,
}: LeaderboardPageProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState('devchan');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const hasApi = Boolean(getApiBaseUrl());

  const loadBoard = useCallback(async () => {
    if (!getApiBaseUrl()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboard();
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBoard();
  }, [loadBoard, currentUser]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      await onLogin(username, password);
      setPassword('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
            Squad Leaderboard (3 Accounts)
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Track who is ahead across roadmap nodes, project tasks, notes, and shipped projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-900 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200 tabular-nums">
            Your Score: {localPoints.totalPoints} pts
          </div>
          {hasApi && (
            <button
              type="button"
              onClick={loadBoard}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Sign-in box if not authenticated */}
      {!currentUser && hasApi && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <LogIn className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-50">
              Sign In to Sync Your Progress to the Leaderboard
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Accounts: <code className="font-mono">devchan</code>,{' '}
            <code className="font-mono">akizeno</code>,{' '}
            <code className="font-mono">satori</code> (change passwords anytime in Settings).
          </p>

          <form onSubmit={handleLogin} className="mt-3 flex flex-wrap items-center gap-2.5">
            <select
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="devchan">devchan</option>
              <option value="akizeno">akizeno</option>
              <option value="satori">satori</option>
            </select>
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              type="submit"
              disabled={loggingIn}
              className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              {loggingIn ? 'Signing in...' : 'Sign In & Sync'}
            </button>
          </form>
          {loginError && (
            <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
              {loginError}
            </p>
          )}
        </section>
      )}

      {!hasApi && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          Backend API URL is not set yet. Deploy <code className="font-mono">server/</code> to
          Render and set <code className="font-mono">VITE_API_URL</code> (or enter the Render URL in{' '}
          <strong>Settings</strong>) to sync all 3 accounts live.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      )}

      {/* Podium Cards */}
      {entries.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {entries.map((entry) => {
            const isMe = currentUser?.username === entry.username;
            return (
              <article
                key={entry.username}
                className={`rounded-xl border-2 p-4 ${
                  RANK_STYLES[entry.rank] ?? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    <Trophy className="h-4 w-4 text-amber-500" aria-hidden="true" />
                    Rank #{entry.rank}
                  </span>
                  {isMe && (
                    <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      YOU
                    </span>
                  )}
                </div>

                <h3 className="mt-2 font-display text-lg font-bold text-slate-900 dark:text-slate-50">
                  {entry.displayName}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  @{entry.username}
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                    {entry.points.totalPoints}
                    <span className="ml-1 text-xs font-semibold text-slate-500">pts</span>
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {entry.points.overallPercent}% roadmap
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-slate-200/70 pt-3 text-[11px] text-slate-600 dark:border-slate-800 dark:text-slate-300 tabular-nums">
                  <span>Nodes done: {entry.points.doneNodes}</span>
                  <span>Tasks: {entry.points.completedTasksCount}</span>
                  <span>Projects: {entry.points.completedProjectsCount}</span>
                  <span>Notes: {entry.points.notePoints / POINT_VALUES.noteWritten}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Scoring Rules */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
            How Points Are Earned
          </h3>
        </div>
        <div className="mt-3 grid gap-2 text-xs text-slate-700 sm:grid-cols-2 md:grid-cols-3 dark:text-slate-300">
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
            <strong>Main Node Done:</strong> +{POINT_VALUES.mainDone} pts (+{POINT_VALUES.mainLearning} Learning)
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
            <strong>Subtopic Done:</strong> +{POINT_VALUES.subtopicDone} pts (+{POINT_VALUES.subtopicLearning} Learning)
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
            <strong>Optional Node Done:</strong> +{POINT_VALUES.optionalDone} pts (+{POINT_VALUES.optionalLearning} Learning)
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
            <strong>To-Do Task Checked:</strong> +{POINT_VALUES.taskChecked} pts each
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
            <strong>Study Notes Written:</strong> +{POINT_VALUES.noteWritten} pts per node
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950/60">
            <strong>Project Completed:</strong> +{POINT_VALUES.projectCompleted} pts (+{POINT_VALUES.projectInProgress} In Progress)
          </div>
        </div>
      </section>
    </main>
  );
}
