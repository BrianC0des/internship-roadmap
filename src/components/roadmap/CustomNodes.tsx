import { Handle, NodeProps, Position } from '@xyflow/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { FlowNodePayload } from '../../utils/layout';
import { STATUS_META, TargetBadges } from '../ui/StatusBadge';

function HiddenHandles() {
  return (
    <>
      <Handle type="target" position={Position.Top} id="t-top" className="!opacity-0 !pointer-events-none" />
      <Handle type="source" position={Position.Bottom} id="s-bottom" className="!opacity-0 !pointer-events-none" />
      <Handle type="source" position={Position.Left} id="s-left" className="!opacity-0 !pointer-events-none" />
      <Handle type="source" position={Position.Right} id="s-right" className="!opacity-0 !pointer-events-none" />
      <Handle type="target" position={Position.Left} id="t-left" className="!opacity-0 !pointer-events-none" />
      <Handle type="target" position={Position.Right} id="t-right" className="!opacity-0 !pointer-events-none" />
    </>
  );
}

export function SectionLabelNode({ data }: NodeProps) {
  const payload = data as FlowNodePayload;
  return (
    <div className="w-[248px] py-1 text-center select-none">
      <span className="inline-block rounded-full bg-slate-200/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        {payload.roadmapNode.title}
      </span>
    </div>
  );
}

export function MainRoadmapNode({ data, selected }: NodeProps) {
  const payload = data as FlowNodePayload;
  const { roadmapNode, status, hasChildren, isCollapsed, childCount, isSearchMatch, isSearchDimmed, onToggleCollapse } = payload;
  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;

  return (
    <div
      className={`group relative w-[248px] rounded-xl border-2 px-3.5 py-2.5 shadow-sm transition-all ${meta.nodeClass} ${
        selected ? 'ring-2 ring-blue-600 ring-offset-2 dark:ring-blue-400 dark:ring-offset-slate-950' : ''
      } ${isSearchMatch ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-950' : ''} ${
        isSearchDimmed ? 'opacity-30' : 'opacity-100'
      }`}
    >
      <HiddenHandles />
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <StatusIcon className="h-4 w-4 shrink-0 opacity-80" aria-hidden="true" />
          <span className="font-display text-sm font-bold leading-snug">
            {roadmapNode.title}
          </span>
        </div>
        <TargetBadges targets={roadmapNode.targets} />
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[11px] opacity-75">
        <span className="inline-flex items-center gap-1.5">
          {roadmapNode.level && (
            <span className="capitalize font-medium">{roadmapNode.level}</span>
          )}
          {roadmapNode.level && roadmapNode.estimatedHours && <span>·</span>}
          <span>
            {roadmapNode.estimatedHours ? `${roadmapNode.estimatedHours}h` : roadmapNode.section}
          </span>
        </span>
        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(roadmapNode.id);
            }}
            aria-label={isCollapsed ? `Expand ${roadmapNode.title} branches` : `Collapse ${roadmapNode.title} branches`}
            className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-medium hover:bg-black/5 dark:hover:bg-white/10"
          >
            {isCollapsed ? (
              <>
                <ChevronRight className="h-3 w-3" />
                <span>+{childCount}</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                <span>Hide</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function SubtopicRoadmapNode({ data, selected }: NodeProps) {
  const payload = data as FlowNodePayload;
  const { roadmapNode, status, isSearchMatch, isSearchDimmed } = payload;
  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;

  return (
    <div
      className={`relative w-[224px] rounded-lg border px-3 py-2 shadow-xs transition-all ${meta.nodeClass} ${
        selected ? 'ring-2 ring-blue-600 ring-offset-2 dark:ring-blue-400 dark:ring-offset-slate-950' : ''
      } ${isSearchMatch ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-950' : ''} ${
        isSearchDimmed ? 'opacity-30' : 'opacity-100'
      }`}
    >
      <HiddenHandles />
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <StatusIcon className="h-3.5 w-3.5 shrink-0 opacity-75" aria-hidden="true" />
          <span className="text-xs font-semibold leading-snug">
            {roadmapNode.title}
          </span>
        </div>
        <TargetBadges targets={roadmapNode.targets} />
      </div>
    </div>
  );
}

export function OptionalRoadmapNode({ data, selected }: NodeProps) {
  const payload = data as FlowNodePayload;
  const { roadmapNode, status, isSearchMatch, isSearchDimmed } = payload;
  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;

  return (
    <div
      className={`relative w-[224px] rounded-lg border border-dashed px-3 py-2 transition-all ${meta.nodeClass} ${
        selected ? 'ring-2 ring-blue-600 ring-offset-2 dark:ring-blue-400 dark:ring-offset-slate-950' : ''
      } ${isSearchMatch ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-950' : ''} ${
        isSearchDimmed ? 'opacity-30' : 'opacity-100'
      }`}
    >
      <HiddenHandles />
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <StatusIcon className="h-3.5 w-3.5 shrink-0 opacity-75" aria-hidden="true" />
          <span className="text-xs font-medium leading-snug">
            {roadmapNode.title}
          </span>
        </div>
        <TargetBadges targets={roadmapNode.targets} />
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider opacity-60">Optional</div>
    </div>
  );
}

export const ROADMAP_NODE_TYPES = {
  section: SectionLabelNode,
  main: MainRoadmapNode,
  subtopic: SubtopicRoadmapNode,
  optional: OptionalRoadmapNode,
};
