import { ChangeEvent, FormEvent, useState } from 'react';
import { Cloud, Download, LogOut, RotateCcw, Upload } from 'lucide-react';
import { AppSettings, PersistedState } from '../../types/roadmap';
import { AuthUser, getApiBaseUrl, setCustomApiBaseUrl } from '../../utils/api';
import { exportStateToJson } from '../../utils/storage';

interface SettingsPageProps {
  state: PersistedState;
  user: AuthUser | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  onLogin: (username: string, password: string) => Promise<void>;
  onLogout: () => void;
  onUpdateProfile: (patch: { displayName?: string; password?: string }) => Promise<AuthUser>;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onImportJson: (jsonText: string) => void;
  onResetAll: () => void;
}

function daysUntil(isoDate: string): number | null {
  if (!isoDate) return null;
  const target = new Date(isoDate);
  if (Number.isNaN(target.getTime())) return null;
  const diffMs = target.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function SettingsPage({
  state,
  user,
  syncStatus,
  onLogin,
  onLogout,
  onUpdateProfile,
  onUpdateSettings,
  onImportJson,
  onResetAll,
}: SettingsPageProps) {
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [apiUrl, setApiUrl] = useState(() => getApiBaseUrl());
  const [loginUser, setLoginUser] = useState('devchan');
  const [loginPass, setLoginPass] = useState('');
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [newPassword, setNewPassword] = useState('');

  const handleSaveApiUrl = (e: FormEvent) => {
    e.preventDefault();
    setCustomApiBaseUrl(apiUrl);
    setMessage({ type: 'ok', text: 'Saved backend API URL.' });
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await onLogin(loginUser, loginPass);
      setLoginPass('');
      setMessage({ type: 'ok', text: `Signed in as ${loginUser}.` });
    } catch (err) {
      setMessage({ type: 'err', text: err instanceof Error ? err.message : 'Login failed.' });
    }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateProfile({
        displayName: displayName.trim() || undefined,
        password: newPassword.length >= 6 ? newPassword : undefined,
      });
      setNewPassword('');
      setMessage({ type: 'ok', text: 'Profile updated.' });
    } catch (err) {
      setMessage({ type: 'err', text: err instanceof Error ? err.message : 'Update failed.' });
    }
  };

  const henngeDays = daysUntil(state.settings.henngeTargetDate);
  const mercariDays = daysUntil(state.settings.mercariTargetDate);

  const handleExport = () => {
    const json = exportStateToJson(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roadmap-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'ok', text: 'Exported backup JSON.' });
  };

  const handleFileImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      onImportJson(text);
      setMessage({ type: 'ok', text: 'Imported progress and notes successfully.' });
    } catch (err) {
      setMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to import JSON.',
      });
    } finally {
      e.target.value = '';
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
          Settings &amp; Backup
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          All progress and notes are stored in your browser&apos;s localStorage.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            message.type === 'ok'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Account & Cloud Sync */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
              Account &amp; Render Cloud Sync
            </h3>
          </div>
          {user && (
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'error' ? 'Sync error' : 'Synced'}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveApiUrl} className="mt-3 flex flex-wrap gap-2">
          <input
            type="url"
            placeholder="https://your-service.onrender.com"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="flex-1 min-w-[220px] rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          <button
            type="submit"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Save API URL
          </button>
        </form>

        {!user ? (
          <form onSubmit={handleLogin} className="mt-4 flex flex-wrap items-center gap-2">
            <select
              value={loginUser}
              onChange={(e) => setLoginUser(e.target.value)}
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
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              Sign In
            </button>
          </form>
        ) : (
          <div className="mt-4 space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">
                Signed in as <strong>{user.displayName}</strong> (@{user.username})
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
              <input
                type="password"
                placeholder="New password (6+ chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Update Profile
              </button>
            </form>
          </div>
        )}
      </section>

      {/* Target Application Dates */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
          Target Application Dates
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="hennge-date"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              HENNGE GIP Target Date
            </label>
            <input
              id="hennge-date"
              type="date"
              value={state.settings.henngeTargetDate}
              onChange={(e) => onUpdateSettings({ henngeTargetDate: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            {henngeDays !== null && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {henngeDays >= 0 ? `${henngeDays} days remaining` : `${Math.abs(henngeDays)} days ago`}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="mercari-date"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Mercari SWE Target Date
            </label>
            <input
              id="mercari-date"
              type="date"
              value={state.settings.mercariTargetDate}
              onChange={(e) => onUpdateSettings({ mercariTargetDate: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            {mercariDays !== null && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {mercariDays >= 0 ? `${mercariDays} days remaining` : `${Math.abs(mercariDays)} days ago`}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Export / Import */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
          Export &amp; Import Progress
        </h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Back up your statuses, personal notes, and projects as JSON or restore on another device.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export JSON
          </button>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800">
            <Upload className="h-4 w-4" aria-hidden="true" />
            <span>Import JSON</span>
            <input
              type="file"
              accept="application/json,.json"
              onChange={handleFileImport}
              className="sr-only"
            />
          </label>
        </div>
      </section>

      {/* Reset */}
      <section className="rounded-xl border border-rose-200 bg-white p-5 dark:border-rose-900/60 dark:bg-slate-900">
        <h3 className="font-display text-base font-bold text-rose-700 dark:text-rose-400">
          Reset Local Data
        </h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Clears all node statuses, notes, and custom projects back to defaults.
        </p>
        <div className="mt-4">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-300 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset Progress
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetAll();
                  setConfirmReset(false);
                  setMessage({ type: 'ok', text: 'All local progress has been reset.' });
                }}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
