/* Every day stands as a domino along one winding line. Tip the first and the chain runs through
   time: standing, a day is a dark edge; fallen, it shows its face — contribution level on one
   half, weekday on the other. Essays are heavy tiles that teeter before they go. Today falls
   last, then the whole line stands back up. */

import { type Field, type Variant, TAU, levelAlpha } from '../field-kit';
import { clamp, easeOutBack, font, serpentine, todayMark } from './d-common';

const GAP = 5.5; // ms between ordinary dominoes
const ESSAY_PAUSE = 360;
const FALL = 170;
const ESSAY_FALL = 300;

// Pip positions on a 3×3 lattice for 0–6.
const PIPS: [number, number][][] = [
  [],
  [[0, 0]],
  [[-1, -1], [1, 1]],
  [[-1, -1], [0, 0], [1, 1]],
  [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
];

function trigger(f: Field, now: number) {
  const S = f.state;
  let t = now;
  for (let i = 0; i < f.n; i++) {
    S.start[i] = t;
    t += f.days[i].e ? ESSAY_PAUSE : GAP + f.days[i].l * 0.6;
  }
  S.phase = 'falling';
  S.end = t + ESSAY_FALL;
}

/** Fall angle (0 standing … π/2 flat) and a teeter for essays waiting their turn. */
function angle(f: Field, i: number, now: number) {
  const S = f.state;
  if (S.phase === 'still') return Math.PI / 2;
  if (S.phase === 'rising') {
    const u = clamp((now - S.rise[i]) / 260, 0, 1);
    return (Math.PI / 2) * (1 - easeOutBack(u));
  }
  if (S.phase !== 'falling' && S.phase !== 'down') return 0;
  const e = !!f.days[i].e;
  const dur = e ? ESSAY_FALL : FALL;
  const since = now - S.start[i];
  if (since < 0) {
    // A heavy tile rocks when the one before it lands.
    const prevLanded = i > 0 && now - S.start[i - 1] > (f.days[i - 1].e ? ESSAY_FALL : FALL) * 0.55;
    return e && prevLanded ? Math.sin((now - S.start[i - 1]) / 45) * 0.09 : 0;
  }
  const u = clamp(since / dur, 0, 1);
  // Accelerates like gravity, with a tiny bounce on landing.
  const a = u * u * (Math.PI / 2);
  return u >= 1 ? Math.PI / 2 - Math.max(0, Math.sin((since - dur) / 30) * 0.08 * Math.exp(-(since - dur) / 80)) : a;
}

export const dominoes: Variant = {
  label: 'dominoes',
  lens: 0.5,
  layout(f) {
    const S = f.state;
    const g = serpentine(f);
    S.dir = new Float32Array(f.n);
    for (let i = 0; i < f.n; i++) {
      const j = i < f.n - 1 ? i + 1 : i - 1, k = i < f.n - 1 ? 1 : -1;
      S.dir[i] = Math.atan2((f.ty[j] - f.ty[i]) * k, (f.tx[j] - f.tx[i]) * k);
    }
    if (!S.start) {
      S.start = new Float64Array(f.n);
      S.rise = new Float64Array(f.n);
      S.weekday = new Uint8Array(f.n);
      for (let i = 0; i < f.n; i++) {
        S.weekday[i] = new Date(Date.UTC(f.cal.y[i], f.cal.m[i], f.cal.dom[i])).getUTCDay();
      }
      S.phase = 'idle';
      S.idleSince = performance.now();
    }
    return g.cell;
  },
  enter(f) {
    const S = f.state;
    if (f.reduced) S.phase = 'still';
    else S.idleSince = performance.now() - 4200; // first tip comes on its own, shortly
  },
  tick(f) {
    const S = f.state, now = f.now;
    if (S.phase === 'idle' && now - S.idleSince > 6000) trigger(f, now);
    if (S.phase === 'falling' && now > S.end) { S.phase = 'down'; S.downAt = now; S.todayFell = now; }
    if (S.phase === 'down' && now - S.downAt > 3200) {
      S.phase = 'rising';
      for (let i = 0; i < f.n; i++) S.rise[i] = now + i * 1.15;
    }
    if (S.phase === 'rising' && now > S.rise[f.n - 1] + 300) { S.phase = 'idle'; S.idleSince = now; }
  },
  click(f, i) {
    const S = f.state;
    if (S.phase === 'idle') { trigger(f, f.now || performance.now()); return true; }
    return i < 0 || !f.days[i].e;
  },
  draw(f) {
    const { ctx, colors, n, days, x, y, s, lens, cell, now } = f;
    const S = f.state;
    const T = cell * 0.16, W0 = cell * 0.58, H0 = cell * 0.98;

    for (let i = 0; i < n; i++) {
      if (s[i] < 0.01) continue;
      const d = days[i], e = !!d.e, k = (e ? 1.3 : 1) * s[i] * (1 + lens[i] * 0.4);
      const W = W0 * k, H = H0 * (e ? 1.15 : 1), th = angle(f, i, now);
      const lean = Math.sin(Math.max(0, th)), back = Math.min(0, th);
      // Footprint along the path: the face (H·sinθ) then the top edge (T·cosθ).
      const face = H * lean, edge = T * Math.cos(th);
      const u0 = -T / 2 + back * T * 2;
      ctx.save();
      ctx.translate(x[i], y[i]);
      ctx.rotate(S.dir[i]);

      if (face > 0.5) {
        // The face, shaded by the day's weight, with pips once it's mostly down.
        const ink = d.l ? 0.12 + 0.88 * levelAlpha(d.l) : 0;
        ctx.globalAlpha = 1;
        if (d.l) {
          ctx.fillStyle = colors.ink;
          ctx.globalAlpha = ink;
        } else {
          ctx.fillStyle = colors.dim;
          ctx.globalAlpha = 0.28;
        }
        ctx.beginPath();
        ctx.roundRect(u0, -W / 2, face, W, Math.min(2, cell * 0.08));
        ctx.fill();
        if (e) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = colors.bg;
          ctx.fill();
          ctx.strokeStyle = colors.ink;
          ctx.lineWidth = 1.25;
          ctx.stroke();
        }
        if (lean > 0.8 && cell >= 14) {
          const half = face / 2, pr = Math.max(0.7, cell * 0.035);
          const pipAlpha = (lean - 0.8) / 0.2;
          ctx.fillStyle = d.l && !e ? colors.bg : colors.ink;
          for (const [count, offset] of [[d.l, 0], [S.weekday[i], half]] as [number, number][]) {
            ctx.globalAlpha = pipAlpha * (d.l && !e ? 0.95 : 0.6);
            for (const [px, py] of PIPS[count]) {
              ctx.beginPath();
              ctx.arc(u0 + offset + half / 2 + px * half * 0.27, py * W * 0.27, pr, 0, TAU);
              ctx.fill();
            }
          }
          // The dividing line between the halves.
          ctx.globalAlpha = 0.35 * pipAlpha;
          ctx.fillStyle = d.l && !e ? colors.bg : colors.ink;
          ctx.fillRect(u0 + half - 0.3, -W * 0.36, 0.6, W * 0.72);
        }
      }
      // The top edge: what you see of a standing domino.
      ctx.globalAlpha = (0.2 + 0.8 * (d.l ? levelAlpha(d.l) : 0.1)) * (face > 0.5 ? 1 : 1);
      ctx.fillStyle = colors.ink;
      if (e) ctx.globalAlpha = 1;
      ctx.fillRect(u0 + face, -W / 2, Math.max(edge, 0.8), W);
      ctx.restore();
    }

    // Today: the last tile, with a ring that bursts when the chain reaches it.
    const t = n - 1;
    todayMark(f, x[t], y[t], cell * 0.16 * s[t]);
    if (S.todayFell && now - S.todayFell < 1400) {
      const u = (now - S.todayFell) / 1400;
      for (const lag of [0, 0.18]) {
        const v = clamp(u - lag, 0, 1);
        ctx.globalAlpha = (1 - v) * 0.6;
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.arc(x[t], y[t], cell * (0.5 + v * 5), 0, TAU);
        ctx.stroke();
      }
    }

    // A quiet invitation while the line is standing.
    if (S.phase === 'idle') {
      ctx.globalAlpha = 0.55 + 0.35 * Math.sin(now / 500);
      ctx.fillStyle = colors.faint;
      ctx.font = font(11);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('tap to tip', x[0] - cell * 0.3, y[0] - cell * 0.75);
    }
    ctx.globalAlpha = 1;
  },
};
