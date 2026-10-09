/* Jelly: the field is one soft body. Every day is tied to its neighbours and loosely to its
   home, so a fast swipe slaps a wave through it and a press pokes a dimple that rebounds. Low
   damping keeps the wobble going; dots squash along their motion. */

import { type Variant, TAU, dotRadius, gridLayout } from '../field-kit';
import { dayDot, gridCols, inkFor, liveHole, todayMark } from './a-draw';

const K_NEIGHBOUR = 1100; // 1/s², neighbour coupling: how fast waves cross
const K_HOME = 32; // 1/s², pull back to the layout
const DAMPING = 1.6; // 1/s
const SUBSTEPS = 3;

type JellyState = { cols: number; ux: Float32Array; uy: Float32Array };

export const jelly: Variant = {
  label: 'jelly',
  physics: true,
  lens: 0.3,
  layout(f) {
    const cell = gridLayout(f);
    (f.state as JellyState).cols = gridCols(f);
    return cell;
  },
  enter(f) {
    const st = f.state as JellyState;
    st.ux = new Float32Array(f.n);
    st.uy = new Float32Array(f.n);
    // Arriving from elsewhere: keep the displacement so the body wobbles into shape.
    for (let i = 0; i < f.n; i++) {
      st.ux[i] = f.x[i] - f.tx[i];
      st.uy[i] = f.y[i] - f.ty[i];
    }
  },
  pointerDown(f) {
    if (f.reduced || !f.pointer) return;
    // A poke: everything nearby is pushed away from the finger.
    const R = f.cell * 6, R2 = R * R, p = f.pointer;
    for (let i = 0; i < f.n; i++) {
      const dx = f.x[i] - p.x, dy = f.y[i] - p.y, d2 = dx * dx + dy * dy;
      if (d2 > R2 || d2 < 1) continue;
      const d = Math.sqrt(d2), w = (1 - d / R) ** 2 * 900;
      f.vx[i] += (dx / d) * w;
      f.vy[i] += (dy / d) * w;
    }
  },
  tick(f) {
    const st = f.state as JellyState;
    if (!st.ux) return;
    const { n, x, y, vx, vy, tx, ty, dt, cell } = f;
    const { ux, uy, cols } = st;
    liveHole(f);
    if (f.reduced) {
      for (let i = 0; i < n; i++) { x[i] = tx[i]; y[i] = ty[i]; }
      return;
    }

    // A fast swipe slaps the body in its direction.
    const p = f.pointer;
    if (p && dt > 0) {
      const pvx = p.dx / dt, pvy = p.dy / dt, speed = Math.hypot(pvx, pvy);
      if (speed > 250) {
        const R = cell * 4.5, R2 = R * R, k = Math.min(1, (speed - 250) / 1500) * 0.5;
        for (let i = 0; i < n; i++) {
          const d2 = (x[i] - p.x) ** 2 + (y[i] - p.y) ** 2;
          if (d2 > R2) continue;
          const w = (1 - Math.sqrt(d2) / R) * k;
          vx[i] += pvx * w;
          vy[i] += pvy * w;
        }
      }
    }

    const h = dt / SUBSTEPS, decay = Math.exp(-DAMPING * h);
    for (let sub = 0; sub < SUBSTEPS; sub++) {
      for (let i = 0; i < n; i++) {
        // Discrete Laplacian of the displacement field over the grid neighbours.
        let lx = 0, ly = 0;
        const c = i % cols;
        if (c > 0) { lx += ux[i - 1] - ux[i]; ly += uy[i - 1] - uy[i]; }
        if (c < cols - 1 && i + 1 < n) { lx += ux[i + 1] - ux[i]; ly += uy[i + 1] - uy[i]; }
        if (i >= cols) { lx += ux[i - cols] - ux[i]; ly += uy[i - cols] - uy[i]; }
        if (i + cols < n) { lx += ux[i + cols] - ux[i]; ly += uy[i + cols] - uy[i]; }
        vx[i] = (vx[i] + (K_NEIGHBOUR * lx - K_HOME * ux[i]) * h) * decay;
        vy[i] = (vy[i] + (K_NEIGHBOUR * ly - K_HOME * uy[i]) * h) * decay;
      }
      for (let i = 0; i < n; i++) {
        ux[i] += vx[i] * h;
        uy[i] += vy[i] * h;
      }
    }
    for (let i = 0; i < n; i++) { x[i] = tx[i] + ux[i]; y[i] = ty[i] + uy[i]; }
  },
  draw(f) {
    const { ctx, n, x, y, vx, vy, s, lens, cell, days, colors } = f;
    for (let i = 0; i < n - 1; i++) {
      if (s[i] < 0.01) continue;
      const grow = (1 + lens[i] * 1.4) * s[i];
      const r = dotRadius(days[i], cell) * grow;
      const speed = Math.hypot(vx[i], vy[i]);
      if (speed < 40) {
        dayDot(f, i, x[i], y[i], r, cell * 0.38 * grow);
        continue;
      }
      // Squash and stretch along the motion, preserving area.
      const k = 1 + Math.min(speed / 700, 0.9), a = Math.atan2(vy[i], vx[i]);
      inkFor(f, i);
      ctx.beginPath();
      ctx.ellipse(x[i], y[i], r * k, r / Math.sqrt(k), a, 0, TAU);
      ctx.fill();
      if (days[i].e) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = Math.max(1, cell * 0.06);
        ctx.beginPath();
        ctx.ellipse(x[i], y[i], cell * 0.38 * grow * k, (cell * 0.38 * grow) / Math.sqrt(k), a, 0, TAU);
        ctx.stroke();
      }
    }
    const t = n - 1;
    if (s[t] > 0.01) todayMark(f, x[t], y[t], cell * 0.3 * s[t]);
    ctx.globalAlpha = 1;
  },
};
