import { useEffect } from 'react';
import { NodeStatus } from '../../types/roadmap';
import { STATUS_META } from '../ui/StatusBadge';

interface NodeContextMenuProps {
  nodeId: string;
  nodeTitle: string;
  x: number;
  y: number;
  currentStatus: NodeStatus;
  onSelectStatus: (nodeId: string, status: NodeStatus) => void;
  onClose: () => void;
}

const ORDERED_STATUSES: NodeStatus[] = ['not_started', 'learning', 'done', 'skipped'];

export function NodeContextMenu({
  nodeId,
  nodeTitle,
  x,
  y,
  currentStatus,
  onSelectStatus,
  onClose,
}: NodeContextMenuProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClick = () => onClose();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, [onClose]);

  return (
    <div
      role="menu"
      aria-label={`Set status for ${nodeTitle}`}
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
      className="fixed z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="truncate px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        {nodeTitle}
      </div>
      {ORDERED_STATUSES.map((status) => {
        const meta = STATUS_META[status];
        const Icon = meta.icon;
        const isActive = status === currentStatus;
        return (
          <button
            key={status}
            type="button"
            role="menuitem"
            onClick={() => {
              onSelectStatus(nodeId, status);
              onClose();
            }}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {meta.label}
            </span>
            {isActive && <span className="text-[10px] font-bold">Active</span>}
          </button>
        );
      })}
    </div>
  );
}
