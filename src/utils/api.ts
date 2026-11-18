import { PersistedState, ProjectItem } from '../types/roadmap';
import { PointsBreakdown } from './points';

const TOKEN_KEY = 'japan-internship-roadmap:token';
const USER_KEY = 'japan-internship-roadmap:user';
const API_URL_KEY = 'japan-internship-roadmap:api-url';

export interface AuthUser {
  username: string;
  displayName: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  displayName: string;
  points: PointsBreakdown;
  updatedAt: string;
}

export function getApiBaseUrl(): string {
  const stored = localStorage.getItem(API_URL_KEY)?.trim();
  if (stored) return stored.replace(/\/+$/, '');
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, '');
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  return '';
}

export function setCustomApiBaseUrl(url: string): void {
  const clean = url.trim().replace(/\/+$/, '');
  if (clean) localStorage.setItem(API_URL_KEY, clean);
  else localStorage.removeItem(API_URL_KEY);
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function saveAuthSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error('Backend API URL is not configured.');
  }
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function loginAccount(
  username: string,
  password: string
): Promise<{ token: string; user: AuthUser }> {
  const result = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  saveAuthSession(result.token, result.user);
  return result;
}

export async function updateAccountProfile(patch: {
  displayName?: string;
  password?: string;
}): Promise<AuthUser> {
  const res = await apiFetch<{ user: AuthUser }>('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(patch),
  });
  const token = getStoredToken();
  if (token) saveAuthSession(token, res.user);
  return res.user;
}

export async function fetchCloudState(): Promise<{
  state: PersistedState | null;
  points: PointsBreakdown;
  updatedAt: string;
}> {
  return apiFetch('/api/state');
}

export async function saveCloudState(
  state: PersistedState,
  points: PointsBreakdown
): Promise<{ ok: boolean; updatedAt: string }> {
  return apiFetch('/api/state', {
    method: 'PUT',
    body: JSON.stringify({ state, points }),
  });
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await apiFetch<{ entries: LeaderboardEntry[] }>('/api/leaderboard');
  return res.entries;
}

export interface ShowcaseProject extends ProjectItem {
  ownerUsername: string;
  ownerDisplayName: string;
}

export async function fetchSquadShowcase(): Promise<ShowcaseProject[]> {
  const res = await apiFetch<{ projects: ShowcaseProject[] }>('/api/showcase');
  return res.projects;
}
