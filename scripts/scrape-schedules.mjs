#!/usr/bin/env node
/**
 * Scrapes official HENNGE GIP and Mercari internship pages/APIs
 * and writes normalized status to public/data/live-schedules.json.
 *
 * Run manually: `npm run scrape`
 * Run automatically: `.github/workflows/scrape-schedules.yml`
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '../public/data/live-schedules.json');

const USER_AGENT =
  'Mozilla/5.0 (compatible; InternshipRoadmapBot/1.0; +https://github.com/)';

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.text();
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function scrapeHennge() {
  const urls = [
    'https://hennge.com/global/gip/',
    'https://hennge.com/global/internship/',
  ];

  for (const url of urls) {
    try {
      const html = await fetchText(url);
      const text = stripHtml(html);

      // Extract batch mentions like "Batch 1", "Batch 2", etc.
      const batchMatches = Array.from(
        text.matchAll(/Batch\s*\d[^.]{0,120}/gi)
      ).map((m) => m[0].trim());

      const isClosed = /currently closed|applications are closed|no open batches/i.test(text);
      const isOpen = /apply now|open for applications|accepting applications/i.test(text);

      return {
        sourceUrl: url,
        ok: true,
        statusLabel: isClosed ? 'Closed / Waitlist' : isOpen ? 'Open / Rolling' : 'Check Portal',
        highlights: batchMatches.slice(0, 6),
        note:
          batchMatches.length > 0
            ? `Found ${batchMatches.length} batch reference(s) on HENNGE GIP.`
            : 'Fetched HENNGE GIP page; verify specific batch slots on portal.',
      };
    } catch (err) {
      // Try fallback URL
      if (url === urls[urls.length - 1]) {
        return {
          sourceUrl: url,
          ok: false,
          statusLabel: 'Fetch Failed',
          highlights: [],
          note: err instanceof Error ? err.message : 'Unknown error',
        };
      }
    }
  }
}

async function scrapeMercari() {
  // Mercari Careers & Workable/Greenhouse public endpoints
  const workableApi = 'https://apply.workable.com/api/v1/widget/accounts/mercari';
  const careersUrl = 'https://careers.mercari.com/en/search-jobs/?keyword=intern';

  try {
    const raw = await fetchText(workableApi);
    const data = JSON.parse(raw);
    const jobs = Array.isArray(data.jobs) ? data.jobs : [];
    const internJobs = jobs.filter((j) =>
      /intern|build@mercari|graduate/i.test(`${j.title ?? ''} ${j.department ?? ''}`)
    );

    return {
      sourceUrl: 'https://careers.mercari.com/',
      ok: true,
      statusLabel: internJobs.length > 0 ? `${internJobs.length} Intern/Grad Posting(s)` : 'No Active Intern Postings',
      highlights: internJobs.slice(0, 6).map((j) => `${j.title}${j.city ? ` (${j.city})` : ''}`),
      note:
        internJobs.length > 0
          ? 'Live postings pulled from Mercari Workable feed.'
          : 'No intern/Build@Mercari postings currently listed on Workable feed; check Careers site.',
    };
  } catch {
    // Fallback: HTML check on Mercari Careers
    try {
      const html = await fetchText(careersUrl);
      const text = stripHtml(html);
      const matches = Array.from(
        text.matchAll(/(?:Software Engineer Intern|Build@Mercari|Internship)[^.]{0,100}/gi)
      ).map((m) => m[0].trim());

      return {
        sourceUrl: careersUrl,
        ok: true,
        statusLabel: matches.length > 0 ? 'Listings Detected' : 'Check Careers Portal',
        highlights: Array.from(new Set(matches)).slice(0, 6),
        note: 'Checked Mercari Careers search page.',
      };
    } catch (err) {
      return {
        sourceUrl: careersUrl,
        ok: false,
        statusLabel: 'Fetch Failed',
        highlights: [],
        note: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }
}

async function main() {
  const [hennge, mercari] = await Promise.all([scrapeHennge(), scrapeMercari()]);
  const payload = {
    lastCheckedAt: new Date().toISOString(),
    hennge,
    mercari,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
  console.log(`Updated ${OUT_PATH}`);
  console.log(`HENNGE: ${hennge.statusLabel} | Mercari: ${mercari.statusLabel}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
