import { FormEvent, useEffect, useState } from 'react';
import {
  BookOpen,
  Briefcase,
  Building2,
  CalendarClock,
  ExternalLink,
  Layers,
  ListChecks,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { COMPANY_PROFILES } from '../../data/companies';
import { ScheduleUpdateItem } from '../../types/roadmap';

interface LiveScheduleEntry {
  sourceUrl: string;
  ok: boolean;
  statusLabel: string;
  highlights: string[];
  note: string;
}

interface LiveSchedulesPayload {
  lastCheckedAt: string | null;
  hennge: LiveScheduleEntry;
  mercari: LiveScheduleEntry;
}

interface CompaniesPageProps {
  updates: ScheduleUpdateItem[];
  onAddUpdate: (update: ScheduleUpdateItem) => void;
  onDeleteUpdate: (updateId: string) => void;
}

export function CompaniesPage({
  updates,
  onAddUpdate,
  onDeleteUpdate,
}: CompaniesPageProps) {
  const [selectedId, setSelectedId] = useState<'hennge' | 'mercari'>('hennge');
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateDate, setUpdateDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [updateDetail, setUpdateDetail] = useState('');
  const [liveData, setLiveData] = useState<LiveSchedulesPayload | null>(null);

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/live-schedules.json`;
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: LiveSchedulesPayload | null) => {
        if (json) setLiveData(json);
      })
      .catch(() => {
        // Ignore offline/missing file errors
      });
  }, []);

  const company = COMPANY_PROFILES.find((c) => c.id === selectedId) ?? COMPANY_PROFILES[0];
  const companyUpdates = updates.filter((u) => u.companyId === company.id);
  const liveEntry = liveData ? liveData[company.id] : null;

  const handleAddUpdate = (e: FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim()) return;
    onAddUpdate({
      id: `upd-${Date.now()}`,
      companyId: company.id,
      date: updateDate || 'Note',
      title: updateTitle.trim(),
      detail: updateDetail.trim(),
    });
    setUpdateTitle('');
    setUpdateDetail('');
    setShowUpdateForm(false);
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      {/* Header + Company Switcher */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
            Company Intel &amp; Hiring Schedules
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Understand each company&apos;s products, intern role, tech stack, culture, and application cadence.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Select company"
          className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800"
        >
          {COMPANY_PROFILES.map((profile) => {
            const active = profile.id === company.id;
            return (
              <button
                key={profile.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedId(profile.id)}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors sm:text-sm ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {profile.id === 'hennge' ? 'HENNGE' : 'Mercari'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Company Banner */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block rounded px-2 py-0.5 text-xs font-bold text-white ${
                  company.id === 'hennge'
                    ? 'bg-indigo-600 dark:bg-indigo-500'
                    : 'bg-rose-600 dark:bg-rose-500'
                }`}
              >
                {company.id === 'hennge' ? 'HENNGE GIP' : 'Mercari SWE'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {company.headquarters} · Founded {company.founded}
              </span>
            </div>
            <h3 className="mt-2 font-display text-lg font-bold text-slate-900 dark:text-slate-50">
              {company.name} — {company.roleTitle}
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              &ldquo;{company.tagline}&rdquo; · Language: {company.corporateLanguage}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {company.officialLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:bg-blue-50/60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
              >
                <span>{link.label}</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Schedule & Patterns + Updates Tracker */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
              Hiring Schedule &amp; Cohort Patterns
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowUpdateForm((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{showUpdateForm ? 'Cancel' : 'Log Schedule Update'}</span>
          </button>
        </div>

        <div className="mt-3 rounded-lg bg-slate-50 p-3.5 text-sm dark:bg-slate-950/60">
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            Model: {company.hiringSchedule.model}
          </div>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {company.hiringSchedule.closingPattern}
          </p>
        </div>

        {liveEntry && (
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 text-xs dark:border-blue-900/60 dark:bg-blue-950/30">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-200">
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Live Scraper Status: {liveEntry.statusLabel}</span>
              </div>
              <span className="font-mono text-[11px] text-blue-700 dark:text-blue-300">
                {liveData?.lastCheckedAt
                  ? `Checked ${new Date(liveData.lastCheckedAt).toLocaleString()}`
                  : 'Not yet scraped'}
              </span>
            </div>
            <p className="mt-1 text-blue-800 dark:text-blue-300">{liveEntry.note}</p>
            {liveEntry.highlights.length > 0 && (
              <ul className="mt-2 space-y-1 text-blue-900 dark:text-blue-200">
                {liveEntry.highlights.map((h) => (
                  <li key={h}>• {h}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {showUpdateForm && (
          <form
            onSubmit={handleAddUpdate}
            className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-950"
          >
            <input
              type="text"
              required
              placeholder="Update title (e.g. Batch 2 opened)"
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm sm:col-span-2 dark:border-slate-700 dark:bg-slate-900"
            />
            <input
              type="date"
              value={updateDate}
              onChange={(e) => setUpdateDate(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <textarea
              rows={2}
              placeholder="Details, deadlines, or portal notes..."
              value={updateDetail}
              onChange={(e) => setUpdateDetail(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm sm:col-span-3 dark:border-slate-700 dark:bg-slate-900"
            />
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Save Update
              </button>
            </div>
          </form>
        )}

        {/* Schedule Updates Feed */}
        {companyUpdates.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Schedule Updates &amp; Notes
            </h4>
            {companyUpdates.map((upd) => (
              <div
                key={upd.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 px-3.5 py-2.5 dark:border-slate-800"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {upd.date}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {upd.title}
                    </span>
                  </div>
                  {upd.detail && (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {upd.detail}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteUpdate(upd.id)}
                  aria-label={`Delete update ${upd.title}`}
                  className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Typical Batches Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2 pr-4">Cohort / Batch</th>
                <th className="py-2 pr-4">Typical Window</th>
                <th className="py-2 pr-4">Duration</th>
                <th className="py-2">Pattern Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {company.hiringSchedule.typicalBatches.map((batch) => (
                <tr key={batch.label}>
                  <td className="py-2.5 pr-4 font-semibold text-slate-900 dark:text-slate-100">
                    {batch.label}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {batch.window}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {batch.duration}
                  </td>
                  <td className="py-2.5 text-xs text-slate-600 dark:text-slate-400">
                    {batch.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selection Pipeline */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {company.hiringSchedule.selectionSteps.map((s) => (
            <div
              key={s.step}
              className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {s.step}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {s.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Actionable Tips */}
        <ul className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          {company.hiringSchedule.actionableTips.map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Two-Column Deep Dive: Business + Your Job */}
      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
              What the Company Does
            </h3>
          </div>
          <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {company.whatTheyDo.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
              Your Job as an Intern
            </h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {company.yourJobAsIntern.summary}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            Schedule &amp; Location: {company.yourJobAsIntern.workHoursAndLocation}
          </p>
          <div className="mt-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Relocation &amp; Mentorship Support
            </h4>
            <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
              {company.yourJobAsIntern.supportProvided.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Tech Stack + Culture & Values */}
      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
              Production Tech Stack
            </h3>
          </div>
          <div className="mt-3 space-y-3">
            {company.techStack.map((group) => (
              <div key={group.category}>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {group.category}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {group.items.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
              Engineering Culture &amp; Values
            </h3>
          </div>
          <div className="mt-3 space-y-3">
            {company.cultureAndValues.map((val) => (
              <div
                key={val.title}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50"
              >
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {val.title}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {val.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
              <span>What They Screen For</span>
            </div>
            <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
              {company.yourJobAsIntern.whatTheyLookFor.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Intern & Employee Blogs / Articles */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
            Intern &amp; Employee Experience Blogs
          </h3>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Firsthand accounts from past interns, Filipino alumni, and engineering teams.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {company.articlesAndBlogs.map((post) => (
            <a
              key={post.url}
              href={post.url}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:border-blue-400 hover:bg-blue-50/40 dark:border-slate-800 dark:hover:border-blue-600 dark:hover:bg-blue-950/20"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {post.category}
                  </span>
                  <ExternalLink
                    className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    aria-hidden="true"
                  />
                </div>
                <h4 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-300">
                  {post.title}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {post.summary}
                </p>
              </div>
              <div className="mt-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {post.author}
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
