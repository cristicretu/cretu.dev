/* Pond: the grid floats on water. A real 2D wave equation runs on a coarse height field;
   the pointer trails wake, a press drops a stone, and the odd raindrop keeps it alive. Days
   bob on the swell and slide along its slope; essays ride higher. */

import { type Variant, dotRadius, gridLayout } from '../field-kit';
import { clamp, dayDot, todayMark } from './a-draw';

const GS = 10; // wave grid spacing, px
const STEP = 1 / 60;
const C2 = 0.22; // (wave speed · step / spacing)²
const DAMP = 0.992;

type PondState = {
  cols: number;
  rows: number;
  a: Float32Array; // current height
  b: Float32Array; // previous height
  hv: Float32Array; // height under each day, for drawing
  acc: number;
  nextDrip: number;
};

function ensure(st: PondState, width: number, height: number, n: number) {
  const cols = Math.ceil(width / GS) + 3, rows = Math.ceil(height / GS) + 3;
  if (st.cols === cols && st.rows === rows) return;
  st.cols = cols;
  st.rows = rows;
  st.a = new Float32Array(cols * rows);
  st.b = new Float32Array(cols * rows);
  st.hv = new Float32Array(n);
  st.acc = 0;
}

/** Gaussian splash: pushes the surface down at (x, y). */
function splash(st: PondState, x: number, y: number, amount: number, radius: number) {
  const gx = x / GS + 1, gy = y / GS + 1, R = Math.ceil(radius * 2);
  for (let j = Math.max(1, Math.floor(gy) - R); j <= Math.min(st.rows - 2, Math.floor(gy) + R); j++) {
    for (let i = Math.max(1, Math.floor(gx) - R); i <= Math.min(st.cols - 2, Math.floor(gx) + R); i++) {
      const d2 = (i - gx) ** 2 + (j - gy) ** 2;
      st.a[j * st.cols + i] -= amount * Math.exp(-d2 / (radius * radius));
    }
  }
}

function step(st: PondState) {
  const { a, b, cols, rows } = st;
  for (let j = 1; j < rows - 1; j++) {
    for (let i = 1, k = j * cols + 1; i < cols - 1; i++, k++) {
      const lap = a[k - 1] + a[k + 1] + a[k - cols] + a[k + cols] - 4 * a[k];
      b[k] = (2 * a[k] - b[k] + C2 * lap) * DAMP;
    }
  }
  st.a = b;
  st.b = a;
}

export const pond: Variant = {
  label: 'pond',
  physics: true,
  lens: 0.4,
  layout: gridLayout,
  enter(f) {
    const st = f.state as PondState;
    ensure(st, f.width, f.height, f.n);
    st.nextDrip = (f.now || performance.now()) + 500;
  },
  pointerDown(f) {
    const st = f.state as PondState;
    if (f.pointer && st.a && !f.reduced) splash(st, f.pointer.x, f.pointer.y, 9, 2.6);
  },
  tick(f) {
    const st = f.state as PondState;
    const { n, x, y, tx, ty, frame } = f;
    ensure(st, f.width, f.height, n);
    if (f.reduced) {
      for (let i = 0; i < n; i++) { x[i] = tx[i]; y[i] = ty[i]; }
      return;
    }

    const p = f.pointer;
    if (p) {
      const speed = Math.hypot(p.dx, p.dy);
      if (speed > 0.5) splash(st, p.x, p.y, Math.min(speed * 0.045, 1.4), 1.6);
    }
    if (f.now > st.nextDrip) {
      splash(st, frame.left + Math.random() * frame.w, frame.top + Math.random() * frame.h, 2.6 + Math.random() * 2, 1.3);
      st.nextDrip = f.now + 900 + Math.random() * 2600;
    }

    st.acc = Math.min(st.acc + f.dt, STEP * 3);
    while (st.acc >= STEP) { step(st); st.acc -= STEP; }

    const { a, cols } = st;
    for (let i = 0; i < n; i++) {
      const gi = clamp(Math.round(tx[i] / GS) + 1, 1, cols - 2);
      const gj = clamp(Math.round(ty[i] / GS) + 1, 1, st.rows - 2);
      const k = gj * cols + gi;
      const h = a[k];
      const gx = (a[k + 1] - a[k - 1]) * 0.5, gy = (a[k + cols] - a[k - cols]) * 0.5;
      const lift = f.days[i].e ? 2.2 : 1;
      // Slide down-slope (refraction-ish) and rise with the crest.
      x[i] = tx[i] - gx * 11;
      y[i] = ty[i] - gy * 11 - h * 2.2 * lift;
      st.hv[i] = h * lift;
    }
  },
  draw(f) {
    const st = f.state as PondState;
    if (!st.hv) return;
    const { n, x, y, s, lens, cell, days } = f;
    for (let i = 0; i < n - 1; i++) {
      if (s[i] < 0.01) continue;
      const h = st.hv[i];
      // Crests swell toward you; troughs sink and fade.
      const k = 1 + clamp(h * 0.13, -0.45, 0.8);
      const grow = (1 + lens[i] * 1.4) * s[i];
      dayDot(f, i, x[i], y[i], dotRadius(days[i], cell) * k * grow, cell * 0.38 * k * grow, clamp(1 + h * 0.06, 0.55, 1.2));
    }
    const t = n - 1;
    if (s[t] > 0.01) todayMark(f, x[t], y[t], cell * 0.3 * s[t] * (1 + clamp(st.hv[t] * 0.09, -0.4, 0.7)));
    f.ctx.globalAlpha = 1;
  },
};
