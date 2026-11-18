import {
  NodeStatus,
  ProgressSummary,
  Requirement,
  RequirementRollupStatus,
  RoadmapNodeData,
} from '../types/roadmap';

/**
 * Computes completion metrics for a set of roadmap nodes.
 * - `section` label nodes are non-completable and ignored.
 * - `skipped` nodes are excluded from the denominator so skipping optional
 *   topics does not artificially inflate or penalize progress.
 */
export function calculateProgress(
  nodes: RoadmapNodeData[],
  statuses: Record<string, NodeStatus>
): ProgressSummary {
  const completable = nodes.filter((n) => n.kind !== 'section');

  let done = 0;
  let learning = 0;
  let skipped = 0;
  let notStarted = 0;

  for (const node of completable) {
    const status = statuses[node.id] ?? 'not_started';
    if (status === 'done') done += 1;
    else if (status === 'learning') learning += 1;
    else if (status === 'skipped') skipped += 1;
    else notStarted += 1;
  }

  const activeTotal = completable.length - skipped;
  const percent = activeTotal > 0 ? Math.round((done / activeTotal) * 100) : 0;

  return {
    total: completable.length,
    done,
    learning,
    skipped,
    notStarted,
    percent,
  };
}

/**
 * Groups progress by each node's `section` field, preserving first-seen order.
 */
export function calculateSectionProgress(
  nodes: RoadmapNodeData[],
  statuses: Record<string, NodeStatus>
): Array<{ section: string; summary: ProgressSummary }> {
  const sectionMap = new Map<string, RoadmapNodeData[]>();

  for (const node of nodes) {
    if (node.kind === 'section') continue;
    const list = sectionMap.get(node.section) ?? [];
    list.push(node);
    sectionMap.set(node.section, list);
  }

  return Array.from(sectionMap.entries()).map(([section, sectionNodes]) => ({
    section,
    summary: calculateProgress(sectionNodes, statuses),
  }));
}

/**
 * Returns up to `limit` recommended next nodes in progressive spine-and-branch order:
 * 1. Any nodes currently marked `learning` (so active work stays top-of-mind).
 * 2. Remaining `not_started` nodes walked top-to-bottom: each `main` node followed
 *    by its `subtopic` branches before advancing to the next `main` node.
 */
export function getNextUpNodes(
  nodes: RoadmapNodeData[],
  statuses: Record<string, NodeStatus>,
  limit = 4
): RoadmapNodeData[] {
  const completable = nodes.filter((n) => n.kind !== 'section');
  const inProgress = completable
    .filter((n) => statuses[n.id] === 'learning')
    .sort((a, b) => a.order - b.order);

  const childrenByParent = new Map<string, RoadmapNodeData[]>();
  for (const node of completable) {
    if (!node.parentId) continue;
    const list = childrenByParent.get(node.parentId) ?? [];
    list.push(node);
    childrenByParent.set(node.parentId, list);
  }
  for (const list of childrenByParent.values()) {
    list.sort((a, b) => a.order - b.order);
  }

  const orderedNotStarted: RoadmapNodeData[] = [];
  const seen = new Set<string>(inProgress.map((n) => n.id));

  const mainNodes = completable
    .filter((n) => n.kind === 'main')
    .sort((a, b) => a.order - b.order);

  for (const main of mainNodes) {
    if (!seen.has(main.id) && (statuses[main.id] ?? 'not_started') === 'not_started') {
      orderedNotStarted.push(main);
      seen.add(main.id);
    }
    const subtopics = (childrenByParent.get(main.id) ?? []).filter(
      (c) => c.kind === 'subtopic'
    );
    for (const sub of subtopics) {
      if (!seen.has(sub.id) && (statuses[sub.id] ?? 'not_started') === 'not_started') {
        orderedNotStarted.push(sub);
        seen.add(sub.id);
      }
    }
  }

  // Include any remaining not_started nodes (e.g. optional branches)
  for (const node of completable.sort((a, b) => a.order - b.order)) {
    if (!seen.has(node.id) && (statuses[node.id] ?? 'not_started') === 'not_started') {
      orderedNotStarted.push(node);
      seen.add(node.id);
    }
  }

  return [...inProgress, ...orderedNotStarted].slice(0, limit);
}

/**
 * Rolls up linked roadmap node statuses into an official requirement status.
 * - `done`: at least one linked node is `done` and every linked node is `done` or `skipped`
 * - `in_progress`: at least one linked node is `learning` or `done`
 * - `not_started`: otherwise (or when no nodes are linked)
 */
export function getRequirementRollup(
  requirement: Requirement,
  statuses: Record<string, NodeStatus>
): RequirementRollupStatus {
  if (requirement.nodeIds.length === 0) return 'not_started';

  const nodeStatuses = requirement.nodeIds.map((id) => statuses[id] ?? 'not_started');
  const hasDone = nodeStatuses.some((s) => s === 'done');
  const hasLearning = nodeStatuses.some((s) => s === 'learning');
  const allResolved = nodeStatuses.every((s) => s === 'done' || s === 'skipped');

  if (hasDone && allResolved) return 'done';
  if (hasDone || hasLearning) return 'in_progress';
  return 'not_started';
}
