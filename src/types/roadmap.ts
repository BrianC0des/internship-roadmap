export type NodeStatus = 'not_started' | 'learning' | 'done' | 'skipped';

export type NodeKind = 'main' | 'subtopic' | 'optional' | 'section';

export type Track = 'shared' | 'hennge' | 'mercari';

export type InternshipTarget = 'H' | 'M';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface NodeTask {
  title: string;
  /** Plain-English explanation of what it means and step-by-step instructions */
  guide: string;
}

export interface ResourceLink {
  title: string;
  url: string;
  type?: 'docs' | 'course' | 'video' | 'article' | 'practice';
}

export interface RoadmapNodeData {
  id: string;
  title: string;
  kind: NodeKind;
  /** Which tab this node belongs to */
  track: Track;
  /** Internship badges rendered on the node: H = HENNGE, M = Mercari */
  targets: InternshipTarget[];
  /** Section name used for grouping progress % */
  section: string;
  /**
   * Parent node ID.
   * - For `subtopic` / `optional`: connects from this parent node.
   * - For `main`: if omitted, auto-connects from the previous `main` node on the spine.
   */
  parentId?: string;
  /** Branch direction for subtopic/optional nodes; auto-alternates if omitted */
  side?: 'left' | 'right';
  /** Ordering index along the spine or within a parent's branches */
  order: number;
  description: string;
  whyItMatters: string;
  /** IDs of official requirements in src/data/requirements.ts */
  requirementIds: string[];
  resources: ResourceLink[];
  estimatedHours?: number;
  /** Difficulty tier for beginner-to-advanced progression */
  level?: SkillLevel;
  /** Concrete Definition-of-Done tasks to complete before moving on */
  tasks?: Array<string | NodeTask>;
  /** Optional manual coordinate override (skips auto-layout for this node) */
  position?: { x: number; y: number };
}

export interface Requirement {
  id: string;
  company: 'HENNGE' | 'Mercari';
  title: string;
  category: 'Core' | 'Elective (Pick 3)' | 'Profile & Language';
  description: string;
  /** Roadmap node IDs that satisfy this requirement */
  nodeIds: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  status: 'planned' | 'in_progress' | 'completed';
  stack: string[];
  summary: string;
  githubUrl?: string;
  deployedUrl?: string;
  nodeIds: string[];
  requirementIds: string[];
}

export interface AppSettings {
  henngeTargetDate: string;
  mercariTargetDate: string;
  darkMode: boolean;
}

export interface ScheduleBatch {
  label: string;
  window: string;
  duration: string;
  notes: string;
}

export interface ScheduleUpdateItem {
  id: string;
  companyId: 'hennge' | 'mercari';
  date: string;
  title: string;
  detail: string;
}

export interface CompanyProfile {
  id: 'hennge' | 'mercari';
  name: string;
  roleTitle: string;
  tagline: string;
  founded: string;
  headquarters: string;
  corporateLanguage: string;
  officialLinks: Array<{ label: string; url: string }>;
  whatTheyDo: string[];
  yourJobAsIntern: {
    summary: string;
    workHoursAndLocation: string;
    supportProvided: string[];
    whatTheyLookFor: string[];
  };
  techStack: Array<{ category: string; items: string[] }>;
  cultureAndValues: Array<{ title: string; detail: string }>;
  articlesAndBlogs: Array<{
    title: string;
    author: string;
    category: 'Intern Experience' | 'Employee & Engineering' | 'Alumni & Recruiting';
    url: string;
    summary: string;
  }>;
  hiringSchedule: {
    model: string;
    closingPattern: string;
    typicalBatches: ScheduleBatch[];
    selectionSteps: Array<{ step: string; detail: string }>;
    actionableTips: string[];
  };
}

export interface PersistedState {
  statuses: Record<string, NodeStatus>;
  notes: Record<string, string>;
  completedTasks: Record<string, number[]>;
  collapsedNodeIds: string[];
  projects: ProjectItem[];
  companyUpdates: ScheduleUpdateItem[];
  settings: AppSettings;
}

export interface ProgressSummary {
  total: number;
  done: number;
  learning: number;
  skipped: number;
  notStarted: number;
  /** Percentage of non-skipped completable nodes that are marked done (0-100) */
  percent: number;
}

export type RequirementRollupStatus = 'not_started' | 'in_progress' | 'done';
