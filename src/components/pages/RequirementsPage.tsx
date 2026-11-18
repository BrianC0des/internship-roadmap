import { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { REQUIREMENTS } from '../../data/requirements';
import { NodeStatus, RequirementRollupStatus, RoadmapNodeData } from '../../types/roadmap';
import { getRequirementRollup } from '../../utils/progress';

interface RequirementsPageProps {
  allNodes: RoadmapNodeData[];
  statuses: Record<string, NodeStatus>;
  onOpenNode: (nodeId: string) => void;
}

const ROLLUP_META: Record<
  RequirementRollupStatus,
  { label: string; badgeClass: string; icon: typeof Circle }
> = {
  not_started: {
    label: 'Not started',
    badgeClass:
      'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    icon: Circle,
  },
  in_progress: {
    label: 'In progress',
    badgeClass:
      'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700',
    icon: Clock,
  },
  done: {
    label: 'Covered',
    badgeClass:
      'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700',
    icon: CheckCircle2,
  },
};

export function RequirementsPage({
  allNodes,
  statuses,
  onOpenNode,
}: RequirementsPageProps) {
  const [companyFilter, setCompanyFilter] = useState<'ALL' | 'HENNGE' | 'Mercari'>('ALL');

  const nodeMap = useMemo(
    () => new Map(allNodes.map((n) => [n.id, n])),
    [allNodes]
  );

  const filtered = useMemo(
    () =>
      companyFilter === 'ALL'
        ? REQUIREMENTS
        : REQUIREMENTS.filter((r) => r.company === companyFilter),
    [companyFilter]
  );

  const henngeElectivesDone = useMemo(() => {
    return REQUIREMENTS.filter(
      (r) => r.company === 'HENNGE' && r.category === 'Elective (Pick 3)'
    ).filter((r) => getRequirementRollup(r, statuses) === 'done').length;
  }, [statuses]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
            Official Internship Requirements
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Status rolls up automatically from your roadmap node progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-900 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
            HENNGE Electives: <span className="tabular-nums">{henngeElectivesDone} / 3</span>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
            {(['ALL', 'HENNGE', 'Mercari'] as const).map((company) => (
              <button
                key={company}
                type="button"
                onClick={() => setCompanyFilter(company)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                  companyFilter === company
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {company === 'ALL' ? 'All' : company}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Requirement</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Linked Roadmap Nodes</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filtered.map((req) => {
              const rollup = getRequirementRollup(req, statuses);
              const meta = ROLLUP_META[rollup];
              const Icon = meta.icon;

              return (
                <tr key={req.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3.5 align-top">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-bold text-white ${
                        req.company === 'HENNGE'
                          ? 'bg-indigo-600 dark:bg-indigo-500'
                          : 'bg-rose-600 dark:bg-rose-500'
                      }`}
                    >
                      {req.company}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {req.title}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 max-w-md">
                      {req.description}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 align-top text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {req.category}
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {req.nodeIds.map((id) => {
                        const node = nodeMap.get(id);
                        if (!node) return null;
                        const st = statuses[id] ?? 'not_started';
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => onOpenNode(id)}
                            className={`rounded-md border px-2 py-0.5 text-xs font-medium transition-colors hover:border-blue-500 ${
                              st === 'done'
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
                                : st === 'learning'
                                ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
                                : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {node.title}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 align-top whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.badgeClass}`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {meta.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
