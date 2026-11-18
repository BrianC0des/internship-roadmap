import { ArrowRight } from 'lucide-react';
import { NodeStatus, RoadmapNodeData } from '../../types/roadmap';
import {
  calculateProgress,
  calculateSectionProgress,
  getNextUpNodes,
} from '../../utils/progress';

interface ProgressHeaderProps {
  nodes: RoadmapNodeData[];
  statuses: Record<string, NodeStatus>;
  onSelectNode: (nodeId: string) => void;
}

export function ProgressHeader({
  nodes,
  statuses,
  onSelectNode,
}: ProgressHeaderProps) {
  const overall = calculateProgress(nodes, statuses);
  const sections = calculateSectionProgress(nodes, statuses);
  const nextUp = getNextUpNodes(nodes, statuses, 3);

  return (
    <section
      aria-label="Roadmap progress summary"
      className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 dark:border-slate-800 dark:bg-slate-900/70"
    >
      <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Overall + Section % */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-50 tabular-nums">
              {overall.percent}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              ({overall.done}/{overall.total - overall.skipped} active done
              {overall.learning > 0 ? ` · ${overall.learning} learning` : ''})
            </span>
          </div>

          <div className="h-2 w-full max-w-xl overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-300 dark:bg-emerald-500"
              style={{ width: `${overall.percent}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {sections.map(({ section, summary }) => (
              <span
                key={section}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              >
                <span>{section}</span>
                <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {summary.percent}%
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Next Up */}
        {nextUp.length > 0 && (
          <div className="flex flex-col gap-1.5 lg:items-end">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Next Up
            </span>
            <div className="flex flex-wrap gap-1.5">
              {nextUp.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => onSelectNode(node.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-800 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-blue-950/40"
                >
                  <span>{node.title}</span>
                  <ArrowRight className="h-3 w-3 opacity-60" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
