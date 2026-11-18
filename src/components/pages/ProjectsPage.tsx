import { FormEvent, useState } from 'react';
import { ExternalLink, Github, Plus, Trash2 } from 'lucide-react';
import { ProjectItem, RoadmapNodeData } from '../../types/roadmap';

interface ProjectsPageProps {
  projects: ProjectItem[];
  allNodes: RoadmapNodeData[];
  onUpsertProject: (project: ProjectItem) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenNode: (nodeId: string) => void;
}

const PROJECT_STATUS_STYLES: Record<ProjectItem['status'], string> = {
  planned: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  in_progress: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200',
  completed: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200',
};

export function ProjectsPage({
  projects,
  allNodes,
  onUpsertProject,
  onDeleteProject,
  onOpenNode,
}: ProjectsPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [stack, setStack] = useState('');
  const [summary, setSummary] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [deployedUrl, setDeployedUrl] = useState('');
  const [status, setStatus] = useState<ProjectItem['status']>('planned');

  const nodeTitleMap = new Map(allNodes.map((n) => [n.id, n.title]));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onUpsertProject({
      id: `proj-${Date.now()}`,
      title: title.trim(),
      status,
      stack: stack
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      summary: summary.trim(),
      githubUrl: githubUrl.trim() || undefined,
      deployedUrl: deployedUrl.trim() || undefined,
      nodeIds: [],
      requirementIds: [],
    });
    setTitle('');
    setStack('');
    setSummary('');
    setGithubUrl('');
    setDeployedUrl('');
    setStatus('planned');
    setShowForm(false);
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
            Proof-of-Skill Projects
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Track portfolio projects and which roadmap topics or requirements they prove.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>{showForm ? 'Cancel' : 'Add Project'}</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"
        >
          <input
            type="text"
            required
            placeholder="Project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectItem['status'])}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <input
            type="text"
            placeholder="Stack (comma-separated, e.g. Go, React, Docker)"
            value={stack}
            onChange={(e) => setStack(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm sm:col-span-2 dark:border-slate-700 dark:bg-slate-950"
          />
          <input
            type="url"
            placeholder="GitHub URL (optional)"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          <input
            type="url"
            placeholder="Deployed URL (optional)"
            value={deployedUrl}
            onChange={(e) => setDeployedUrl(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
          <textarea
            rows={2}
            placeholder="Short summary..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm sm:col-span-2 dark:border-slate-700 dark:bg-slate-950"
          />
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            >
              Save Project
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {projects.map((proj) => (
          <article
            key={proj.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
                  {proj.title}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                    PROJECT_STATUS_STYLES[proj.status]
                  }`}
                >
                  {proj.status.replace('_', ' ')}
                </span>
              </div>

              {proj.summary && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {proj.summary}
                </p>
              )}

              {proj.stack.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {proj.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {proj.nodeIds.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Proves:
                  </span>
                  {proj.nodeIds.map((nid) => (
                    <button
                      key={nid}
                      type="button"
                      onClick={() => onOpenNode(nid)}
                      className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-700 hover:border-blue-500 dark:border-slate-700 dark:text-slate-300"
                    >
                      {nodeTitleMap.get(nid) ?? nid}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex items-center gap-3 text-xs font-medium">
                {proj.githubUrl && (
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                  >
                    <Github className="h-3.5 w-3.5" aria-hidden="true" />
                    GitHub
                  </a>
                )}
                {proj.deployedUrl && (
                  <a
                    href={proj.deployedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    Live
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => onDeleteProject(proj.id)}
                aria-label={`Delete ${proj.title}`}
                className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
