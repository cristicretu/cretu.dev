import { getCollection } from 'astro:content';
import { type TimelineKind, timeline } from './timeline';
import { works } from './work';

// The field starts on the first published essay — "days since i started shipping".
export const START = '2021-08-07';
const GITHUB_USER = 'cristicretu';

export type Day = {
  /** contribution level 0–4, as GitHub buckets it */
  l: number;
  /** contribution count */
  c?: number;
  /** essays published that day */
  e?: { t: string; s: string }[];
  /** other things that happened that day (timeline entries, launches) */
  ev?: Moment[];
};

export type Moment = { k: TimelineKind; t: string; h?: string };

/** Moments known only to the month or year, grouped by year. */
export type Landmarks = Record<string, Moment[]>;


let contributionsCache: Promise<Map<string, { l: number; c: number }>> | null = null;

/** Scrapes the public contribution calendar, one request per year. Fails soft to an empty map. */
function fetchContributions() {
  if (contributionsCache) return contributionsCache;
  const firstYear = Number(START.slice(0, 4));
  const lastYear = new Date().getFullYear();
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
  contributionsCache = Promise.all(
    years.map(async (y) => {
      try {
        const res = await fetch(
          `https://github.com/users/${GITHUB_USER}/contributions?from=${y}-01-01&to=${y}-12-31`
        );
        return res.ok ? await res.text() : '';
      } catch {
        return '';
      }
    })
  ).then((pages) => {
    const map = new Map<string, { l: number; c: number }>();
    for (const html of pages) {
      const ids = new Map<string, { date: string; l: number }>();
      for (const m of html.matchAll(/data-date="([\d-]+)" id="([^"]+)" data-level="(\d)"/g)) {
        ids.set(m[2], { date: m[1], l: Number(m[3]) });
      }
      // Heavy days read "100+ contributions" (a floor, not the true count) and big numbers can
      // carry commas; both used to slip past and leave the day looking empty.
      for (const m of html.matchAll(/for="([^"]+)"[^>]*>([\d,]+\+?|No) contributions?/g)) {
        const day = ids.get(m[1]);
        if (day) map.set(day.date, { l: day.l, c: m[2] === 'No' ? 0 : Number(m[2].replace(/[^\d]/g, '')) });
      }
    }
    return map;
  });
  return contributionsCache;
}

let reposCache: Promise<{ url: string; homepage: string; created: string }[]> | null = null;

/** Public repos with their creation dates; used to date work projects. Fails soft. */
function fetchRepos() {
  reposCache ??= Promise.all(
    [1, 2].map(async (page) => {
      try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&page=${page}`);
        return res.ok ? ((await res.json()) as any[]) : [];
      } catch {
        return [];
      }
    })
  ).then((pages) =>
    pages.flat().map((r) => ({
      url: String(r.html_url ?? ''),
      homepage: String(r.homepage ?? ''),
      created: String(r.created_at ?? '').slice(0, 10),
    }))
  );
  return reposCache;
}

const sameUrl = (a: string, b: string) =>
  !!a && !!b && a.replace(/\/+$/, '').replace(/^https?:\/\//, '') === b.replace(/\/+$/, '').replace(/^https?:\/\//, '');

/** Timeline entries plus work projects, each dated as precisely as we honestly can. */
async function getMoments() {
  const repos = await fetchRepos();
  const projects = works
    .filter((w) => w.year >= Number(START.slice(0, 4)))
    .map((w) => {
      const repo = w.link ? repos.find((r) => sameUrl(r.url, w.link!) || sameUrl(r.homepage, w.link!)) : undefined;
      // A repo created in a different year than the project was listed under isn't its birthday.
      const date = repo && repo.created.startsWith(String(w.year)) ? repo.created : String(w.year);
      return { date, kind: 'launch' as const, title: w.title.toLowerCase(), href: w.link };
    });
  // Hand-written entries win over the automatic ones when both name the same thing.
  const seen = new Set(timeline.map((t) => t.title));
  return [...timeline, ...projects.filter((p) => !seen.has(p.title))];
}

/** Moments without an exact day, keyed by their month ("2025-06") or year ("2023"). */
export async function getLandmarks(): Promise<Landmarks> {
  const out: Landmarks = {};
  for (const m of await getMoments()) {
    if (m.date.length === 10) continue;
    (out[m.date.slice(0, 7)] ??= []).push({ k: m.kind, t: m.title, ...(m.href ? { h: m.href } : {}) });
  }
  return out;
}

/** Every day from START through today, in order. */
export async function getDays(): Promise<Day[]> {
  const [contributions, essays, moments] = await Promise.all([
    fetchContributions(),
    getCollection('writing'),
    getMoments(),
  ]);
  const momentsByDate = new Map<string, Moment[]>();
  for (const m of moments) {
    if (m.date.length !== 10) continue;
    const list = momentsByDate.get(m.date) ?? [];
    list.push({ k: m.kind, t: m.title, ...(m.href ? { h: m.href } : {}) });
    momentsByDate.set(m.date, list);
  }
  const essayByDate = new Map<string, { t: string; s: string }[]>();
  for (const p of essays) {
    const list = essayByDate.get(p.data.publishedAt) ?? [];
    list.push({ t: p.data.title.replace(/[.!?]+$/, '').toLowerCase(), s: p.slug });
    essayByDate.set(p.data.publishedAt, list);
  }

  // One scale for every year: GitHub buckets each year against itself, which made ordinary
  // days in a huge year look idle. Levels here are quartiles of all active days since START.
  const active: number[] = [];
  for (const [date, v] of contributions) if (date >= START && v.c > 0) active.push(v.c);
  active.sort((a, b) => a - b);
  const q = (p: number) => active[Math.min(active.length - 1, Math.floor(active.length * p))] ?? 0;
  const [q1, q2, q3] = [q(0.25), q(0.5), q(0.75)];
  const level = (c: number) => (c <= 0 ? 0 : c <= q1 ? 1 : c <= q2 ? 2 : c <= q3 ? 3 : 4);

  const days: Day[] = [];
  const end = new Date();
  for (let d = new Date(`${START}T00:00:00Z`); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    const contrib = contributions.get(key);
    const day: Day = { l: level(contrib?.c ?? 0) };
    if (contrib?.c) day.c = contrib.c;
    const essay = essayByDate.get(key);
    if (essay) day.e = essay;
    const ev = momentsByDate.get(key);
    if (ev) day.ev = ev;
    days.push(day);
  }
  return days;
}
