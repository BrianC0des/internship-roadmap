import { describe, expect, it } from 'vitest';
import { calculatePoints, POINT_VALUES } from './points';
import { RoadmapNodeData } from '../types/roadmap';

const sampleNodes: RoadmapNodeData[] = [
  {
    id: 'sec-1',
    title: 'Section',
    kind: 'section',
    track: 'shared',
    targets: ['H', 'M'],
    section: 'Core',
    order: 1,
    description: '',
    whyItMatters: '',
    requirementIds: [],
    resources: [],
  },
  {
    id: 'main-1',
    title: 'Main',
    kind: 'main',
    track: 'shared',
    targets: ['H', 'M'],
    section: 'Core',
    order: 2,
    description: '',
    whyItMatters: '',
    requirementIds: [],
    resources: [],
    tasks: ['t1', 't2'],
  },
  {
    id: 'sub-1',
    title: 'Sub',
    kind: 'subtopic',
    track: 'shared',
    targets: ['H'],
    section: 'Core',
    order: 3,
    description: '',
    whyItMatters: '',
    requirementIds: [],
    resources: [],
  },
];

describe('calculatePoints', () => {
  it('awards points for done/learning nodes, tasks, notes, and projects', () => {
    const result = calculatePoints(sampleNodes, {
      statuses: { 'main-1': 'done', 'sub-1': 'learning' },
      completedTasks: { 'main-1': [0, 1] },
      notes: { 'main-1': 'My study notes' },
      projects: [
        {
          id: 'p1',
          title: 'API',
          status: 'completed',
          stack: ['Go'],
          summary: '',
          nodeIds: [],
          requirementIds: [],
        },
        {
          id: 'p2',
          title: 'UI',
          status: 'in_progress',
          stack: ['React'],
          summary: '',
          nodeIds: [],
          requirementIds: [],
        },
      ],
    });

    const expectedNode = POINT_VALUES.mainDone + POINT_VALUES.subtopicLearning;
    const expectedTasks = 2 * POINT_VALUES.taskChecked;
    const expectedNotes = POINT_VALUES.noteWritten;
    const expectedProjects = POINT_VALUES.projectCompleted + POINT_VALUES.projectInProgress;

    expect(result.nodePoints).toBe(expectedNode);
    expect(result.taskPoints).toBe(expectedTasks);
    expect(result.notePoints).toBe(expectedNotes);
    expect(result.projectPoints).toBe(expectedProjects);
    expect(result.totalPoints).toBe(
      expectedNode + expectedTasks + expectedNotes + expectedProjects
    );
    expect(result.doneNodes).toBe(1);
    expect(result.completedTasksCount).toBe(2);
    expect(result.completedProjectsCount).toBe(1);
    expect(result.overallPercent).toBe(50);
  });

  it('ignores whitespace-only notes and section nodes', () => {
    const result = calculatePoints(sampleNodes, {
      statuses: { 'sec-1': 'done' },
      completedTasks: {},
      notes: { 'main-1': '   ' },
      projects: [],
    });

    expect(result.totalPoints).toBe(0);
  });
});
