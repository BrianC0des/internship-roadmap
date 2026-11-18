import { useEffect, useState } from 'react';
import {
  Building2,
  CheckSquare,
  FolderKanban,
  Map,
  Menu,
  Moon,
  Settings,
  Sun,
  Trophy,
  X,
} from 'lucide-react';

export type AppPage =
  | 'roadmap'
  | 'requirements'
  | 'companies'
  | 'projects'
  | 'leaderboard'
  | 'settings';

interface TopNavProps {
  activePage: AppPage;
  onSelectPage: (page: AppPage) => void;
  totalPoints: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const NAV_ITEMS: Array<{ id: AppPage; label: string; icon: typeof Map }> = [
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'requirements', label: 'Requirements', icon: CheckSquare },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'leaderboard', label: 'Ranking', icon: Trophy },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function TopNav({
  activePage,
  onSelectPage,
  totalPoints,
  darkMode,
  onToggleDarkMode,
}: TopNavProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen]);

  const activeLabel = NAV_ITEMS.find((item) => item.id === activePage)?.label ?? 'Roadmap';

  const handleSelect = (page: AppPage) => {
    onSelectPage(page);
    setSidebarOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
              className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white dark:bg-blue-600">
              JP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-sm font-bold leading-tight text-slate-900 sm:text-base dark:text-slate-50">
                  Japan SWE Internship Roadmap
                </h1>
                <span className="hidden sm:inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {activeLabel}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                HENNGE GIP &amp; Mercari Prep
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Burger Sidebar Drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px]"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside
            aria-label="Navigation sidebar"
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white dark:bg-blue-600">
                  JP
                </div>
                <span className="font-display text-sm font-bold text-slate-900 dark:text-slate-50">
                  Menu
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation menu"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-4 pt-4 pb-2">
              <button
                type="button"
                onClick={() => handleSelect('leaderboard')}
                className="flex w-full items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200 tabular-nums"
              >
                <span className="inline-flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  <span>Your Squad Score</span>
                </span>
                <span>{totalPoints} pts</span>
              </button>
            </div>

            <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 py-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
