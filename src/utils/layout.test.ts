import { describe, expect, it } from 'vitest';
import { ROADMAP_NODES } from '../data/nodes';
import { buildRoadmapFlow } from './layout';

describe('buildRoadmapFlow', () => {
  it('generates nodes and edges for every track', () => {
    for (const track of ['shared', 'hennge', 'mercari'] as const) {
      const trackNodes = ROADMAP_NODES.filter((n) => n.track === track);
      const { flowNodes, flowEdges } = buildRoadmapFlow({
        nodes: trackNodes,
        statuses: {},
        collapsedNodeIds: [],
        searchQuery: '',
        onToggleCollapse: () => {},
      });

      expect(flowNodes.length).toBeGreaterThan(0);
      expect(flowEdges.length).toBeGreaterThan(0);
    }
  });
});
