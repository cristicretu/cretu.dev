/* Bubbles: days rise from the bottom of the screen in the order they happened, wobbling, and
   settle into the field with a little overshoot. They shy away from the pointer. Touch an
   essay and its bubble pops, the title floating up in small type; it blows back after a while. */

import { type Variant, TAU, gridLayout, hash, levelAlpha } from '../field-kit';
import { clamp, liveHole, todayMark } from './a-draw';

const RISE_SECONDS = 4;
const REGROW_AFTER = 4.5;

type BubbleState = {
  t0: number;
  mode: Uint8Array; // 0 waiting, 1 rising, 2 settled
  popped: Float64Array; // time of the last pop, ms
  lastHover: number;
};

export const bubbles: Variant = {
  label: 'bubbles',
  physics: true,
  lens: 0.6,
  layout: gridLayout,
  enter(f) {
    const st = f.state as BubbleState, n = f.n;
    st.t0 = f.now || performance.now();
    st.mode = new Uint8Array(n);
    st.popped = new Float64Array(n);
    st.lastHover = -1;
    if (f.reduced) {
      st.mode.fill(2);
      for (let i = 0; i < n; i++) { f.x[i] = f.tx[i]; f.y[i] = f.ty[i]; }
      return;
    }
    for (let i = 0; i < n; i++) {
      f.x[i] = f.tx[i];
      f.y[i] = f.height + f.cell * (1 + hash(i) * 4);
      f.vx[i] = 0;
      f.vy[i] = 0;
    }
  },
  tick(f) {
    const st = f.state as BubbleState;
    if (!st.mode) return;
    const { n, x, y, vx, vy, tx, ty, dt, cell } = f;
    const now = f.now;
    liveHole(f);

    // Touching an essay pops it.
    const h = f.hovered;
    if (h !== st.lastHover) {
      st.lastHover = h;
      if (h >= 0 && f.days[h].e && st.mode[h] === 2 && now - st.popped[h] > REGROW_AFTER * 1000) {
        st.popped[h] = now;
      }
    }
    if (f.reduced) return;

    const elapsed = (now - st.t0) / 1000, t = now / 1000;
    const p = f.pointer;
    for (let i = 0; i < n; i++) {
      const mode = st.mode[i];
      if (mode === 0) {
        if (elapsed < (i / n) * RISE_SECONDS + hash(i + 3) * 0.25) continue;
        st.mode[i] = 1;
        vy[i] = -(320 + hash(i + 5) * 220);
      }
      if (st.mode[i] === 1) {
        // Buoyant rise with a side-to-side wobble that calms as it nears its spot.
        vy[i] -= 120 * dt;
        y[i] += vy[i] * dt;
        const left = clamp((y[i] - ty[i]) / (f.height * 0.5), 0, 1);
        x[i] = tx[i] + Math.sin(t * 5 + hash(i) * TAU) * cell * 0.8 * left;
        if (y[i] <= ty[i]) { st.mode[i] = 2; vx[i] = 0; }
        continue;
      }
      // Settled: a soft, bouncy spring home, and shyness around the pointer.
      let ax = (tx[i] - x[i]) * 110, ay = (ty[i] - y[i]) * 110;
      if (p) {
        const dx = x[i] - p.x, dy = y[i] - p.y, d2 = dx * dx + dy * dy, R = cell * 3;
        if (d2 < R * R && d2 > 1) {
          const d = Math.sqrt(d2), push = (1 - d / R) * 2600;
          ax += (dx / d) * push; ay += (dy / d) * push;
        }
      }
      const decay = Math.exp(-6 * dt);
      vx[i] = (vx[i] + ax * dt) * decay;
      vy[i] = (vy[i] + ay * dt) * decay;
      x[i] += vx[i] * dt;
      y[i] += vy[i] * dt;
    }
  },
  draw(f) {
    const st = f.state as BubbleState;
    if (!st.mode) return;
    const { ctx, n, x, y, s, lens, cell, days, colors, now } = f;
    ctx.lineCap = 'round';

    for (let i = 0; i < n - 1; i++) {
      if (s[i] < 0.01 || st.mode[i] === 0) continue;
      const d = days[i];
      // Busier days blow bigger bubbles.
      let R = cell * (d.e ? 0.36 : 0.16 + 0.04 * d.l) * (1 + lens[i] * 0.8) * s[i];
      if (st.mode[i] === 1) R *= 0.8;

      // Popped essays: a burst, then the bubble blows back up.
      const since = (now - st.popped[i]) / 1000;
      if (st.popped[i] && since < REGROW_AFTER + 0.8) {
        if (since < 0.45) {
          const k = since / 0.45;
          ctx.globalAlpha = 1 - k;
          ctx.fillStyle = colors.ink;
          for (let j = 0; j < 8; j++) {
            const a = (j / 8) * TAU + hash(i + j) * 0.4;
            const rr = R * (1 + k * 1.8);
            ctx.beginPath();
            ctx.arc(x[i] + Math.cos(a) * rr, y[i] + Math.sin(a) * rr, Math.max(0.8, R * 0.13 * (1 - k)), 0, TAU);
            ctx.fill();
          }
        }
        if (since < REGROW_AFTER) continue;
        const g = (since - REGROW_AFTER) / 0.8;
        R *= 1 + Math.sin(g * Math.PI) * 0.25 - (1 - g) * 0.9; // overshoots as it re-inflates
        if (R < 0.5) continue;
      }

      // Soap film tinted by the day's ink, a rim, and a highlight.
      if (d.l) {
        ctx.globalAlpha = levelAlpha(d.l) * 0.55;
        ctx.fillStyle = colors.ink;
        ctx.beginPath();
        ctx.arc(x[i], y[i], R, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = d.e ? 1 : d.l ? 0.5 : 0.7;
      ctx.strokeStyle = d.e || d.l ? colors.ink : colors.dim;
      ctx.lineWidth = d.e ? 1.4 : 1;
      ctx.beginPath();
      ctx.arc(x[i], y[i], R, 0, TAU);
      ctx.stroke();
      if (R > 3.5) {
        ctx.globalAlpha = d.l >= 3 ? 0.85 : 0.6;
        ctx.strokeStyle = d.l >= 3 ? colors.bg : colors.ink;
        if (!d.l) ctx.globalAlpha = 0.25;
        ctx.lineWidth = Math.max(1, R * 0.16);
        ctx.beginPath();
        ctx.arc(x[i], y[i], R * 0.62, -2.5, -1.75);
        ctx.stroke();
      }
      if (d.e) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = colors.ink;
        ctx.beginPath();
        ctx.arc(x[i], y[i], R * 0.22, 0, TAU);
        ctx.fill();
      }
    }

    // Floating titles from popped essays.
    ctx.font = '500 12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      if (!st.popped[i]) continue;
      const since = (now - st.popped[i]) / 1000;
      if (since > 2.8) continue;
      const k = since / 2.8;
      const ease = 1 - (1 - k) ** 3;
      ctx.globalAlpha = Math.min(1, since / 0.2) * (1 - clamp((k - 0.65) / 0.35, 0, 1));
      ctx.fillStyle = colors.ink;
      const title = days[i].e![0].t;
      const tx = clamp(x[i], 80, f.width - 80);
      ctx.fillText(title, tx + Math.sin(since * 3) * 3, y[i] - cell * 0.8 - ease * 64);
    }

    const t = n - 1;
    if (s[t] > 0.01 && st.mode[t] !== 0) todayMark(f, x[t], y[t], cell * 0.3 * s[t]);
    ctx.lineCap = 'butt';
    ctx.globalAlpha = 1;
  },
};
