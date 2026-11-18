import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowInstance,
} from '@xyflow/react';
import { Maximize2, Search, X } from 'lucide-react';
import { NodeStatus, RoadmapNodeData, Track } from '../../types/roadmap';
import { buildRoadmapFlow, RoadmapFlowNode } from '../../utils/layout';
import { ROADMAP_NODE_TYPES } from './CustomNodes';
import { NodeContextMenu } from './NodeContextMenu';
import { NodeDetailPanel } from './NodeDetailPanel';

interface RoadmapViewProps {
  allNodes: RoadmapNodeData[];
  statuses: Record<string, NodeStatus>;
  notes: Record<string, string>;
  completedTasks: Record<string, number[]>;
  collapsedNodeIds: string[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onStatusChange: (nodeId: string, status: NodeStatus) => void;
  onNoteChange: (nodeId: string, note: string) => void;
  onToggleTask: (nodeId: string, taskIndex: number) => void;
  onToggleCollapse: (nodeId: string) => void;
}

const TRACK_TABS: Array<{ id: Track; label: string }> = [
  { id: 'shared', label: 'Shared Core' },
  { id: 'hennge', label: 'HENNGE-only' },
  { id: 'mercari', label: 'Mercari-only' },
];

export function RoadmapView({
  allNodes,
  statuses,
  notes,
  completedTasks,
  collapsedNodeIds,
  selectedNodeId,
  onSelectNode,
  onStatusChange,
  onNoteChange,
  onToggleTask,
  onToggleCollapse,
}: RoadmapViewProps) {
  const [activeTrack, setActiveTrack] = useState<Track>('shared');
  const [searchQuery, setSearchQuery] = useState('');
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<RoadmapFlowNode> | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    nodeId: string;
    nodeTitle: string;
    x: number;
    y: number;
  } | null>(null);

  // If a node is selected from Next Up or Requirements, switch to its tab automatically
  useEffect(() => {
    if (!selectedNodeId) return;
    const target = allNodes.find((n) => n.id === selectedNodeId);
    if (target && target.track !== activeTrack) {
      setActiveTrack(target.track);
    }
  }, [selectedNodeId, allNodes, activeTrack]);

  const trackNodes = useMemo(
    () => allNodes.filter((n) => n.track === activeTrack),
    [allNodes, activeTrack]
  );

  const { flowNodes, flowEdges } = useMemo(
    () =>
      buildRoadmapFlow({
        nodes: trackNodes,
        statuses,
        collapsedNodeIds,
        searchQuery,
        onToggleCollapse,
      }),
    [trackNodes, statuses, collapsedNodeIds, searchQuery, onToggleCollapse]
  );

  // Re-fit view when switching tabs
  useEffect(() => {
    if (!rfInstance) return;
    const timer = setTimeout(() => {
      rfInstance.fitView({ padding: 0.08, maxZoom: 1.15, duration: 220 });
    }, 40);
    return () => clearTimeout(timer);
  }, [activeTrack, rfInstance]);

  const handleFitScreen = useCallback(() => {
    rfInstance?.fitView({ padding: 0.08, maxZoom: 1.15, duration: 250 });
  }, [rfInstance]);

  const selectedNode = useMemo(
    () => allNodes.find((n) => n.id === selectedNodeId) ?? null,
    [allNodes, selectedNodeId]
  );

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Sub-toolbar: Track Tabs + Search + Fit */}
      <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-2.5 sm:px-6 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="Roadmap tracks" className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
            {TRACK_TABS.map((tab) => {
              const active = activeTrack === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTrack(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 min-w-[220px]">
            <div className="relative w-full max-w-xs">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics..."
                aria-label="Search roadmap topics"
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pr-8 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleFitScreen}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Fit Screen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-b border-slate-200 bg-white px-4 py-1.5 text-[11px] text-slate-500 sm:px-6 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <span>Click any node for resources &amp; notes. Right-click to change status.</span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" /> Not started
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Learning
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Done
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full border border-dashed border-slate-400" /> Optional
            </span>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div
        className="relative w-full"
        style={{ height: 'calc(100vh - 220px)', minHeight: '540px' }}
      >
        <ReactFlow
          style={{ width: '100%', height: '100%' }}
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={ROADMAP_NODE_TYPES}
          onInit={setRfInstance}
          onNodeClick={(_event, node) => {
            if (node.type === 'section') return;
            onSelectNode(node.id);
            setContextMenu(null);
          }}
          onNodeContextMenu={(event, node) => {
            if (node.type === 'section') return;
            event.preventDefault();
            const payload = node.data as { roadmapNode: RoadmapNodeData };
            setContextMenu({
              nodeId: node.id,
              nodeTitle: payload.roadmapNode.title,
              x: event.clientX,
              y: event.clientY,
            });
          }}
          onPaneClick={() => setContextMenu(null)}
          fitView
          fitViewOptions={{ padding: 0.08, maxZoom: 1.15 }}
          minZoom={0.35}
          maxZoom={1.75}
          panOnScroll
          selectionOnDrag={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} color="var(--border-subtle)" />
          <Controls showInteractive={false} />
          <MiniMap
            pannable
            zoomable
            className="hidden sm:block"
            maskColor="rgba(15, 23, 42, 0.45)"
            nodeColor={(n) => {
              const st = (n.data as { status?: NodeStatus })?.status;
              if (st === 'done') return '#059669';
              if (st === 'learning') return '#d97706';
              if (st === 'skipped') return '#94a3b8';
              return '#cbd5e1';
            }}
          />
        </ReactFlow>
      </div>

      {contextMenu && (
        <NodeContextMenu
          nodeId={contextMenu.nodeId}
          nodeTitle={contextMenu.nodeTitle}
          x={contextMenu.x}
          y={contextMenu.y}
          currentStatus={statuses[contextMenu.nodeId] ?? 'not_started'}
          onSelectStatus={onStatusChange}
          onClose={() => setContextMenu(null)}
        />
      )}

      <NodeDetailPanel
        node={selectedNode}
        status={selectedNode ? statuses[selectedNode.id] ?? 'not_started' : 'not_started'}
        note={selectedNode ? notes[selectedNode.id] ?? '' : ''}
        completedTaskIndices={selectedNode ? completedTasks[selectedNode.id] ?? [] : []}
        onStatusChange={onStatusChange}
        onNoteChange={onNoteChange}
        onToggleTask={onToggleTask}
        onClose={() => onSelectNode(null)}
      />
    </div>
  );
}
