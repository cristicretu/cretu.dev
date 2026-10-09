/* Black hole: press and hold anywhere to open a gravity well. It grows while held, pulling
   nearby days into a streaking accretion swirl and swallowing the ones that cross the horizon.
   Let go and it collapses with a shockwave, flinging everything out before the days spring
   home with a bounce. */

import { type Variant, TAU, dotRadius, gridLayout } from '../field-kit';
import { clamp, dayDot, inkFor, liveHole, todayMark } from './a-draw';

const G = 3.6e7;
const SOFT = 22;
const GROW_SECONDS = 1.6;

type HoleState = {
  str: number;
  wx: number;
  wy: number;
  held: boolean;
  released: number;
  releasedR: number;
  everHeld: boolean;
  downAt: number;
};

const horizon = (str: number) => 8 + 46 * str;

export const blackhole: Variant = {
  label: 'blackhole',
  theme: 'dark',
  physics: true,
  lens: 0,
  layout: gridLayout,
  enter(f) {
    const st = f.state as HoleState;
    st.str = 0;
    st.held = false;
    st.released = -1e9;
    st.releasedR = 0;
    st.everHeld = false;
  },
  pointerDown(f) {
    const st = f.state as HoleState;
    st.downAt = performance.now();
    if (f.reduced || !f.pointer) return;
    st.held = true;
    st.everHeld = true;
    st.wx = f.pointer.x;
    st.wy = f.pointer.y;
  },
  pointerUp(f) {
    const st = f.state as HoleState;
    if (!st.held) return;
    st.held = false;
    // Collapse: fling everything near the well outward and around.
    const reach = 140 + 320 * st.str;
    for (let i = 0; i < f.n; i++) {
      const dx = f.x[i] - st.wx, dy = f.y[i] - st.wy, d = Math.hypot(dx, dy) || 1;
      if (d > reach * 2.2) continue;
      const w = Math.exp(-d / reach) * (0.4 + st.str);
      f.vx[i] += (dx / d) * 1500 * w - (dy / d) * 500 * w;
      f.vy[i] += (dy / d) * 1500 * w + (dx / d) * 500 * w;
    }
    st.released = f.now;
    st.releasedR = horizon(st.str);
    st.str = 0;
  },
  click(f) {
    // A quick tap still opens an essay; a hold was a black hole.
    return performance.now() - (f.state as HoleState).downAt > 250;
  },
  tick(f) {
    const st = f.state as HoleState;
    const { n, x, y, vx, vy, tx, ty, dt } = f;
    liveHole(f);
    if (f.reduced) {
      for (let i = 0; i < n; i++) { x[i] = tx[i]; y[i] = ty[i]; }
      return;
    }
    if (st.held && f.pointer) {
      // The well drifts after the pointer, heavily.
      st.wx += (f.pointer.x - st.wx) * Math.min(dt * 6, 1);
      st.wy += (f.pointer.y - st.wy) * Math.min(dt * 6, 1);
      st.str = Math.min(1, st.str + dt / GROW_SECONDS);
    }
    const held = st.held, str = st.str, Rh = horizon(str);
    const k = held ? 1.5 : 38, damp = held ? 0.5 : 5.5;
    const decay = Math.exp(-damp * dt);
    for (let i = 0; i < n; i++) {
      let ax = (tx[i] - x[i]) * k, ay = (ty[i] - y[i]) * k;
      if (held) {
        const dx = st.wx - x[i], dy = st.wy - y[i];
        const d2 = dx * dx + dy * dy + SOFT * SOFT, d = Math.sqrt(d2);
        const F = Math.min((G * (0.25 + str)) / d2, 26000);
        // Pull in, and swirl counter-clockwise: an accretion disc.
        ax += (F * dx) / d - (F * 0.85 * dy) / d;
        ay += (F * dy) / d + (F * 0.85 * dx) / d;
        // Past the horizon, drag bleeds the orbit so days spiral in and vanish.
        if (d < Rh * 1.6) { vx[i] *= 0.9; vy[i] *= 0.9; }
      }
      vx[i] = (vx[i] + ax * dt) * decay;
      vy[i] = (vy[i] + ay * dt) * decay;
      x[i] += vx[i] * dt;
      y[i] += vy[i] * dt;
    }
  },
  draw(f) {
    const st = f.state as HoleState;
    const { ctx, n, x, y, vx, vy, s, cell, days, colors, now } = f;
    const Rh = st.held ? horizon(st.str) : 0;

    ctx.lineCap = 'round';
    for (let i = 0; i < n - 1; i++) {
      if (s[i] < 0.01) continue;
      let scale = s[i];
      if (Rh) {
        const d = Math.hypot(x[i] - st.wx, y[i] - st.wy);
        scale *= clamp((d - Rh * 0.6) / (Rh * 0.8), 0, 1); // shrink as they fall in
        if (scale < 0.01) continue;
      }
      const r = dotRadius(days[i], cell) * scale;
      const speed = Math.hypot(vx[i], vy[i]);
      if (speed > 140) {
        // Fast days streak along their path.
        const k = Math.min(0.045, 26 / speed);
        inkFor(f, i);
        ctx.strokeStyle = days[i].l ? colors.ink : colors.dim;
        ctx.lineWidth = Math.max(1, r * 1.3);
        ctx.beginPath();
        ctx.moveTo(x[i], y[i]);
        ctx.lineTo(x[i] - vx[i] * k, y[i] - vy[i] * k);
        ctx.stroke();
        if (days[i].e) {
          ctx.globalAlpha = 1;
          ctx.strokeStyle = colors.ink;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x[i], y[i], cell * 0.38 * scale, 0, TAU);
          ctx.stroke();
        }
      } else {
        dayDot(f, i, x[i], y[i], r, cell * 0.38 * scale);
      }
    }
    const t = n - 1;
    if (s[t] > 0.01) todayMark(f, x[t], y[t], cell * 0.3 * s[t]);

    if (Rh) {
      // The horizon: a void ringed by a thin photon ring and a faint halo.
      const flicker = 1 + Math.sin(now / 90) * 0.015;
      const halo = ctx.createRadialGradient(st.wx, st.wy, Rh, st.wx, st.wy, Rh * 3.2);
      halo.addColorStop(0, colors.ink);
      halo.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.12 * st.str;
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(st.wx, st.wy, Rh * 3.2, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.bg;
      ctx.beginPath();
      ctx.arc(st.wx, st.wy, Rh, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(st.wx, st.wy, Rh * 1.04 * flicker, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(st.wx, st.wy, Rh * 1.9, Rh * 0.42, -0.35, 0, TAU);
      ctx.stroke();
    }

    // Collapse shockwave.
    const since = (now - st.released) / 1000;
    if (since >= 0 && since < 0.8) {
      const k = since / 0.8;
      ctx.globalAlpha = (1 - k) * 0.6;
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 1 + (1 - k) * 2;
      ctx.beginPath();
      ctx.arc(st.wx, st.wy, st.releasedR + k * 420, 0, TAU);
      ctx.stroke();
    }

    if (!st.everHeld && !f.reduced) {
      ctx.globalAlpha = 0.55 + Math.sin(now / 600) * 0.2;
      ctx.fillStyle = colors.faint;
      ctx.font = '500 12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('press and hold anywhere', f.frame.left + f.frame.w / 2, f.frame.top + f.frame.h + 28);
    }
    ctx.lineCap = 'butt';
    ctx.globalAlpha = 1;
  },
};
