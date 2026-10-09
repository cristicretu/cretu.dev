/* Things that happened, beyond commits and essays. The homepage garden plants each one on its
   day: tweets and launches become seed heads, achievements and jobs become rarer growth.

   `date` can be exact (YYYY-MM-DD), a month (YYYY-MM) or a year (YYYY). Anything less precise
   than a day is pinned to its year's stake in the garden instead of a single day.

   Work projects from src/data/work.ts are added automatically; ones whose link matches a public
   GitHub repo (or its homepage) take that repo's creation date. */

export type TimelineKind = 'tweet' | 'launch' | 'achievement' | 'job' | 'talk' | 'life';

export type TimelineEntry = {
  date: string;
  kind: TimelineKind;
  title: string;
  href?: string;
};

export const timeline: TimelineEntry[] = [
  // Jobs
  { date: '2021-11', kind: 'job', title: 'joined landmarks as a front-end engineer', href: 'https://landmarks.ro/' },
  { date: '2022-05', kind: 'job', title: 'joined deta', href: 'https://deta.space/' },
  { date: '2025-06', kind: 'job', title: 'joined clujhouse', href: 'https://x.com/clujhouse' },
  { date: '2025-06', kind: 'job', title: 'joined anara', href: 'https://anara.com/' },

  // Launches and wins (dates from essays, linked tweets, or repo creation)
  { date: '2021-08-04', kind: 'launch', title: 'started cretu.dev', href: 'https://github.com/cristicretu/cretu.dev' },
  { date: '2022-02-26', kind: 'launch', title: 'browser extension prototype with @pondorasti', href: 'https://twitter.com/pondorasti/status/1497475655910' },
  { date: '2022-03-15', kind: 'launch', title: 'keep the streak', href: 'https://github.com/cristicretu/keep-the-streak' },
  { date: '2022-08-05', kind: 'launch', title: 'meshgrad', href: 'https://meshgrad.cretu.dev/' },
  { date: '2023-02-28', kind: 'launch', title: 'arc invite code cracker' },
  { date: '2023-03-08', kind: 'launch', title: 'bento cards' },
  { date: '2023-04-22', kind: 'launch', title: 'the eyeballing game', href: 'https://github.com/cristicretu/the-eyeballing-game' },
  { date: '2023-07-17', kind: 'launch', title: 'stacks', href: 'https://deta.space/discovery/@cristicretu/stacks' },
  { date: '2023-10-10', kind: 'achievement', title: 'deta space launched publicly', href: 'https://deta.space' },
  { date: '2024-01-17', kind: 'launch', title: 'swiftui splitview example', href: 'https://github.com/cristicretu/swiftui-splitview-example' },
  { date: '2024-12', kind: 'achievement', title: 'deta surf reached v0.1', href: 'https://deta.surf' },
  { date: '2024', kind: 'achievement', title: 'first book: math admission problems for ubb' },
  { date: '2025-01', kind: 'launch', title: 'palora, first swiftui app' },
  { date: '2025-02', kind: 'achievement', title: 'second book: informatics admission problems' },
  { date: '2025-02', kind: 'launch', title: 'optima' },
  { date: '2025-08', kind: 'launch', title: 'agents 2.0 at anara', href: 'https://anara.com/' },
  { date: '2025-12-23', kind: 'launch', title: 'started vinculum' },
  { date: '2026-02-18', kind: 'launch', title: 'family taste skill', href: 'https://github.com/cristicretu/family-taste-skill' },
  { date: '2026-02-19', kind: 'launch', title: 'penflow', href: 'https://penflow.cretu.dev/' },
  { date: '2026-08-04', kind: 'launch', title: 'diri', href: 'https://diri.sh' },

  // Life
  { date: '2022-11-28', kind: 'life', title: 'started driving' },
  { date: '2023-06', kind: 'life', title: 'high-school exams, into university' },
  { date: '2023-10', kind: 'life', title: 'started university' },
  { date: '2024', kind: 'life', title: 'a summer in berlin' },
  { date: '2025-08', kind: 'life', title: 'first trip to the us, san francisco' },

  // More entries, e.g.
  // { date: '2024-03-02', kind: 'tweet', title: 'family drawer, in swiftui', href: 'https://x.com/cristicrtu/status/…' },
];
