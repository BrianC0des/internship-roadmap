import { useEffect } from 'react';
import { CheckCircle2, Clock, ExternalLink, FileText, ListTodo, Target, X } from 'lucide-react';
import { REQUIREMENTS } from '../../data/requirements';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { NodeStatus, RoadmapNodeData } from '../../types/roadmap';
import { STATUS_META, TargetBadges } from '../ui/StatusBadge';

interface NodeDetailPanelProps {
  node: RoadmapNodeData | null;
  status: NodeStatus;
  note: string;
  completedTaskIndices: number[];
  onStatusChange: (nodeId: string, status: NodeStatus) => void;
  onNoteChange: (nodeId: string, note: string) => void;
  onToggleTask: (nodeId: string, taskIndex: number) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: NodeStatus[] = ['not_started', 'learning', 'done', 'skipped'];

export function NodeDetailPanel({
  node,
  status,
  note,
  completedTaskIndices,
  onStatusChange,
  onNoteChange,
  onToggleTask,
  onClose,
}: NodeDetailPanelProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    if (!node) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [node, onClose]);

  if (!node) return null;

  const linkedReqs = REQUIREMENTS.filter((r) => node.requirementIds.includes(r.id));

  const containerClass = isMobile
    ? 'fixed inset-x-0 bottom-0 z-40 max-h-[82vh] rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900'
    : 'fixed top-0 right-0 z-40 h-full w-full max-w-md border-l border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900';

  return (
    <>
      {isMobile && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        aria-label={`Topic details for ${node.title}`}
        className={`${containerClass} flex flex-col overflow-hidden`}
      >
        {isMobile && (
          <div className="flex justify-center pt-2.5 pb-1">
            <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {node.section}
              </span>
              {node.level && (
                <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  {node.level}
                </span>
              )}
              <TargetBadges targets={node.targets} />
              {node.estimatedHours && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {node.estimatedHours}h
                </span>
              )}
            </div>
            <h2 className="mt-1.5 font-display text-lg font-bold text-slate-900 dark:text-slate-50">
              {node.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {/* Status controls */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Progress Status
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((option) => {
                const meta = STATUS_META[option];
                const Icon = meta.icon;
                const active = status === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onStatusChange(node.id, option)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      active
                        ? 'border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600 dark:border-blue-400 dark:bg-blue-950/60 dark:text-blue-200'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              What to Learn
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {node.description}
            </p>
          </div>

          {/* Definition of Done / Tasks */}
          {node.tasks && node.tasks.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  <ListTodo className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  <span>To-Do to Mark Done</span>
                </div>
                <span className="text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">
                  {completedTaskIndices.length}/{node.tasks.length}
                </span>
              </div>

              <ul className="mt-2.5 space-y-3">
                {node.tasks.map((task, idx) => {
                  const checked = completedTaskIndices.includes(idx);
                  const title = typeof task === 'string' ? task : task.title;
                  const guide = typeof task === 'string' ? null : task.guide;
                  return (
                    <li key={idx} className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800/80 dark:bg-slate-900/50">
                      <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleTask(node.id, idx)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                        <div className="min-w-0">
                          <div className={`font-semibold ${checked ? 'line-through opacity-60' : ''}`}>
                            {title}
                          </div>
                          {guide && (
                            <p className={`mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 ${checked ? 'opacity-60' : ''}`}>
                              {guide}
                            </p>
                          )}
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>

              {completedTaskIndices.length === node.tasks.length && status !== 'done' && (
                <button
                  type="button"
                  onClick={() => onStatusChange(node.id, 'done')}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  All tasks complete — Mark Node Done
                </button>
              )}
            </div>
          )}

          {/* Why it matters + Requirements */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <Target className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span>Why It Matters</span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {node.whyItMatters}
            </p>
            {linkedReqs.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {linkedReqs.map((req) => (
                  <span
                    key={req.id}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {req.company}:
                    </span>
                    <span>{req.title}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Free resources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Free Resources
            </h3>
            {node.resources.length === 0 ? (
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                No links added yet — edit{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] dark:bg-slate-800">
                  src/data/nodes.ts
                </code>{' '}
                to add resources.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {node.resources.map((res) => (
                  <li key={res.url}>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-800 dark:text-slate-200 dark:hover:border-blue-600 dark:hover:bg-blue-950/30"
                    >
                      <span className="truncate">{res.title}</span>
                      <span className="flex items-center gap-1.5 shrink-0 text-xs text-slate-500 dark:text-slate-400">
                        {res.type && <span className="capitalize">{res.type}</span>}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Personal Notes */}
          <div>
            <label
              htmlFor={`note-${node.id}`}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Personal Notes (Saved Locally)</span>
            </label>
            <textarea
              id={`note-${node.id}`}
              rows={4}
              value={note}
              onChange={(e) => onNoteChange(node.id, e.target.value)}
              placeholder="Write commands, key takeaways, or links to your practice repo..."
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
        </div>
      </aside>
    </>
  );
}
