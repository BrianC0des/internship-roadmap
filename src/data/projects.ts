import { ProjectItem } from '../types/roadmap';

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-go-api',
    title: 'Campus Event & Queue API',
    status: 'in_progress',
    stack: ['Go', 'PostgreSQL', 'Docker', 'GitHub Actions'],
    summary:
      'REST API with JWT auth, PostgreSQL migrations, table-driven Go tests, and Docker Compose.',
    githubUrl: 'https://github.com/',
    nodeIds: ['go-lang', 'sql-postgres', 'rest-apis', 'testing', 'docker', 'cicd-pipelines'],
    requirementIds: ['hennge-stack', 'hennge-docker', 'mercari-sql', 'mercari-testing'],
  },
  {
    id: 'proj-fullstack-ts',
    title: 'Interactive Study Tracker',
    status: 'completed',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    summary:
      'Accessible single-page web app with local persistence, keyboard navigation, and unit tests.',
    githubUrl: 'https://github.com/',
    deployedUrl: 'https://vercel.com/',
    nodeIds: ['typescript', 'react', 'testing', 'git-github'],
    requirementIds: ['hennge-fullstack', 'mercari-product', 'mercari-backend-frontend'],
  },
];
