import { describe, expect, it } from 'vitest';
import {
  calculateProgress,
  calculateSectionProgress,
  getNextUpNodes,
  getRequirementRollup,
} from './progress';
import { NodeStatus, Requirement, RoadmapNodeData } from '../types/roadmap';

const makeNode = (
  id: string,
  overrides: Partial<RoadmapNodeData> = {}
): RoadmapNodeData => ({
  id,
  title: id,
  kind: 'main',
  track: 'shared',
  targets: ['H', 'M'],
  section: 'Core',
  order: 1,
  description: '',
  whyItMatters: '',
  requirementIds: [],
  resources: [],
  ...overrides,
});

describe('calculateProgress', () => {
  it('ignores section label nodes and computes percentage accurately', () => {
    const nodes = [
      makeNode('sec-1', { kind: 'section' }),
      makeNode('a'),
      makeNode('b'),
      makeNode('c'),
      makeNode('d'),
    ];
    const statuses: Record<string, NodeStatus> = {
      a: 'done',
      b: 'learning',
      c: 'not_started',
      d: 'done',
    };

    const result = calculateProgress(nodes, statuses);
    expect(result).toEqual({
      total: 4,
      done: 2,
      learning: 1,
      skipped: 0,
      notStarted: 1,
      percent: 50,
    });
  });

  it('excludes skipped nodes from denominator', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const statuses: Record<string, NodeStatus> = {
      a: 'done',
      b: 'skipped',
      c: 'not_started',
    };

    const result = calculateProgress(nodes, statuses);
    expect(result.percent).toBe(50);
    expect(result.skipped).toBe(1);
  });

  it('returns 0% when all nodes are skipped or list is empty', () => {
    expect(calculateProgress([], {}).percent).toBe(0);
    expect(
      calculateProgress([makeNode('a')], { a: 'skipped' }).percent
    ).toBe(0);
  });
});

describe('calculateSectionProgress', () => {
  it('groups progress by section', () => {
    const nodes = [
      makeNode('a', { section: 'Foundations' }),
      makeNode('b', { section: 'Foundations' }),
      makeNode('c', { section: 'Cloud' }),
    ];
    const statuses: Record<string, NodeStatus> = { a: 'done', c: 'done' };

    const sections = calculateSectionProgress(nodes, statuses);
    expect(sections).toHaveLength(2);
    expect(sections[0].section).toBe('Foundations');
    expect(sections[0].summary.percent).toBe(50);
    expect(sections[1].section).toBe('Cloud');
    expect(sections[1].summary.percent).toBe(100);
  });
});

describe('getNextUpNodes', () => {
  it('prioritizes learning nodes, then walks main nodes and their subtopics in spine order', () => {
    const nodes = [
      makeNode('done-main', { kind: 'main', order: 10 }),
      makeNode('done-main-sub', { kind: 'subtopic', parentId: 'done-main', order: 1 }),
      makeNode('next-main', { kind: 'main', order: 20 }),
      makeNode('next-main-sub', { kind: 'subtopic', parentId: 'next-main', order: 1 }),
      makeNode('later-main', { kind: 'main', order: 30 }),
      makeNode('learning-node', { kind: 'subtopic', parentId: 'later-main', order: 1 }),
    ];
    const statuses: Record<string, NodeStatus> = {
      'done-main': 'done',
      'learning-node': 'learning',
    };

    const next = getNextUpNodes(nodes, statuses, 4);
    expect(next.map((n) => n.id)).toEqual([
      'learning-node',
      'done-main-sub',
      'next-main',
      'next-main-sub',
    ]);
  });
});

describe('getRequirementRollup', () => {
  const req: Requirement = {
    id: 'req-1',
    company: 'HENNGE',
    title: 'Stack',
    category: 'Core',
    description: '',
    nodeIds: ['go', 'react'],
  };

  it('returns not_started when no linked nodes have started', () => {
    expect(getRequirementRollup(req, {})).toBe('not_started');
  });

  it('returns in_progress when one node is learning or done', () => {
    expect(getRequirementRollup(req, { go: 'done' })).toBe('in_progress');
    expect(getRequirementRollup(req, { react: 'learning' })).toBe('in_progress');
  });

  it('returns done when all nodes are done or skipped with at least one done', () => {
    expect(
      getRequirementRollup(req, { go: 'done', react: 'skipped' })
    ).toBe('done');
  });

  it('does not mark done if all linked nodes are skipped', () => {
    expect(
      getRequirementRollup(req, { go: 'skipped', react: 'skipped' })
    ).toBe('not_started');
  });
});
