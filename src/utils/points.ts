import { PersistedState, RoadmapNodeData } from '../types/roadmap';
import { calculateProgress } from './progress';

export interface PointsBreakdown {
  totalPoints: number;
  nodePoints: number;
  taskPoints: number;
  notePoints: number;
  projectPoints: number;
  doneNodes: number;
  completedTasksCount: number;
  completedProjectsCount: number;
  overallPercent: number;
}

export const POINT_VALUES = {
  mainDone: 100,
  mainLearning: 25,
  subtopicDone: 50,
  subtopicLearning: 15,
  optionalDone: 40,
  optionalLearning: 10,
  taskChecked: 15,
  noteWritten: 10,
  projectCompleted: 150,
  projectInProgress: 50,
} as const;

export function calculatePoints(
  nodes: RoadmapNodeData[],
  state: Pick<PersistedState, 'statuses' | 'notes' | 'completedTasks' | 'projects'>
): PointsBreakdown {
  let nodePoints = 0;
  let taskPoints = 0;
  let notePoints = 0;
  let projectPoints = 0;
  let doneNodes = 0;
  let completedTasksCount = 0;
  let completedProjectsCount = 0;

  for (const node of nodes) {
    if (node.kind === 'section') continue;
    const status = state.statuses[node.id] ?? 'not_started';

    if (status === 'done') {
      doneNodes += 1;
      if (node.kind === 'main') nodePoints += POINT_VALUES.mainDone;
      else if (node.kind === 'subtopic') nodePoints += POINT_VALUES.subtopicDone;
      else if (node.kind === 'optional') nodePoints += POINT_VALUES.optionalDone;
    } else if (status === 'learning') {
      if (node.kind === 'main') nodePoints += POINT_VALUES.mainLearning;
      else if (node.kind === 'subtopic') nodePoints += POINT_VALUES.subtopicLearning;
      else if (node.kind === 'optional') nodePoints += POINT_VALUES.optionalLearning;
    }

    const checked = state.completedTasks[node.id] ?? [];
    if (checked.length > 0) {
      const validMax = node.tasks ? node.tasks.length : checked.length;
      const count = Math.min(checked.length, validMax);
      completedTasksCount += count;
      taskPoints += count * POINT_VALUES.taskChecked;
    }

    const note = state.notes[node.id];
    if (typeof note === 'string' && note.trim().length > 0) {
      notePoints += POINT_VALUES.noteWritten;
    }
  }

  for (const project of state.projects) {
    if (project.status === 'completed') {
      completedProjectsCount += 1;
      projectPoints += POINT_VALUES.projectCompleted;
    } else if (project.status === 'in_progress') {
      projectPoints += POINT_VALUES.projectInProgress;
    }
  }

  const progress = calculateProgress(nodes, state.statuses);

  return {
    totalPoints: nodePoints + taskPoints + notePoints + projectPoints,
    nodePoints,
    taskPoints,
    notePoints,
    projectPoints,
    doneNodes,
    completedTasksCount,
    completedProjectsCount,
    overallPercent: progress.percent,
  };
}
