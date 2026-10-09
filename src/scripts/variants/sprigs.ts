/* Hand-drawn wildflower sprigs, in the manner of a pen sketchbook: one fine line, a little
   wobble, stems that fork and cross, outline leaves with the odd solid sprig.

   A sprig is one month. Its species follows how the month went, and each day of the month is
   one organ on it: quiet days are leaves; commit days are flowers whose stage follows the
   contribution level (bud → opening → open → full, inked centre). Essays and other moments are
   the plant's own crowning flower: the same species, larger and fully open, usually at the end
   of a stem. Everything is built once into Path2D
   in sprig-local coordinates (base at 0,0, up is −y), so drawing is just transforms. */

import type { Day } from '../field-kit';

export type Pens = { line: Path2D; fill: Path2D; ink: Path2D };

export type Organ = {
  i: number;
  kind: 'leaf' | 'flower' | 'hero' | 'bud';
  /** where the day "is": the flower head or leaf middle, sprig-local */
  hx: number;
  hy: number;
  /** where it joins the stem (leaves regrow from here) */
  ax: number;
  ay: number;
  pens: Pens;
};

export type Sprig = {
  species: string;
  stems: Path2D;
  pens: Pens;
  organs: Organ[];
  /** sprig-local tip of the stem carrying today, if any */
  bud?: { x: number; y: number; r: number };
  /** showpiece blooms, for labelling */
  blooms: { i: number; x: number; y: number; r: number }[];
};

type Kind = 'daisy' | 'five' | 'cosmos' | 'bell' | 'cup' | 'umbel' | 'floret' | 'gyp' | 'berry';
type LeafKind = 'lance' | 'round' | 'needle' | 'pinnate' | 'thread' | 'solid';

type Species = {
  name: string;
  flower: Kind;
  leaf: LeafKind;
  /** pedicel length range, in sprig widths */
  ped: [number, number];
  /** flower radius, in sprig widths */
  r: number;
  /** flowers cluster this far up the stem (0 base … 1 tip) */
  from: number;
  /** pedicels branch and carry a small leaf at the fork */
  branchy?: boolean;
};

const SPECIES: Record<string, Species> = {
  daisy: { name: 'daisy', flower: 'daisy', leaf: 'lance', ped: [0.12, 0.22], r: 0.06, from: 0.45 },
  forget: { name: 'forget', flower: 'five', leaf: 'lance', ped: [0.07, 0.16], r: 0.04, from: 0.4, branchy: true },
  cosmos: { name: 'cosmos', flower: 'cosmos', leaf: 'thread', ped: [0.16, 0.26], r: 0.065, from: 0.5 },
  bell: { name: 'bell', flower: 'bell', leaf: 'lance', ped: [0.08, 0.13], r: 0.05, from: 0.35 },
  tulip: { name: 'tulip', flower: 'cup', leaf: 'lance', ped: [0.14, 0.24], r: 0.06, from: 0.55 },
  yarrow: { name: 'yarrow', flower: 'umbel', leaf: 'pinnate', ped: [0.1, 0.2], r: 0.05, from: 0.5, branchy: true },
  lavender: { name: 'lavender', flower: 'floret', leaf: 'needle', ped: [0.015, 0.03], r: 0.026, from: 0.5 },
  gyp: { name: 'gyp', flower: 'gyp', leaf: 'needle', ped: [0.08, 0.18], r: 0.03, from: 0.35, branchy: true },
  eucalyptus: { name: 'eucalyptus', flower: 'berry', leaf: 'round', ped: [0.05, 0.1], r: 0.026, from: 0.55 },
  fern: { name: 'fern', flower: 'berry', leaf: 'solid', ped: [0.04, 0.08], r: 0.022, from: 0.7 },
};

const TAU = Math.PI * 2;

/** Deterministic random stream. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Bez = { x0: number; y0: number; x1: number; y1: number; x2: number; y2: number; x3: number; y3: number };

function bezAt(b: Bez, t: number) {
  const u = 1 - t;
  return {
    x: u * u * u * b.x0 + 3 * u * u * t * b.x1 + 3 * u * t * t * b.x2 + t * t * t * b.x3,
    y: u * u * u * b.y0 + 3 * u * u * t * b.y1 + 3 * u * t * t * b.y2 + t * t * t * b.y3,
  };
}

function bezAngle(b: Bez, t: number) {
  const u = 1 - t;
  const dx = 3 * u * u * (b.x1 - b.x0) + 6 * u * t * (b.x2 - b.x1) + 3 * t * t * (b.x3 - b.x2);
  const dy = 3 * u * u * (b.y1 - b.y0) + 6 * u * t * (b.y2 - b.y1) + 3 * t * t * (b.y3 - b.y2);
  return Math.atan2(dy, dx);
}

const newPens = (): Pens => ({ line: new Path2D(), fill: new Path2D(), ink: new Path2D() });

/* ---------- pen strokes (all take a random stream for hand wobble) ---------- */

type R = () => number;
const j = (r: R, amt: number) => (r() - 0.5) * amt;

/** A gently curved line from a to b, bowed by `bow` (fraction of length). */
function curve(p: Path2D, r: R, ax: number, ay: number, bx: number, by: number, bow: number) {
  const mx = (ax + bx) / 2, my = (ay + by) / 2, len = Math.hypot(bx - ax, by - ay);
  const nx = -(by - ay) / (len || 1), ny = (bx - ax) / (len || 1);
  const k = len * bow + j(r, len * 0.08);
  p.moveTo(ax, ay);
  p.quadraticCurveTo(mx + nx * k, my + ny * k, bx + j(r, len * 0.02), by + j(r, len * 0.02));
}

/** Petal/leaf blade from base (x,y) along angle, length L, half-width W. */
function blade(p: Path2D, r: R, x: number, y: number, ang: number, L: number, W: number, tipBias = 0.6) {
  const c = Math.cos(ang), s = Math.sin(ang);
  const px = (u: number, v: number) => x + c * u - s * v, py = (u: number, v: number) => y + s * u + c * v;
  const w1 = W * (1 + j(r, 0.25)), w2 = W * (1 + j(r, 0.25));
  p.moveTo(px(0, 0), py(0, 0));
  p.bezierCurveTo(px(L * 0.25, -w1 * 1.2), py(L * 0.25, -w1 * 1.2), px(L * tipBias, -w1), py(L * tipBias, -w1), px(L, j(r, W * 0.2)), py(L, j(r, W * 0.2)));
  p.bezierCurveTo(px(L * tipBias, w2), py(L * tipBias, w2), px(L * 0.25, w2 * 1.2), py(L * 0.25, w2 * 1.2), px(0, 0), py(0, 0));
}

function circle(p: Path2D, x: number, y: number, rad: number) {
  p.moveTo(x + rad, y);
  p.arc(x, y, rad, 0, TAU);
}

/* ---------- leaves ---------- */

function leaf(P: Pens, r: R, kind: LeafKind, x: number, y: number, ang: number, L: number) {
  switch (kind) {
    case 'round': {
      // Eucalyptus: a short petiole and a coin-like leaf.
      const ex = x + Math.cos(ang) * L * 0.25, ey = y + Math.sin(ang) * L * 0.25;
      curve(P.line, r, x, y, ex, ey, 0.1);
      const rad = L * 0.42;
      const cx = ex + Math.cos(ang) * rad, cy = ey + Math.sin(ang) * rad;
      const e = new Path2D();
      e.ellipse(cx, cy, rad, rad * (0.82 + j(r, 0.1)), ang, 0, TAU);
      P.fill.addPath(e);
      P.line.addPath(e);
      curve(P.line, r, ex, ey, cx + Math.cos(ang) * rad * 0.5, cy + Math.sin(ang) * rad * 0.5, 0.05);
      return;
    }
    case 'needle': {
      const e = new Path2D();
      blade(e, r, x, y, ang, L, L * 0.07, 0.7);
      P.fill.addPath(e);
      P.line.addPath(e);
      return;
    }
    case 'pinnate': {
      // A little fern-like leaf: a rachis with paired leaflets, drawn in outline.
      const ex = x + Math.cos(ang) * L, ey = y + Math.sin(ang) * L;
      curve(P.line, r, x, y, ex, ey, 0.08);
      const e = new Path2D();
      for (let k = 1; k <= 5; k++) {
        const t = k / 6, lx = x + (ex - x) * t, ly = y + (ey - y) * t, ll = L * 0.22 * (1 - t * 0.5);
        blade(e, r, lx, ly, ang - 0.9, ll, ll * 0.22);
        blade(e, r, lx, ly, ang + 0.9, ll, ll * 0.22);
      }
      P.fill.addPath(e);
      P.line.addPath(e);
      return;
    }
    case 'thread': {
      // Cosmos foliage: thread-like, forked.
      const ex = x + Math.cos(ang) * L, ey = y + Math.sin(ang) * L;
      curve(P.line, r, x, y, ex, ey, 0.12);
      for (const side of [-1, 1]) {
        const t = 0.45 + j(r, 0.1), fx = x + (ex - x) * t, fy = y + (ey - y) * t, a = ang + side * 0.6;
        curve(P.line, r, fx, fy, fx + Math.cos(a) * L * 0.45, fy + Math.sin(a) * L * 0.45, 0.15 * side);
      }
      return;
    }
    case 'solid': {
      // Slender, willow-like: an outline and a midrib, like the rest, only narrower.
      const e = new Path2D();
      blade(e, r, x, y, ang, L * 0.75, L * 0.13);
      P.fill.addPath(e);
      P.line.addPath(e);
      curve(P.line, r, x + Math.cos(ang) * L * 0.06, y + Math.sin(ang) * L * 0.06, x + Math.cos(ang) * L * 0.6, y + Math.sin(ang) * L * 0.6, 0.04);
      return;
    }
    default: {
      const e = new Path2D();
      blade(e, r, x, y, ang, L, L * 0.18);
      P.fill.addPath(e);
      P.line.addPath(e);
      // Midrib, most of the way.
      curve(P.line, r, x + Math.cos(ang) * L * 0.08, y + Math.sin(ang) * L * 0.08, x + Math.cos(ang) * L * 0.78, y + Math.sin(ang) * L * 0.78, 0.04);
    }
  }
}

/* ---------- flowers ---------- */

/** stage: 0 bud, 1 opening, 2 open, 3 full (inked centre). */
function flower(P: Pens, r: R, kind: Kind, x: number, y: number, ang: number, rad: number, stage: number) {
  if (stage === 0 && kind !== 'floret' && kind !== 'berry' && kind !== 'gyp' && kind !== 'umbel') {
    // A closed bud with two sepals.
    const e = new Path2D();
    blade(e, r, x, y, ang, rad * 1.5, rad * 0.45, 0.45);
    P.fill.addPath(e);
    P.line.addPath(e);
    blade(P.line, r, x, y, ang - 0.5, rad * 0.7, rad * 0.12);
    blade(P.line, r, x, y, ang + 0.5, rad * 0.7, rad * 0.12);
    return;
  }
  switch (kind) {
    case 'daisy':
    case 'cosmos': {
      const n = kind === 'daisy' ? 11 + Math.floor(r() * 4) : 8;
      const inner = rad * 0.26, open = stage >= 2 ? 1 : 0.7;
      const rot = r() * TAU;
      for (let k = 0; k < n; k++) {
        const a = rot + (k / n) * TAU + j(r, 0.12);
        const L = rad * open * (0.95 + j(r, 0.2)), W = kind === 'daisy' ? rad * 0.11 : rad * 0.24;
        const e = new Path2D();
        const bx = x + Math.cos(a) * inner * 0.8, by = y + Math.sin(a) * inner * 0.8;
        if (kind === 'cosmos') {
          // Broad petal with a toothed tip.
          const c = Math.cos(a), s = Math.sin(a);
          const pt = (u: number, v: number): [number, number] => [bx + c * u - s * v, by + s * u + c * v];
          e.moveTo(...pt(0, -W * 0.3));
          e.quadraticCurveTo(...pt(L * 0.5, -W * 1.15), ...pt(L, -W * 0.7));
          e.lineTo(...pt(L * 0.93, -W * 0.25));
          e.lineTo(...pt(L * 1.02, 0));
          e.lineTo(...pt(L * 0.93, W * 0.25));
          e.lineTo(...pt(L, W * 0.7));
          e.quadraticCurveTo(...pt(L * 0.5, W * 1.15), ...pt(0, W * 0.3));
        } else {
          blade(e, r, bx, by, a, L - inner * 0.6, W, 0.55);
        }
        P.fill.addPath(e);
        P.line.addPath(e);
      }
      // The disc stays drawn, never filled: fuller days just pack it with more seed dots.
      const c = new Path2D();
      circle(c, x, y, inner);
      P.fill.addPath(c);
      P.line.addPath(c);
      const seeds = stage >= 3 ? 16 : 5;
      for (let k = 0; k < seeds; k++) {
        const a = k * 2.4, d = inner * 0.75 * Math.sqrt((k + 0.5) / seeds);
        circle(P.ink, x + Math.cos(a) * d + j(r, inner * 0.08), y + Math.sin(a) * d + j(r, inner * 0.08), inner * 0.1);
      }
      return;
    }
    case 'five': {
      const rot = r() * TAU, open = stage >= 2 ? 1 : 0.75;
      for (let k = 0; k < 5; k++) {
        const a = rot + (k / 5) * TAU;
        const e = new Path2D();
        const pr = rad * 0.42 * open;
        e.ellipse(x + Math.cos(a) * rad * 0.48 * open, y + Math.sin(a) * rad * 0.48 * open, pr, pr * 0.86, a, 0, TAU);
        P.fill.addPath(e);
        P.line.addPath(e);
      }
      const c = new Path2D();
      circle(c, x, y, rad * 0.16);
      if (stage >= 3) P.ink.addPath(c);
      else {
        P.fill.addPath(c);
        P.line.addPath(c);
      }
      return;
    }
    case 'bell': {
      // Side view, hanging from the pedicel: a flared bell with a scalloped lip.
      const a = Math.PI / 2 + (ang > -Math.PI / 2 ? -0.35 : 0.35) * 0.6;
      const c = Math.cos(a), s = Math.sin(a), L = rad * 1.6, W = rad * (stage >= 2 ? 0.75 : 0.5);
      const pt = (u: number, v: number): [number, number] => [x + c * u - s * v, y + s * u + c * v];
      const e = new Path2D();
      e.moveTo(...pt(0, -W * 0.25));
      e.bezierCurveTo(...pt(L * 0.35, -W * 0.35), ...pt(L * 0.7, -W * 0.7), ...pt(L, -W));
      for (let k = 0; k < 3; k++) {
        const v0 = -W + (k * 2 * W) / 3, v1 = -W + ((k + 1) * 2 * W) / 3;
        e.quadraticCurveTo(...pt(L * 1.12, (v0 + v1) / 2), ...pt(L, v1));
      }
      e.bezierCurveTo(...pt(L * 0.7, W * 0.7), ...pt(L * 0.35, W * 0.35), ...pt(0, W * 0.25));
      e.closePath();
      P.fill.addPath(e);
      P.line.addPath(e);
      if (stage >= 3) curve(P.line, r, ...pt(L * 0.15, 0), ...pt(L * 0.8, 0), 0.03);
      return;
    }
    case 'cup': {
      // Tulip-ish cup, side view, opening upward along the pedicel direction.
      const c = Math.cos(ang), s = Math.sin(ang), L = rad * 1.5, W = rad * (stage >= 2 ? 0.7 : 0.5);
      const pt = (u: number, v: number): [number, number] => [x + c * u - s * v, y + s * u + c * v];
      const e = new Path2D();
      e.moveTo(...pt(0, 0));
      e.bezierCurveTo(...pt(0, -W * 1.2), ...pt(L * 0.8, -W * 1.1), ...pt(L, -W * 0.55));
      e.quadraticCurveTo(...pt(L * 0.75, -W * 0.1), ...pt(L * 1.02, 0));
      e.quadraticCurveTo(...pt(L * 0.75, W * 0.1), ...pt(L, W * 0.55));
      e.bezierCurveTo(...pt(L * 0.8, W * 1.1), ...pt(0, W * 1.2), ...pt(0, 0));
      P.fill.addPath(e);
      P.line.addPath(e);
      curve(P.line, r, ...pt(L * 0.1, 0), ...pt(L * 0.85, 0), 0.05);
      return;
    }
    case 'umbel': {
      // Yarrow / Queen Anne's lace: rays fanning out, each ending in a tiny floret.
      const n = 4 + stage * 2;
      for (let k = 0; k < n; k++) {
        const a = ang + ((k / (n - 1)) - 0.5) * 1.6 + j(r, 0.15), L = rad * (0.8 + j(r, 0.3));
        const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
        curve(P.line, r, x, y, ex, ey, 0.05);
        const c = new Path2D();
        circle(c, ex, ey, rad * 0.16);
        P.fill.addPath(c);
        P.line.addPath(c);
        if (stage >= 3) circle(P.ink, ex, ey, rad * 0.05);
      }
      return;
    }
    case 'floret': {
      // Lavender: small paired florets hugging the spike.
      for (const side of [-1, 1]) {
        const e = new Path2D();
        const a = ang + side * 0.5, L = rad * (1 + stage * 0.25);
        blade(e, r, x, y, a, L, rad * 0.38, 0.5);
        P.fill.addPath(e);
        P.line.addPath(e);
        if (stage >= 3) curve(P.line, r, x + Math.cos(a) * L * 0.2, y + Math.sin(a) * L * 0.2, x + Math.cos(a) * L * 0.75, y + Math.sin(a) * L * 0.75, 0.02);
      }
      return;
    }
    case 'gyp': {
      // Baby's breath: the pedicel forks; each twig ends in a tiny five-dot star.
      const twigs = 1 + Math.min(stage, 2);
      for (let k = 0; k < twigs; k++) {
        const a = ang + (twigs === 1 ? 0 : ((k / (twigs - 1)) - 0.5) * 1.1) + j(r, 0.2);
        const L = rad * 1.6 * (0.7 + r() * 0.5), ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L;
        curve(P.line, r, x, y, ex, ey, 0.1);
        for (let q = 0; q < 5; q++) {
          const qa = (q / 5) * TAU;
          circle(P.line, ex + Math.cos(qa) * rad * 0.32, ey + Math.sin(qa) * rad * 0.32, rad * 0.16);
        }
        if (stage >= 3) circle(P.ink, ex, ey, rad * 0.1);
      }
      return;
    }
    case 'berry': {
      // Riper with more commits: fuller, a shading crescent, then the calyx dot.
      const br = rad * (0.7 + stage * 0.12);
      const c = new Path2D();
      circle(c, x, y, br);
      P.fill.addPath(c);
      P.line.addPath(c);
      P.line.moveTo(x - br * 0.62 * Math.cos(0.2), y - br * 0.62 * Math.sin(0.2));
      P.line.arc(x, y, br * 0.62, Math.PI + 0.2, Math.PI * 1.45);
      if (stage >= 2) {
        P.line.moveTo(x + br * 0.78 * Math.cos(0.35), y + br * 0.78 * Math.sin(0.35));
        P.line.arc(x, y, br * 0.78, 0.35, 1.25);
      }
      if (stage >= 3) circle(P.ink, x + Math.cos(ang) * br * 0.55, y + Math.sin(ang) * br * 0.55, br * 0.1);
      return;
    }
  }
}

/** The crowning flower of a plant: its own species, larger and fully open. Clustered kinds
    (spikes, umbels, sprays, berries) grow a fuller head rather than one big copy. */
function hero(P: Pens, r: R, kind: Kind, x: number, y: number, ang: number, rad: number) {
  switch (kind) {
    case 'floret': {
      // A terminal spike: paired florets stacked toward the tip, smaller as they climb.
      for (let k = 0; k < 7; k++) {
        const t = k / 7, fx = x + Math.cos(ang) * rad * 5 * t, fy = y + Math.sin(ang) * rad * 5 * t;
        flower(P, r, 'floret', fx, fy, ang, rad * (1.7 - t * 0.8), 3);
      }
      return;
    }
    case 'gyp': {
      // A fuller spray: more forks, each tipped with stars.
      for (let k = 0; k < 4; k++) {
        const a = ang + (k / 3 - 0.5) * 1.3 + j(r, 0.15), L = rad * (0.9 + r() * 0.5);
        const fx = x + Math.cos(a) * L, fy = y + Math.sin(a) * L;
        curve(P.line, r, x, y, fx, fy, 0.08);
        flower(P, r, 'gyp', fx, fy, a, rad * 0.7, 3);
      }
      return;
    }
    case 'umbel': {
      flower(P, r, 'umbel', x, y, ang, rad * 1.5, 3);
      flower(P, r, 'umbel', x + Math.cos(ang) * rad * 0.3, y + Math.sin(ang) * rad * 0.3, ang, rad * 1.1, 3);
      return;
    }
    case 'berry': {
      for (let k = 0; k < 4; k++) {
        const a = ang + (k / 3 - 0.5) * 1.6, L = rad * (k % 2 ? 0.9 : 1.4);
        const bx = x + Math.cos(a) * L, by = y + Math.sin(a) * L;
        curve(P.line, r, x, y, bx, by, 0.1);
        flower(P, r, 'berry', bx, by, a, rad * 1.15, 3);
      }
      return;
    }
    default:
      // Just a little larger than its sisters, and fully open.
      flower(P, r, kind, x, y, ang, rad * 1.3, 3);
  }
}

/* ---------- species choice and sprig assembly ---------- */

export function chooseSpecies(days: Day[], from: number, to: number, seed: number, prev?: string) {
  let active = 0;
  for (let i = from; i < to; i++) if (days[i].l) active++;
  const ratio = active / Math.max(1, to - from);
  const pool = ratio > 0.8 ? ['lavender', 'gyp', 'yarrow', 'forget'] : ratio > 0.45 ? ['daisy', 'forget', 'bell', 'cosmos', 'yarrow', 'tulip'] : ['eucalyptus', 'fern', 'bell', 'tulip'];
  const r = rng(seed * 9973 + 17);
  let pick = pool[Math.floor(r() * pool.length)];
  if (pick === prev) pick = pool[(pool.indexOf(pick) + 1) % pool.length];
  return pick;
}

/** Build one month's sprig. `W` is the cell width, `H` the sprig height (world units). */
export function buildSprig(days: Day[], from: number, to: number, W: number, H: number, speciesName: string, seed: number, todayIndex: number): Sprig {
  const sp = SPECIES[speciesName];
  const r = rng(seed);
  const total = to - from;
  const nStems = total > 22 ? 3 : total > 10 ? 2 : 1;
  const stemsPath = new Path2D();
  const all = newPens();
  const organs: Organ[] = [];
  const blooms: Sprig['blooms'] = [];
  let bud: Sprig['bud'];

  // Stems fan from one gathered base and cross a little, like a hand-tied bunch.
  const stems: Bez[] = [];
  for (let k = 0; k < nStems; k++) {
    const spread = nStems === 1 ? 0 : (k / (nStems - 1) - 0.5) * 2;
    const lean = spread * 0.32 + j(r, 0.14);
    const len = H * (k === Math.floor(nStems / 2) ? 1 : 0.78 + r() * 0.18);
    const bx = -spread * W * 0.035 + j(r, W * 0.02);
    const tx = bx + Math.sin(lean) * len, ty = -Math.cos(lean) * len;
    const bow = j(r, 0.22) * len;
    stems.push({
      x0: bx, y0: 0,
      x1: bx + Math.sin(lean) * len * 0.15 + bow * 0.4, y1: -len * 0.33,
      x2: tx - Math.sin(lean) * len * 0.1 + bow, y2: ty * 0.68,
      x3: tx, y3: ty,
    });
  }
  for (const b of stems) {
    stemsPath.moveTo(b.x0, b.y0);
    stemsPath.bezierCurveTo(b.x1, b.y1, b.x2, b.y2, b.x3, b.y3);
  }

  // Days go to stems in chronological blocks.
  const per = Math.ceil(total / nStems);
  for (let k = 0; k < nStems; k++) {
    const b = stems[k];
    const ids: number[] = [];
    for (let i = from + k * per; i < Math.min(to, from + (k + 1) * per); i++) ids.push(i);
    const flowers = ids.filter((i) => days[i].l || days[i].e || days[i].ev || i === todayIndex);
    const leaves = ids.filter((i) => !flowers.includes(i));

    leaves.forEach((i, q) => {
      const t = 0.08 + (0.78 * (q + 0.5)) / Math.max(leaves.length, 1);
      const p = bezAt(b, t), a = bezAngle(b, t), side = q % 2 ? 1 : -1;
      const pens = newPens();
      // Crowded stems (a month all leaf) carry smaller leaves, so they never pile into a mass.
      const crowd = Math.min(1, Math.sqrt(5 / Math.max(leaves.length, 1)));
      const L = W * (sp.leaf === 'round' ? 0.11 : sp.leaf === 'needle' ? 0.13 : 0.16) * (1.15 - t * 0.6) * crowd;
      const la = a + side * (0.75 + j(r, 0.3));
      leaf(pens, r, sp.leaf, p.x, p.y, la, L);
      organs.push({ i, kind: 'leaf', hx: p.x + Math.cos(la) * L * 0.5, hy: p.y + Math.sin(la) * L * 0.5, ax: p.x, ay: p.y, pens });
    });

    // Essays and moments crown the plant: the last one takes the stem's tip (unless today's
    // bud is there), the rest end long branches reaching up. Ordinary flowers fill in below.
    const isHero = (i: number) => !!(days[i].e || days[i].ev);
    const heroes = flowers.filter(isHero);
    const plain = flowers.filter((i) => !isHero(i) && i !== todayIndex);
    const hasToday = flowers.includes(todayIndex);
    const tipHero = !hasToday && heroes.length ? heroes[heroes.length - 1] : -1;
    const tipPlain = !hasToday && tipHero < 0 && plain.length ? plain[plain.length - 1] : -1;

    if (hasToday) {
      // Today: the newest bud at the very tip, still closed.
      const p = bezAt(b, 1), a = bezAngle(b, 1), pens = newPens(), rad = W * 0.03;
      flower(pens, r, 'daisy', p.x, p.y, a, rad, 0);
      bud = { x: p.x + Math.cos(a) * rad, y: p.y + Math.sin(a) * rad, r: rad };
      organs.push({ i: todayIndex, kind: 'bud', hx: bud.x, hy: bud.y, ax: p.x, ay: p.y, pens });
    }

    const below = plain.filter((i) => i !== tipPlain);
    below.forEach((i, q) => {
      const d = days[i];
      const t = sp.from + ((0.94 - sp.from) * (q + 0.5)) / Math.max(below.length, 1);
      const p = bezAt(b, t), a = bezAngle(b, t), side = q % 2 ? 1 : -1;
      const pens = newPens();
      const pedLen = W * (sp.ped[0] + r() * (sp.ped[1] - sp.ped[0]));
      const pa = a + side * (0.55 + j(r, 0.3));
      const hx = p.x + Math.cos(pa) * pedLen, hy = p.y + Math.sin(pa) * pedLen;
      curve(pens.line, r, p.x, p.y, hx, hy, side * 0.12);
      if (sp.branchy && pedLen > W * 0.06) {
        // A small bract at the fork, the way branching wildflowers carry them.
        blade(pens.line, r, p.x + Math.cos(pa) * pedLen * 0.2, p.y + Math.sin(pa) * pedLen * 0.2, pa - side * 0.9, W * 0.05, W * 0.012);
      }
      const stage = Math.min(3, Math.max(0, d.l - 1));
      flower(pens, r, sp.flower, hx, hy, pa, W * sp.r * (0.8 + d.l * 0.1), stage);
      organs.push({ i, kind: 'flower', hx, hy, ax: p.x, ay: p.y, pens });
    });

    if (tipPlain >= 0) {
      const d = days[tipPlain], p = bezAt(b, 1), a = bezAngle(b, 1), pens = newPens();
      const hx = p.x + Math.cos(a) * W * sp.ped[0] * 0.5, hy = p.y + Math.sin(a) * W * sp.ped[0] * 0.5;
      curve(pens.line, r, p.x, p.y, hx, hy, 0.02);
      flower(pens, r, sp.flower, hx, hy, a, W * sp.r * (0.8 + d.l * 0.1), Math.min(3, Math.max(0, d.l - 1)));
      organs.push({ i: tipPlain, kind: 'flower', hx, hy, ax: p.x, ay: p.y, pens });
    }

    heroes.forEach((i, q) => {
      const pens = newPens(), rad = W * sp.r;
      let ax: number, ay: number, pa: number, len: number;
      if (i === tipHero) {
        // The stem simply carries on into it.
        const p = bezAt(b, 1);
        ax = p.x; ay = p.y; pa = bezAngle(b, 1); len = W * 0.03;
      } else {
        // A long branch from high on the stem, reaching up beside the tip.
        const t = 0.62 + (0.28 * (q + 0.5)) / Math.max(heroes.length, 1);
        const p = bezAt(b, t), side = q % 2 ? 1 : -1;
        ax = p.x; ay = p.y; pa = bezAngle(b, t) + side * (0.38 + j(r, 0.12)); len = W * (sp.ped[1] * 1.5 + 0.06);
      }
      const hx = ax + Math.cos(pa) * len, hy = ay + Math.sin(pa) * len;
      curve(pens.line, r, ax, ay, hx, hy, j(r, 0.1));
      // Round heads (daisies, forget-me-nots) sit centred a little past the stalk, their back
      // petals over its end. Everything else (cups, bells, sprays, spikes) grows out of the
      // stalk's very tip, so nothing floats.
      const radial = sp.flower === 'daisy' || sp.flower === 'cosmos' || sp.flower === 'five';
      const reach = radial ? rad * 0.9 : 0;
      const cx = hx + Math.cos(pa) * reach, cy = hy + Math.sin(pa) * reach;
      hero(pens, r, sp.flower, cx, cy, pa, rad);
      blooms.push({ i, x: cx, y: cy, r: rad * 1.4 });
      organs.push({ i, kind: 'hero', hx: cx, hy: cy, ax, ay, pens });
    });
  }

  for (const o of organs) {
    all.fill.addPath(o.pens.fill);
    all.line.addPath(o.pens.line);
    all.ink.addPath(o.pens.ink);
  }
  return { species: speciesName, stems: stemsPath, pens: all, organs, bud, blooms };
}
