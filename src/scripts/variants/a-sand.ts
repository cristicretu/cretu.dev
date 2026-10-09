/* Sand: every day is a grain poured from above, oldest first, piling into a heap. A falling-
   sand automaton on a fine lattice gives a true angle of repose; drawn grains glide toward
   their cells so it reads as continuous. Drag sideways to tilt the box and the heap slides
   toward the low side. */

import { type Field, type Variant, TAU, hash } from '../field-kit';
import { clamp, freshMount, inkFor, liveHole, todayMark } from './a-draw';

const POUR_SECONDS = 4.2;
const STEPS_PER_FRAME = 2;
const MAX_TILT = 0.3;

type SandState = {
  D: number; // lattice pitch
  cols: number;
  rows: number;
  ox: number; // lattice origin (left edge of column 0)
  oy: number; // top edge of row 0
  occ: Int32Array; // grain index per cell, -1 empty
  cell: Int32Array; // cell per grain, -1 not yet poured
  spawned: number;
  t0: number;
  tilt: number;
  drag: number;
  key: string;
};

/** Lattice sized so the finished 45° heap fills a bit over half the frame's height. */
function lattice(f: Field) {
  const w = Math.max(1, f.frame.w), h = Math.max(1, f.frame.h);
  const H = Math.sqrt(f.n) * 1.05, B = 2 * H;
  const D = Math.max(3.5, Math.min((0.6 * h) / H, (0.9 * w) / B));
  const cols = Math.max(1, Math.floor(w / D));
  const rows = Math.max(2, Math.floor((h + f.frame.top) / D));
  return { D, cols, rows, ox: f.frame.left + (w - cols * D) / 2, oy: f.frame.top + h - rows * D };
}

/** Static heap (reduced motion, and the info-hole target): rows narrowing by one each side. */
function heap(f: Field, L: ReturnType<typeof lattice>) {
  const mid = Math.floor(L.cols / 2);
  for (let i = 0, k = 0; i < f.n; k++) {
    const half = Math.max(0, Math.ceil(Math.sqrt(f.n)) - k);
    for (let c = mid - half; c <= mid + half && i < f.n; c++, i++) {
      f.tx[i] = L.ox + (clamp(c, 0, L.cols - 1) + 0.5) * L.D;
      f.ty[i] = L.oy + (L.rows - 1 - k + 0.5) * L.D;
    }
  }
}

function init(f: Field, st: SandState, pour: boolean) {
  const L = lattice(f);
  Object.assign(st, L);
  st.key = `${L.cols}:${L.rows}:${L.D}`;
  st.occ = new Int32Array(L.cols * L.rows).fill(-1);
  st.cell = new Int32Array(f.n).fill(-1);
  st.tilt = 0;
  st.drag = 0;
  st.t0 = f.now || performance.now();
  st.spawned = 0;
  if (pour) return;
  // Settle everything into the static heap (reduced motion, or a resize mid-pile).
  heap(f, L);
  for (let i = 0; i < f.n; i++) {
    const c = clamp(Math.floor((f.tx[i] - L.ox) / L.D), 0, L.cols - 1);
    const r = clamp(Math.floor((f.ty[i] - L.oy) / L.D), 0, L.rows - 1);
    if (st.occ[r * L.cols + c] >= 0) continue;
    st.occ[r * L.cols + c] = i;
    st.cell[i] = r * L.cols + c;
  }
  st.spawned = f.n;
}

const cx = (st: SandState, c: number, i: number) => st.ox + (c + 0.5 + (hash(i) - 0.5) * 0.22) * st.D;
const cy = (st: SandState, r: number, i: number) => st.oy + (r + 0.5 + (hash(i + 77) - 0.5) * 0.18) * st.D;

export const sand: Variant = {
  label: 'sand',
  physics: true,
  lens: 0,
  layout(f) {
    const L = lattice(f);
    heap(f, L);
    return L.D;
  },
  enter(f) {
    const st = f.state as SandState;
    const fresh = freshMount(f);
    init(f, st, !f.reduced);
    if (f.reduced) {
      for (let i = 0; i < f.n; i++) { f.x[i] = f.tx[i]; f.y[i] = f.ty[i]; }
    } else if (fresh) {
      for (let i = 0; i < f.n; i++) { f.x[i] = f.width / 2; f.y[i] = -1e4; }
    }
    // Arriving from another variant, days keep their positions and pour in from where they are.
  },
  pointerDown(f) {
    (f.state as SandState).drag = 0;
  },
  click(f) {
    return (f.state as SandState).drag > 6;
  },
  tick(f) {
    const st = f.state as SandState;
    if (!st.occ) return;
    const L = lattice(f);
    if (st.key !== `${L.cols}:${L.rows}:${L.D}`) init(f, st, false);
    liveHole(f);
    const { n, x, y, dt } = f;
    const { occ, cell, cols, rows } = st;

    if (!f.reduced) {
      const p = f.pointer;
      if (p?.down) {
        st.tilt = clamp(st.tilt + p.dx * 0.002, -MAX_TILT, MAX_TILT);
        st.drag += Math.abs(p.dx) + Math.abs(p.dy);
      } else {
        st.tilt *= Math.exp(-dt * 0.9);
      }

      // Pour from a few columns at the top, swaying so the heap spreads a little.
      const due = Math.min(n, Math.floor(((f.now - st.t0) / 1000) * (n / POUR_SECONDS)));
      const spout = Math.floor(cols / 2 + Math.sin(f.now / 700) * cols * 0.04);
      for (let tries = 0; st.spawned < due && tries < 12; tries++) {
        const c = clamp(spout + Math.floor((Math.random() - 0.5) * 5), 0, cols - 1);
        if (occ[c] >= 0) continue;
        const i = st.spawned++;
        occ[c] = i;
        cell[i] = c;
        if (y[i] < -1000) { x[i] = cx(st, c, i); y[i] = -st.D * 2; }
      }

      // The floor hinges at the low wall and rises toward the other: cells below it are solid.
      const slope = Math.abs(Math.tan(st.tilt));
      const floorRow = (c: number) => rows - 1 - Math.round((st.tilt > 0 ? c : cols - 1 - c) * slope);
      const solid = (r: number, c: number) => c < 0 || c >= cols || r >= rows || r > floorRow(c);
      const free = (r: number, c: number) => !solid(r, c) && occ[r * cols + c] < 0;
      const low = st.tilt > 0 ? -1 : 1, slide = Math.abs(st.tilt) / MAX_TILT;

      const move = (from: number, r: number, c: number) => {
        const to = r * cols + c, g = occ[from];
        occ[to] = g; occ[from] = -1; cell[g] = to;
      };
      for (let s = 0; s < STEPS_PER_FRAME; s++) {
        for (let r = rows - 2; r >= 0; r--) {
          const ltr = (r + s) % 2 === 0;
          for (let k = 0; k < cols; k++) {
            const c = ltr ? k : cols - 1 - k;
            const from = r * cols + c;
            if (occ[from] < 0 || solid(r, c)) continue;
            if (free(r + 1, c)) { move(from, r + 1, c); continue; }
            const first = Math.random() < 0.5 ? -1 : 1;
            if (free(r + 1, c + first)) { move(from, r + 1, c + first); continue; }
            if (free(r + 1, c - first)) { move(from, r + 1, c - first); continue; }
            // On a tilt, grains creep sideways toward the low side.
            if (slide > 0.05 && Math.random() < slide * 0.5 && free(r, c + low)) move(from, r, c + low);
          }
        }
        // Grains trapped under a rising floor pop up to the nearest free cell above.
        for (let c = 0; c < cols; c++) {
          const top = floorRow(c);
          for (let r = rows - 1; r > top && r >= 0; r--) {
            const from = r * cols + c;
            if (occ[from] < 0) continue;
            let up = Math.min(top, rows - 1);
            while (up >= 0 && occ[up * cols + c] >= 0) up--;
            if (up >= 0) move(from, up, c);
          }
        }
      }
    }

    // Drawn grains glide toward their lattice cells.
    const k = f.reduced ? 1 : Math.min(1, dt * 22);
    for (let i = 0; i < st.spawned; i++) {
      const c = cell[i];
      if (c < 0) continue;
      const gx = cx(st, c % cols, i), gy = cy(st, Math.floor(c / cols), i);
      x[i] += (gx - x[i]) * k;
      y[i] += (gy - y[i]) * k;
    }
  },
  draw(f) {
    const st = f.state as SandState;
    if (!st.occ) return;
    const { ctx, x, y, s, n } = f;
    const r = st.D * 0.5;

    // The floor of the box, hinged at the low wall, so the tilt reads.
    const bottom = st.oy + st.rows * st.D + 0.5, rise = st.cols * st.D * Math.abs(Math.tan(st.tilt));
    const l = st.ox, rr = st.ox + st.cols * st.D;
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = f.colors.ink;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(l, st.tilt > 0 ? bottom : bottom - rise);
    ctx.lineTo(rr, st.tilt > 0 ? bottom - rise : bottom);
    ctx.stroke();

    for (let i = 0; i < st.spawned; i++) {
      if (s[i] < 0.01 || i === n - 1 || st.cell[i] < 0) continue;
      const gr = r * 0.92 * s[i];
      if (f.days[i].e) {
        // Essay grains are hollow: an ink ring with a seed in the middle.
        ctx.globalAlpha = 1;
        ctx.strokeStyle = f.colors.ink;
        ctx.lineWidth = Math.max(1, r * 0.32);
        ctx.beginPath();
        ctx.arc(x[i], y[i], gr * 0.8, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = f.colors.ink;
        ctx.beginPath();
        ctx.arc(x[i], y[i], gr * 0.28, 0, TAU);
        ctx.fill();
      } else {
        inkFor(f, i);
        ctx.beginPath();
        ctx.arc(x[i], y[i], gr, 0, TAU);
        ctx.fill();
      }
    }
    const t = n - 1;
    if (st.cell[t] >= 0 && s[t] > 0.01) todayMark(f, x[t], y[t], r * 0.95 * s[t]);
    ctx.globalAlpha = 1;
  },
};
