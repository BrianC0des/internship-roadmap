import { Building2, CheckSquare, FolderKanban, Map, Moon, Settings, Sun, Trophy } from 'lucide-react';

export type AppPage = 'roadmap' | 'requirements' | 'companies' | 'projects' | 'leaderboard' | 'settings';

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
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white dark:bg-blue-600">
            JP
          </div>
          <div>
            <h1 className="font-display text-sm font-bold leading-tight text-slate-900 sm:text-base dark:text-slate-50">
              Japan SWE Internship Roadmap
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              HENNGE GIP &amp; Mercari Prep
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectPage('leaderboard')}
            title="View squad ranking"
            className="hidden sm:inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200 tabular-nums"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            <span>{totalPoints} pts</span>
          </button>
          <nav aria-label="Main navigation" className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectPage(item.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
