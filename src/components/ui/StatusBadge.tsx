import { Check, Circle, Clock, MinusCircle } from 'lucide-react';
import { InternshipTarget, NodeStatus } from '../../types/roadmap';

export const STATUS_META: Record<
  NodeStatus,
  {
    label: string;
    pillClass: string;
    nodeClass: string;
    icon: typeof Circle;
  }
> = {
  not_started: {
    label: 'Not started',
    pillClass:
      'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    nodeClass:
      'bg-white text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700',
    icon: Circle,
  },
  learning: {
    label: 'Learning',
    pillClass:
      'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700',
    nodeClass:
      'bg-amber-50 text-amber-950 border-amber-500 dark:bg-amber-950/60 dark:text-amber-100 dark:border-amber-500',
    icon: Clock,
  },
  done: {
    label: 'Done',
    pillClass:
      'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-700',
    nodeClass:
      'bg-emerald-50 text-emerald-950 border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-100 dark:border-emerald-500',
  icon: Check,
  },
  skipped: {
    label: 'Skipped',
    pillClass:
      'bg-slate-100 text-slate-500 border-slate-200 line-through dark:bg-slate-900 dark:text-slate-500 dark:border-slate-800',
    nodeClass:
      'bg-slate-100 text-slate-500 border-slate-300 line-through opacity-75 dark:bg-slate-900/70 dark:text-slate-500 dark:border-slate-800',
    icon: MinusCircle,
  },
};

export function StatusBadge({ status }: { status: NodeStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.pillClass}`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  );
}

export function TargetBadges({ targets }: { targets: InternshipTarget[] }) {
  return (
    <span className="inline-flex items-center gap-1">
      {targets.includes('H') && (
        <span
          title="HENNGE Global Internship Program"
          className="inline-flex h-4 min-w-4 items-center justify-center rounded bg-indigo-600 px-1 text-[10px] font-bold leading-none text-white dark:bg-indigo-500"
        >
          H
        </span>
      )}
      {targets.includes('M') && (
        <span
          title="Mercari Software Engineer Internship"
          className="inline-flex h-4 min-w-4 items-center justify-center rounded bg-rose-600 px-1 text-[10px] font-bold leading-none text-white dark:bg-rose-500"
        >
          M
        </span>
      )}
    </span>
  );
}
