import { Edge, Node } from '@xyflow/react';
import { NodeStatus, RoadmapNodeData } from '../types/roadmap';

export interface FlowNodePayload extends Record<string, unknown> {
  roadmapNode: RoadmapNodeData;
  status: NodeStatus;
  hasChildren: boolean;
  isCollapsed: boolean;
  childCount: number;
  isSearchMatch: boolean;
  isSearchDimmed: boolean;
  onToggleCollapse: (nodeId: string) => void;
}

export type RoadmapFlowNode = Node<FlowNodePayload>;

interface LayoutOptions {
  nodes: RoadmapNodeData[];
  statuses: Record<string, NodeStatus>;
  collapsedNodeIds: string[];
  searchQuery: string;
  onToggleCollapse: (nodeId: string) => void;
}

const SPINE_NODE_WIDTH = 248;
const BRANCH_OFFSET_X = 310;
const BRANCH_ROW_HEIGHT = 82;

/**
 * Computes React Flow nodes and edges from declarative RoadmapNodeData.
 * - `section` and `main` nodes form a vertical central spine at x = 0.
 * - `subtopic` and `optional` nodes branch left/right from their `parentId`.
 * - Manual `node.position` overrides auto-layout if provided.
 */
export function buildRoadmapFlow({
  nodes,
  statuses,
  collapsedNodeIds,
  searchQuery,
  onToggleCollapse,
}: LayoutOptions): { flowNodes: RoadmapFlowNode[]; flowEdges: Edge[] } {
  const collapsedSet = new Set(collapsedNodeIds);
  const query = searchQuery.trim().toLowerCase();

  // Group branch children by parentId
  const childrenByParent = new Map<string, RoadmapNodeData[]>();
  for (const node of nodes) {
    if (node.parentId) {
      const list = childrenByParent.get(node.parentId) ?? [];
      list.push(node);
      childrenByParent.set(node.parentId, list);
    }
  }
  for (const list of childrenByParent.values()) {
    list.sort((a, b) => a.order - b.order);
  }

  const spineNodes = nodes
    .filter((n) => n.kind === 'section' || n.kind === 'main')
    .sort((a, b) => a.order - b.order);

  const flowNodes: RoadmapFlowNode[] = [];
  const flowEdges: Edge[] = [];

  let currentY = 36;
  let previousMainId: string | null = null;

  const matchesSearch = (node: RoadmapNodeData): boolean => {
    if (!query) return false;
    return (
      node.title.toLowerCase().includes(query) ||
      node.description.toLowerCase().includes(query) ||
      node.section.toLowerCase().includes(query)
    );
  };

  for (const spineNode of spineNodes) {
    if (spineNode.kind === 'section') {
      flowNodes.push({
        id: spineNode.id,
        type: 'section',
        position: spineNode.position ?? { x: -SPINE_NODE_WIDTH / 2, y: currentY },
        draggable: false,
        selectable: false,
        data: {
          roadmapNode: spineNode,
          status: 'not_started',
          hasChildren: false,
          isCollapsed: false,
          childCount: 0,
          isSearchMatch: false,
          isSearchDimmed: false,
          onToggleCollapse,
        },
      });
      currentY += 62;
      continue;
    }

    const children = childrenByParent.get(spineNode.id) ?? [];
    const isCollapsed = collapsedSet.has(spineNode.id);
    const isMatch = matchesSearch(spineNode);

    const mainPos = spineNode.position ?? {
      x: -SPINE_NODE_WIDTH / 2,
      y: currentY,
    };

    flowNodes.push({
      id: spineNode.id,
      type: 'main',
      position: mainPos,
      draggable: false,
      data: {
        roadmapNode: spineNode,
        status: statuses[spineNode.id] ?? 'not_started',
        hasChildren: children.length > 0,
        isCollapsed,
        childCount: children.length,
        isSearchMatch: isMatch,
        isSearchDimmed: Boolean(query) && !isMatch,
        onToggleCollapse,
      },
    });

    // Connect sequential main nodes along the vertical spine
    if (previousMainId) {
      flowEdges.push({
        id: `spine-${previousMainId}-${spineNode.id}`,
        source: previousMainId,
        target: spineNode.id,
        sourceHandle: 's-bottom',
        targetHandle: 't-top',
        type: 'smoothstep',
        style: { stroke: 'var(--edge-spine)', strokeWidth: 2.2 },
      });
    }
    previousMainId = spineNode.id;

    let leftCount = 0;
    let rightCount = 0;

    if (!isCollapsed && children.length > 0) {
      children.forEach((child, index) => {
        const side: 'left' | 'right' =
          child.side ?? (index % 2 === 0 ? 'left' : 'right');
        const laneIndex = side === 'left' ? leftCount++ : rightCount++;

        const childX =
          side === 'left'
            ? mainPos.x - BRANCH_OFFSET_X
            : mainPos.x + BRANCH_OFFSET_X;
        const childY = mainPos.y + laneIndex * BRANCH_ROW_HEIGHT;
        const childMatch = matchesSearch(child);

        flowNodes.push({
          id: child.id,
          type: child.kind, // 'subtopic' | 'optional'
          position: child.position ?? { x: childX, y: childY },
          draggable: false,
          data: {
            roadmapNode: child,
            status: statuses[child.id] ?? 'not_started',
            hasChildren: false,
            isCollapsed: false,
            childCount: 0,
            isSearchMatch: childMatch,
            isSearchDimmed: Boolean(query) && !childMatch,
            onToggleCollapse,
          },
        });

        flowEdges.push({
          id: `branch-${spineNode.id}-${child.id}`,
          source: spineNode.id,
          target: child.id,
          sourceHandle: side === 'left' ? 's-left' : 's-right',
          targetHandle: side === 'left' ? 't-right' : 't-left',
          type: 'smoothstep',
          style: {
            stroke: 'var(--edge-branch)',
            strokeWidth: 1.6,
            strokeDasharray: child.kind === 'optional' ? '5 4' : undefined,
          },
        });
      });
    }

    const maxBranchLanes = Math.max(leftCount, rightCount, 1);
    currentY += Math.max(106, maxBranchLanes * BRANCH_ROW_HEIGHT + 38);
  }

  return { flowNodes, flowEdges };
}
