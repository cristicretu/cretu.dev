/* The grid lets go and the days take flight. Each essay leads a flock made of the days that came
   after it (its chapter), wandering on its own slow path; the days align, cohere and keep their
   distance like starlings. The pointer is a hawk. Leave it alone and they come home to the grid. */

import { type Field, type Variant, TAU, dotRadius, gridLayout, hash, levelAlpha } from '../field-kit';
import { todayMark } from './d-common';

const SETTLE_AFTER = 9000;
const MAX_NEIGHBOURS = 14;

function init(f: Field) {
  const S = f.state, n = f.n;
  S.chapter = new Int32Array(n);
  S.leaders = [] as number[];
  let lead = 0;
  for (let i = 0; i < n; i++) {
    if (f.days[i].e) { lead = i; S.leaders.push(i); }
    S.chapter[i] = lead;
  }
  S.next = new Int32Array(n);
  S.mode = 'grid';
}

export const flock: Variant = {
  label: 'flock',
  physics: true,
  layout(f) {
    const S = f.state;
    if (!S.chapter) init(f);
    return gridLayout(f);
  },
  enter(f) {
    const S = f.state;
    S.releaseAt = performance.now() + 1100;
    S.lastMove = performance.now();
  },
  tick(f) {
    const S = f.state, { n, x, y, vx, vy, tx, ty, days, frame, cell } = f;
    const now = f.now, dt = f.dt || 1 / 60, p = f.pointer;
    if (f.reduced) { x.set(tx); y.set(ty); return; }

    if (p && (p.dx || p.dy)) {
      S.lastMove = now;
      if (S.mode !== 'flock') { S.mode = 'flock'; S.flockedAt = now; }
    }
    if (S.mode === 'grid' && now > S.releaseAt) {
      S.mode = 'flock';
      S.flockedAt = now;
      // A small outward burst so the grid visibly lets go.
      for (let i = 0; i < n; i++) {
        const a = hash(i) * TAU;
        vx[i] = Math.cos(a) * cell * 2.5;
        vy[i] = Math.sin(a) * cell * 2.5;
      }
    }
    if (S.mode === 'flock' && now - S.lastMove > SETTLE_AFTER && now - S.flockedAt > 6000) S.mode = 'settle';

    if (S.mode !== 'flock') {
      // Homing: a soft spring with a little play in it.
      for (let i = 0; i < n; i++) {
        vx[i] += ((tx[i] - x[i]) * 30 - vx[i] * 7.5) * dt;
        vy[i] += ((ty[i] - y[i]) * 30 - vy[i] * 7.5) * dt;
        x[i] += vx[i] * dt; y[i] += vy[i] * dt;
      }
      return;
    }

    const span = Math.min(frame.w, frame.h);
    const maxV = span * 0.32, minV = span * 0.05;
    const R = cell * 3.2, sep = cell * 1.05;

    // Leaders wander on slow Lissajous paths of their own.
    const cx = frame.left + frame.w / 2, cy = frame.top + frame.h / 2, t = now / 1000;
    for (const L of S.leaders as number[]) {
      const h1 = hash(L), h2 = hash(L + 77);
      const gx = cx + Math.sin(t * (0.11 + h1 * 0.12) + h2 * TAU) * frame.w * 0.42;
      const gy = cy + Math.sin(t * (0.13 + h2 * 0.1) + h1 * TAU) * frame.h * 0.4;
      vx[L] += ((gx - x[L]) * 0.9 - vx[L] * 0.6) * dt;
      vy[L] += ((gy - y[L]) * 0.9 - vy[L] * 0.6) * dt;
    }

    // Spatial hash.
    const cols = Math.max(1, Math.ceil(f.width / R) + 2), rows = Math.max(1, Math.ceil(f.height / R) + 2);
    const head: Int32Array = S.head?.length === cols * rows ? S.head : (S.head = new Int32Array(cols * rows));
    head.fill(-1);
    const next: Int32Array = S.next;
    const bucket = (px: number, py: number) => {
      const c = Math.min(cols - 1, Math.max(0, Math.floor(px / R) + 1));
      const r = Math.min(rows - 1, Math.max(0, Math.floor(py / R) + 1));
      return r * cols + c;
    };
    for (let i = 0; i < n; i++) { const b = bucket(x[i], y[i]); next[i] = head[b]; head[b] = i; }

    for (let i = 0; i < n; i++) {
      if (days[i].e) continue;
      let ax = 0, ay = 0, avx = 0, avy = 0, apx = 0, apy = 0, k = 0;
      const bc = Math.min(cols - 1, Math.max(0, Math.floor(x[i] / R) + 1));
      const br = Math.min(rows - 1, Math.max(0, Math.floor(y[i] / R) + 1));
      search: for (let r = Math.max(0, br - 1); r <= Math.min(rows - 1, br + 1); r++) {
        for (let c = Math.max(0, bc - 1); c <= Math.min(cols - 1, bc + 1); c++) {
          for (let j = head[r * cols + c]; j !== -1; j = next[j]) {
            if (j === i) continue;
            const dx = x[i] - x[j], dy = y[i] - y[j], d2 = dx * dx + dy * dy;
            if (d2 > R * R) continue;
            if (d2 < sep * sep && d2 > 0.01) {
              const d = Math.sqrt(d2);
              ax += (dx / d) * (sep - d) * 9;
              ay += (dy / d) * (sep - d) * 9;
            }
            avx += vx[j]; avy += vy[j]; apx += x[j]; apy += y[j];
            if (++k >= MAX_NEIGHBOURS) break search;
          }
        }
      }
      if (k) {
        ax += (avx / k - vx[i]) * 1.6 + (apx / k - x[i]) * 0.5;
        ay += (avy / k - vy[i]) * 1.6 + (apy / k - y[i]) * 0.5;
      }
      // Follow this chapter's essay.
      const L = S.chapter[i], lx = x[L] - x[i], ly = y[L] - y[i], ld = Math.hypot(lx, ly) || 1;
      const pull = Math.min(ld, span * 0.4) * 1.1;
      ax += (lx / ld) * pull;
      ay += (ly / ld) * pull;
      // The hawk.
      if (p) {
        const hx = x[i] - p.x, hy = y[i] - p.y, hd = Math.hypot(hx, hy);
        if (hd < 150 && hd > 0.01) {
          const fear = (1 - hd / 150) ** 2 * span * 9;
          ax += (hx / hd) * fear;
          ay += (hy / hd) * fear;
        }
      }
      vx[i] += ax * dt;
      vy[i] += ay * dt;
    }

    for (let i = 0; i < n; i++) {
      const v = Math.hypot(vx[i], vy[i]) || 1;
      const lim = days[i].e ? maxV * 0.6 : maxV;
      if (v > lim) { vx[i] *= lim / v; vy[i] *= lim / v; }
      else if (v < minV && !days[i].e) { vx[i] *= minV / v; vy[i] *= minV / v; }
      x[i] += vx[i] * dt;
      y[i] += vy[i] * dt;
      // Soft walls a little outside the field.
      const m = cell * 2;
      if (x[i] < frame.left - m) vx[i] += (frame.left - m - x[i]) * 8 * dt;
      if (x[i] > frame.left + frame.w + m) vx[i] -= (x[i] - frame.left - frame.w - m) * 8 * dt;
      if (y[i] < frame.top - m) vy[i] += (frame.top - m - y[i]) * 8 * dt;
      if (y[i] > frame.top + frame.h + m) vy[i] -= (y[i] - frame.top - frame.h - m) * 8 * dt;
    }
  },
  draw(f) {
    const { ctx, colors, n, days, x, y, vx, vy, s, lens, cell } = f;
    ctx.lineCap = 'round';
    for (let i = 0; i < n - 1; i++) {
      if (s[i] < 0.01) continue;
      const d = days[i], grow = (1 + lens[i] * 1.2) * s[i], r = dotRadius(d, cell) * grow;
      // Each bird is a dot with a short wake behind it, so you can read the flow.
      const v = Math.hypot(vx[i], vy[i]);
      const tail = Math.min(v * 0.045, cell * 0.9);
      ctx.globalAlpha = d.l ? levelAlpha(d.l) : 1;
      ctx.strokeStyle = ctx.fillStyle = d.l ? colors.ink : colors.dim;
      if (tail > 0.6) {
        ctx.lineWidth = r * 2;
        ctx.beginPath();
        ctx.moveTo(x[i], y[i]);
        ctx.lineTo(x[i] - (vx[i] / v) * tail, y[i] - (vy[i] / v) * tail);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x[i], y[i], r, 0, TAU);
        ctx.fill();
      }
      if (d.e) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = Math.max(1, cell * 0.06);
        ctx.beginPath();
        ctx.arc(x[i], y[i], cell * 0.42 * grow, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = colors.ink;
        ctx.beginPath();
        ctx.arc(x[i], y[i], cell * 0.14 * grow, 0, TAU);
        ctx.fill();
      }
    }
    ctx.lineCap = 'butt';
    const t = n - 1;
    todayMark(f, x[t], y[t], cell * 0.3 * s[t]);
    ctx.globalAlpha = 1;
  },
};
