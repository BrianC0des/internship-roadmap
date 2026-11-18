import { INITIAL_COMPANY_UPDATES } from '../data/companies';
import { INITIAL_PROJECTS } from '../data/projects';
import { AppSettings, NodeStatus, PersistedState, ProjectItem, ScheduleUpdateItem } from '../types/roadmap';

const STORAGE_KEY = 'japan-internship-roadmap:v1';

export const DEFAULT_SETTINGS: AppSettings = {
  henngeTargetDate: '2027-01-15',
  mercariTargetDate: '2027-02-01',
  darkMode: false,
};

export function createDefaultState(): PersistedState {
  return {
    statuses: {},
    notes: {},
    completedTasks: {},
    collapsedNodeIds: [],
    projects: INITIAL_PROJECTS,
    companyUpdates: INITIAL_COMPANY_UPDATES,
    settings: DEFAULT_SETTINGS,
  };
}

export function loadPersistedState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      statuses: parsed.statuses ?? {},
      notes: parsed.notes ?? {},
      completedTasks: parsed.completedTasks ?? {},
      collapsedNodeIds: Array.isArray(parsed.collapsedNodeIds)
        ? parsed.collapsedNodeIds
        : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : INITIAL_PROJECTS,
      companyUpdates: Array.isArray(parsed.companyUpdates)
        ? parsed.companyUpdates
        : INITIAL_COMPANY_UPDATES,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings ?? {}),
      },
    };
  } catch {
    return createDefaultState();
  }
}

export function savePersistedState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in private browsing
  }
}

export function exportStateToJson(state: PersistedState): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      ...state,
    },
    null,
    2
  );
}

const VALID_STATUSES = new Set<NodeStatus>([
  'not_started',
  'learning',
  'done',
  'skipped',
]);

export function parseImportedState(jsonText: string): PersistedState {
  const parsed = JSON.parse(jsonText) as Partial<PersistedState>;
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid JSON structure.');
  }

  const statuses: Record<string, NodeStatus> = {};
  if (parsed.statuses && typeof parsed.statuses === 'object') {
    for (const [k, v] of Object.entries(parsed.statuses)) {
      if (VALID_STATUSES.has(v as NodeStatus)) {
        statuses[k] = v as NodeStatus;
      }
    }
  }

  const notes: Record<string, string> = {};
  if (parsed.notes && typeof parsed.notes === 'object') {
    for (const [k, v] of Object.entries(parsed.notes)) {
      if (typeof v === 'string') notes[k] = v;
    }
  }

  const completedTasks: Record<string, number[]> = {};
  if (parsed.completedTasks && typeof parsed.completedTasks === 'object') {
    for (const [k, v] of Object.entries(parsed.completedTasks)) {
      if (Array.isArray(v)) {
        completedTasks[k] = v.filter((i): i is number => typeof i === 'number');
      }
    }
  }

  const projects: ProjectItem[] = Array.isArray(parsed.projects)
    ? parsed.projects
    : INITIAL_PROJECTS;

  const companyUpdates: ScheduleUpdateItem[] = Array.isArray(parsed.companyUpdates)
    ? parsed.companyUpdates
    : INITIAL_COMPANY_UPDATES;

  return {
    statuses,
    notes,
    completedTasks,
    collapsedNodeIds: Array.isArray(parsed.collapsedNodeIds)
      ? parsed.collapsedNodeIds.filter((id): id is string => typeof id === 'string')
      : [],
    projects,
    companyUpdates,
    settings: {
      ...DEFAULT_SETTINGS,
      ...(parsed.settings ?? {}),
    },
  };
}
