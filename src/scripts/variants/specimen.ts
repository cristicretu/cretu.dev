/* A month's bunch outside the meadow: pressed beside an essay, beside its title in the writing
   index, or lifted off the meadow as the page turns to an essay.

   The plan (which species each month grows, and how tall) depends only on the data, so the
   server works it out and hands a page just the one month it needs. The bunch is then built and
   drawn exactly as the meadow draws it, so the flower you clicked is the flower you find. */

import type { Day } from '../field-kit';
import { type Sprig, buildSprig, chooseSpecies } from './sprigs';

/** Sprigs are grown at this reference width (the meadow uses the same). */
export const REF = 100;
const DAY_MS = 86400000;

export type MonthPlan = { m: number; key: string; first: number; len: number; h: number; species: string; seed: number };

/** Everything needed to grow one month's bunch away from the meadow. */
export type SpecimenData = {
  key: string;
  first: number;
  len: number;
  h: number;
  species: string;
  seed: number;
  today: number;
  /** the month's days, from `first` */
  days: Day[];
  /** the day to pick out, if any (an essay's flower) */
  pick?: number;
};

/** Month index of each day since `start` (YYYY-MM-DD), the way the meadow counts them. */
export function monthIndex(start: string, n: number) {
  const t0 = Date.parse(`${start}T00:00:00Z`), d0 = new Date(t0);
  const y0 = d0.getUTCFullYear(), m0 = d0.getUTCMonth();
  const mi = new Uint16Array(n), keys: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(t0 + i * DAY_MS);
    mi[i] = (d.getUTCFullYear() - y0) * 12 + d.getUTCMonth() - m0;
    keys[mi[i]] ??= `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  }
  return { mi, keys };
}

/** Which species every month grows and how tall: busier months stand taller. */
export function planMonths(days: Day[], mi: ArrayLike<number>, keys: string[]): MonthPlan[] {
  const n = days.length, months = mi[n - 1] + 1;
  const first = new Int32Array(months).fill(-1), len = new Uint16Array(months);
  for (let i = 0; i < n; i++) {
    if (first[mi[i]] < 0) first[mi[i]] = i;
    len[mi[i]]++;
  }
  let best = 1;
  const weight = new Float32Array(months);
  for (let m = 0; m < months; m++) {
    for (let i = first[m]; i < first[m] + len[m]; i++) weight[m] += days[i].l + (days[i].e ? 3 : 0) + (days[i].ev ? 2 : 0);
    weight[m] /= Math.max(len[m], 1);
    best = Math.max(best, weight[m]);
  }
  const plan: MonthPlan[] = [];
  let prev: string | undefined;
  for (let m = 0; m < months; m++) {
    const i0 = first[m];
    const species = chooseSpecies(days, i0, i0 + len[m], m + 1, prev);
    prev = species;
    plan.push({ m, key: keys[m], first: i0, len: len[m], h: REF * 1.15 * (0.62 + 0.38 * Math.sqrt(weight[m] / best)), species, seed: m * 131 + 7 });
  }
  return plan;
}

/** The one month a page needs, with the day to pick out. */
export function specimenFor(days: Day[], start: string, day: number): SpecimenData {
  const { mi, keys } = monthIndex(start, days.length);
  const p = planMonths(days, mi, keys)[mi[day]];
  return { key: p.key, first: p.first, len: p.len, h: p.h, species: p.species, seed: p.seed, today: days.length - 1, days: days.slice(p.first, p.first + p.len), pick: day };
}

/** Grow the bunch from a page's specimen data. */
export function growSpecimen(d: SpecimenData): Sprig {
  const all: Day[] = [];
  d.days.forEach((x, k) => (all[d.first + k] = x));
  return buildSprig(all, d.first, d.first + d.len, REF, d.h, d.species, d.seed, d.today);
}

/** The sprig-local box a bunch is framed in: a little air around the stems and blooms. */
export function frameOf(h: number) {
  return { x: -REF * 0.62, y: -h * 1.32, w: REF * 1.24, h: h * 1.32 + REF * 0.06 };
}

export type DrawOpts = {
  ink: string;
  bg: string;
  /** pen width in screen px */
  lw: number;
  /** a day to draw a touch heavier, the rest a little faded */
  pick?: number;
  /** sway in radians, about the base */
  sway?: number;
  /** 0..1 growth, stems first then organs, for arriving pages */
  grow?: number;
};

/** Draw a bunch to fill `box` (screen px) with its frame. */
export function drawSpecimen(ctx: CanvasRenderingContext2D, sprig: Sprig, h: number, box: { x: number; y: number; w: number; h: number }, o: DrawOpts) {
  const fr = frameOf(h), k = Math.min(box.w / fr.w, box.h / fr.h);
  const g = o.grow ?? 1;
  ctx.save();
  ctx.translate(box.x + (-fr.x) * k + (box.w - fr.w * k) / 2, box.y + (-fr.y) * k + (box.h - fr.h * k));
  ctx.scale(k, k);
  ctx.rotate(o.sway ?? 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = o.lw / k;
  ctx.strokeStyle = o.ink;
  const rise = Math.min(g / 0.55, 1);
  if (rise < 1) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(-REF * 2, -h * 1.3 * (1 - (1 - rise) ** 2) - 1, REF * 4, h * 1.3 + REF);
    ctx.clip();
    ctx.stroke(sprig.stems);
    ctx.restore();
  } else ctx.stroke(sprig.stems);
  for (const q of sprig.organs) {
    const a = Math.min(1, Math.max(0, -q.ay / (h * 1.3)));
    const b = g >= 1 ? 1 : Math.min(1, Math.max(0, (g - 0.55 * (1 - Math.sqrt(1 - a))) / 0.4));
    if (b <= 0) continue;
    const sc = b < 1 ? 1 + 2.2 * (b - 1) ** 3 + 1.2 * (b - 1) ** 2 : 1;
    ctx.save();
    if (sc !== 1) {
      ctx.translate(q.ax, q.ay);
      ctx.scale(Math.max(sc, 0.001), Math.max(sc, 0.001));
      ctx.translate(-q.ax, -q.ay);
      ctx.lineWidth = o.lw / k / Math.max(sc, 0.05);
    }
    const picked = o.pick === q.i;
    ctx.globalAlpha = Math.min(b * 3, 1) * (o.pick === undefined || picked ? 1 : 0.55);
    ctx.fillStyle = o.bg;
    ctx.fill(q.pens.fill);
    ctx.fillStyle = o.ink;
    if (picked) ctx.lineWidth *= 1.7;
    ctx.stroke(q.pens.line);
    ctx.fill(q.pens.ink);
    ctx.restore();
  }
  ctx.restore();
}
