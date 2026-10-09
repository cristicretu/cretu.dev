/* Powers of ten: the page opens inside today's dot and pulls back through weeks, months and
   years until every day is in view. Scroll or pinch zooms around the pointer, drag pans,
   clicking a day dives into it and clicking again surfaces. */

import { type Field, type Variant, dotRadius, gridLayout } from '../field-kit';
import { clamp, easeInOutCubic, font, lerp, pressMoved, pressStart, pressWasDrag } from './d-common';

type Flight = {
  /** the day that glides between the two screen positions */
  k: number;
  t0: number;
  delay: number;
  dur: number;
  lz0: number;
  lz1: number;
  sx0: number;
  sy0: number;
  sx1: number;
  sy1: number;
};

const home = (f: Field) => ({ x: f.frame.left + f.frame.w / 2, y: f.frame.top + f.frame.h / 2 });

function fly(f: Field, k: number, z1: number, sx1: number, sy1: number, dur: number, delay = 0) {
  const S = f.state;
  S.flight = {
    k, t0: f.now || performance.now(), delay, dur,
    lz0: Math.log(S.z), lz1: Math.log(z1),
    sx0: f.x[k], sy0: f.y[k], sx1, sy1,
  } satisfies Flight;
}

function span(f: Field) {
  const S = f.state;
  const across = f.frame.w / (S.base * S.z), down = f.frame.h / (S.base * S.z);
  const v = Math.min(f.n, Math.max(1, across * Math.max(1, down)));
  if (v < 2.5) return 'one day';
  if (v < 12) return 'one week';
  if (v < 45) return 'one month';
  if (v < 140) return 'a season';
  if (v < 520) return 'one year';
  if (v < f.n * 0.92) return `${Math.round(v / 365)} years`;
  return 'every day since 2021';
}

export const zoom: Variant = {
  label: 'zoom',
  physics: true,
  lens: 0,
  layout(f) {
    const S = f.state;
    const base = gridLayout(f);
    S.wx = Float32Array.from(f.tx);
    S.wy = Float32Array.from(f.ty);
    S.base = base;
    // Deep enough that today's dot fills a good part of the screen.
    S.zMax = (Math.min(f.width, f.height) * 0.32) / (base * 0.3);
    if (S.z === undefined) {
      const c = home(f);
      S.z = 1; S.cx = c.x; S.cy = c.y;
    }
    return base * S.z;
  },
  enter(f) {
    const S = f.state;
    if (f.reduced) return;
    const t = f.n - 1, c = home(f);
    // Start inside today, centered, then pull all the way back.
    S.z = S.zMax;
    S.cx = S.wx[t]; S.cy = S.wy[t];
    for (let i = 0; i < f.n; i++) {
      f.x[i] = c.x + (S.wx[i] - S.cx) * S.z;
      f.y[i] = c.y + (S.wy[i] - S.cy) * S.z;
    }
    fly(f, t, 1, S.wx[t], S.wy[t], 6400, 900);
  },
  tick(f) {
    const S = f.state, c = home(f), p = f.pointer;
    const fl: Flight | null = S.flight;
    if (fl) {
      const u = clamp((f.now - fl.t0 - fl.delay) / fl.dur, 0, 1), e = easeInOutCubic(u);
      S.z = Math.exp(lerp(fl.lz0, fl.lz1, e));
      // Keep the flight's day gliding on a straight screen path while the scale changes.
      const sx = lerp(fl.sx0, fl.sx1, e), sy = lerp(fl.sy0, fl.sy1, e);
      S.cx = S.wx[fl.k] - (sx - c.x) / S.z;
      S.cy = S.wy[fl.k] - (sy - c.y) / S.z;
      if (u >= 1) S.flight = null;
    }
    if (p?.down && pressMoved(f) && (p.dx || p.dy)) {
      S.flight = null;
      S.cx -= p.dx / S.z;
      S.cy -= p.dy / S.z;
    }
    // Fully zoomed out, the camera drifts home so the whole field stays framed.
    if (!S.flight && S.z < 1.04 && !p?.down) {
      const k = Math.min(1, f.dt * 6);
      S.z += (1 - S.z) * k;
      S.cx += (c.x - S.cx) * k;
      S.cy += (c.y - S.cy) * k;
    }
    f.cell = S.base * S.z;
    for (let i = 0; i < f.n; i++) {
      f.x[i] = f.tx[i] = c.x + (S.wx[i] - S.cx) * S.z;
      f.y[i] = f.ty[i] = c.y + (S.wy[i] - S.cy) * S.z;
    }
  },
  wheel(f, e) {
    const S = f.state, c = home(f);
    const p = f.pointer ?? c;
    const k = e.ctrlKey ? 0.012 : 0.0018;
    const nz = clamp(S.z * Math.exp(-e.deltaY * k), 1, S.zMax * 1.4);
    const wx = S.cx + (p.x - c.x) / S.z, wy = S.cy + (p.y - c.y) / S.z;
    S.cx = wx - (p.x - c.x) / nz;
    S.cy = wy - (p.y - c.y) / nz;
    S.z = nz;
    S.flight = null;
    return true;
  },
  pointerDown(f) {
    pressStart(f);
  },
  click(f, i) {
    if (pressWasDrag(f)) return true;
    const S = f.state, c = home(f);
    if (S.z > 1.6) {
      // Surface: the day nearest the middle glides back to its place in the grid.
      let k = i;
      if (k < 0) {
        let best = Infinity;
        for (let j = 0; j < f.n; j++) {
          const d = (f.x[j] - c.x) ** 2 + (f.y[j] - c.y) ** 2;
          if (d < best) { best = d; k = j; }
        }
      }
      fly(f, k, 1, S.wx[k], S.wy[k], 2200);
      return true;
    }
    if (i < 0 || f.days[i].e) return false;
    fly(f, i, S.zMax * 0.8, c.x, c.y, 2200);
    return true;
  },
  over(f) {
    const { ctx, colors, n, days, x, y } = f;
    const S = f.state;
    // Dates surface under any dot big enough to carry them.
    ctx.font = font(11);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = colors.faint;
    for (let i = 0; i < n; i++) {
      if (x[i] < -80 || x[i] > f.width + 80 || y[i] < -80 || y[i] > f.height + 80) continue;
      const r = i === n - 1 ? f.cell * 0.3 : Math.max(dotRadius(days[i], f.cell), days[i].e ? f.cell * 0.38 : 0);
      const a = clamp((r - 22) / 40, 0, 1);
      if (a <= 0) continue;
      ctx.globalAlpha = a;
      ctx.fillText(f.dateOf(i), x[i], y[i] + r + 12);
    }
    // The scale, quietly, between the nav and the field.
    ctx.globalAlpha = 1;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = colors.ink;
    ctx.font = font(12);
    const label = span(f);
    const hint = S.z < 1.05 && !S.flight && f.width >= 640 ? '  ·  scroll to zoom, click a day to dive in' : '';
    const yy = f.frame.top - 16, cx = f.frame.left + f.frame.w / 2;
    const lw = ctx.measureText(label).width;
    ctx.font = font(11);
    const hw = hint ? ctx.measureText(hint).width : 0;
    const x0 = cx - (lw + hw) / 2;
    ctx.textAlign = 'left';
    // A pill in the page colour so the label stays legible over zoomed dots.
    ctx.fillStyle = colors.bg;
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.roundRect(x0 - 10, yy - 15, lw + hw + 20, 22, 11);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.ink;
    ctx.font = font(12);
    ctx.fillText(label, x0, yy);
    if (hint) {
      ctx.font = font(11);
      ctx.fillStyle = colors.faint;
      ctx.fillText(hint, x0 + lw, yy);
    }
    ctx.globalAlpha = 1;
  },
};
