/* Cloth: the grid is a curtain of days hung from a rod by a few rings. Verlet threads keep
   the weave; the rings sit a little closer than the cloth is wide, so it drapes in scallops.
   A breeze moves through it, brushing past nudges it, and you can grab a day and pull. */

import { type Variant, TAU, dotRadius, gridLayout } from '../field-kit';
import { dayDot, gridCols, todayMark } from './a-draw';

const GRAVITY = 900;
const ITERATIONS = 10;
const GATHER = 0.86; // rings sit at 86% of the cloth's width

type ClothState = {
  key: string;
  cols: number;
  px: Float32Array;
  py: Float32Array;
  edges: Int32Array;
  rest: number;
  pinned: Uint8Array;
  ax: Float32Array;
  ay: Float32Array;
  pins: number[];
  grab: number;
  drag: number;
};

function init(f: Parameters<Variant['layout']>[0]) {
  const st = f.state as ClothState, n = f.n, cols = gridCols(f);
  st.key = `${cols}:${f.cell}:${f.width}`;
  st.cols = cols;
  st.rest = f.cell;
  st.px = Float32Array.from(f.x);
  st.py = Float32Array.from(f.y);
  const edges: number[] = [];
  for (let i = 0; i < n; i++) {
    if ((i + 1) % cols && i + 1 < n) edges.push(i, i + 1);
    if (i + cols < n) edges.push(i, i + cols);
  }
  st.edges = Int32Array.from(edges);
  st.pinned = new Uint8Array(n);
  st.ax = new Float32Array(n);
  st.ay = new Float32Array(n);
  const every = Math.max(3, Math.round(cols / 9));
  const cx = f.frame.left + f.frame.w / 2;
  st.pins = [];
  for (let i = 0; i < cols; i++) {
    // Rings every few columns and at the far end; skip one that would crowd the last ring.
    if (i % every && i !== cols - 1) continue;
    if (i !== cols - 1 && cols - 1 - i < every / 2) continue;
    st.pinned[i] = 1;
    st.ax[i] = cx + (f.tx[i] - cx) * GATHER;
    st.ay[i] = f.ty[i];
    st.pins.push(i);
  }
  st.grab = -1;
}

export const cloth: Variant = {
  label: 'cloth',
  physics: true,
  lens: 0.5,
  layout: gridLayout,
  enter(f) {
    init(f);
  },
  pointerDown(f) {
    const st = f.state as ClothState;
    st.drag = 0;
    if (!f.pointer || !st.px) return;
    let best = -1, bestD = (f.cell * 2.5) ** 2;
    for (let i = 0; i < f.n; i++) {
      if (st.pinned[i]) continue;
      const d = (f.x[i] - f.pointer.x) ** 2 + (f.y[i] - f.pointer.y) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
    st.grab = best;
  },
  pointerUp(f) {
    (f.state as ClothState).grab = -1;
  },
  click(f) {
    return (f.state as ClothState).drag > 6;
  },
  tick(f) {
    const st = f.state as ClothState;
    const { n, x, y, tx, ty } = f;
    if (!st.px || st.key !== `${gridCols(f)}:${f.cell}:${f.width}`) init(f);
    if (f.reduced) {
      for (let i = 0; i < n; i++) { x[i] = tx[i]; y[i] = ty[i]; }
      return;
    }
    const { px, py, pinned, ax, ay, edges, rest } = st;
    const dt = f.dt, dt2 = dt * dt, t = f.now / 1000;
    const p = f.pointer;
    if (p?.down) st.drag += Math.abs(p.dx) + Math.abs(p.dy);

    // A breeze that gusts and drifts across the cloth.
    const gust = Math.sin(t * 0.7) * 0.6 + Math.sin(t * 0.23 + 1.3) * 0.4;
    for (let i = 0; i < n; i++) {
      if (pinned[i]) { x[i] = px[i] = ax[i]; y[i] = py[i] = ay[i]; continue; }
      const vx = (x[i] - px[i]) * 0.99, vy = (y[i] - py[i]) * 0.99;
      px[i] = x[i]; py[i] = y[i];
      const wind = gust * 45 + Math.sin(t * 1.9 + y[i] * 0.018 + x[i] * 0.006) * 30;
      x[i] += vx + wind * dt2;
      y[i] += vy + GRAVITY * dt2;
    }

    // Brushing past without pressing nudges the fabric along with the pointer.
    if (p && !p.down && (p.dx || p.dy)) {
      const R = f.cell * 3.5, R2 = R * R;
      for (let i = 0; i < n; i++) {
        if (pinned[i]) continue;
        const d2 = (x[i] - p.x) ** 2 + (y[i] - p.y) ** 2;
        if (d2 > R2) continue;
        const w = (1 - Math.sqrt(d2) / R) * 0.35;
        x[i] += p.dx * w; y[i] += p.dy * w;
      }
    }

    for (let it = 0; it < ITERATIONS; it++) {
      for (let e = 0; e < edges.length; e += 2) {
        const a = edges[e], b = edges[e + 1];
        const dx = x[b] - x[a], dy = y[b] - y[a];
        const d = Math.sqrt(dx * dx + dy * dy) || 1e-6;
        // Threads resist stretching but slacken freely, so the drape can fold.
        if (d < rest) continue;
        const diff = (d - rest) / d;
        const wa = pinned[a] ? 0 : pinned[b] ? 1 : 0.5, wb = pinned[b] ? 0 : pinned[a] ? 1 : 0.5;
        x[a] += dx * diff * wa; y[a] += dy * diff * wa;
        x[b] -= dx * diff * wb; y[b] -= dy * diff * wb;
      }
      if (st.grab >= 0 && p) { x[st.grab] = p.x; y[st.grab] = p.y; }
    }
  },
  draw(f) {
    const st = f.state as ClothState;
    if (!st.edges) return;
    const { ctx, n, x, y, s, lens, cell, days, colors } = f;
    const { edges, rest } = st;

    // The weave, shaded by how bunched each thread is: folds read darker.
    const buckets = [0.05, 0.09, 0.16];
    for (let bkt = 0; bkt < 3; bkt++) {
      ctx.beginPath();
      for (let e = 0; e < edges.length; e += 2) {
        const a = edges[e], b = edges[e + 1];
        if (s[a] < 0.5 || s[b] < 0.5) continue;
        const r = Math.hypot(x[b] - x[a], y[b] - y[a]) / rest;
        const k = r > 0.97 ? 0 : r > 0.75 ? 1 : 2;
        if (k !== bkt) continue;
        ctx.moveTo(x[a], y[a]);
        ctx.lineTo(x[b], y[b]);
      }
      ctx.globalAlpha = buckets[bkt];
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (let i = 0; i < n - 1; i++) {
      if (s[i] < 0.01) continue;
      const grow = (1 + lens[i] * 1.4) * s[i];
      dayDot(f, i, x[i], y[i], dotRadius(days[i], cell) * grow, cell * 0.38 * grow);
    }
    const t = n - 1;
    if (s[t] > 0.01) todayMark(f, x[t], y[t], cell * 0.3 * s[t]);

    // The rod and its rings.
    const pins = st.pins;
    if (pins.length > 1) {
      const rodY = st.ay[pins[0]] - cell * 0.55;
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = colors.ink;
      ctx.lineCap = 'round';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(st.ax[pins[0]] - cell * 1.2, rodY);
      ctx.lineTo(st.ax[pins[pins.length - 1]] + cell * 1.2, rodY);
      ctx.stroke();
      ctx.lineWidth = 1.25;
      for (const i of pins) {
        ctx.beginPath();
        ctx.arc(st.ax[i], rodY + cell * 0.25, cell * 0.32, 0, TAU);
        ctx.stroke();
      }
      ctx.lineCap = 'butt';
    }
    ctx.globalAlpha = 1;
  },
};
