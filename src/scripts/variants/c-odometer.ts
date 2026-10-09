/* The day count as a mechanical counter. Each lit LED pixel of a 5×7 dot-matrix numeral is a
   little k×k cluster of days, so the number is literally made of the days it counts. On load
   the drums spin up like an odometer (rightmost fastest, landing last); click to spin again. */

import { type Field, type Variant, TAU, levelAlpha } from '../field-kit';
import { SANS, clamp, drawToday, easeOutQuart, smooth } from './c-util';

const GLYPHS: Record<string, string[]> = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  ',': ['00', '00', '00', '00', '00', '11', '01'],
};

type Geo = {
  chars: string[];
  /** left column of each glyph, in LED pixels */
  colAt: number[];
  P: number;
  k: number;
  m: number;
  ox: number;
  oy: number;
  /** micro-dot positions not occupied by a day (structure only) */
  spare: Float32Array;
  /** glyph index of each day */
  glyphOf: Uint8Array;
};

function geometry(f: Field): Geo {
  const chars = f.n.toLocaleString('en-US').split('');
  const colAt: number[] = [];
  let cols = 0;
  chars.forEach((c, j) => {
    if (j) cols += 1;
    colAt.push(cols);
    cols += GLYPHS[c][0].length;
  });
  const fr = f.frame;
  const P = Math.min(fr.w / cols, (fr.h * 0.72) / 7);
  const ox = fr.left + (fr.w - cols * P) / 2;
  const oy = fr.top + (fr.h - 7 * P) / 2 - P * 0.35;
  let lit = 0;
  for (const c of chars) for (const row of GLYPHS[c]) for (const b of row) lit += b === '1' ? 1 : 0;
  let k = 1;
  while (lit * k * k < f.n) k++;
  return { chars, colAt, P, k, m: P / k, ox, oy, spare: new Float32Array(0), glyphOf: new Uint8Array(f.n) };
}

/** Micro-dot centers of every lit pixel, column-major so time runs left to right. */
function microDots(g: Geo) {
  const pts: { x: number; y: number; j: number }[] = [];
  g.chars.forEach((c, j) => {
    const rows = GLYPHS[c], w = rows[0].length;
    for (let col = 0; col < w; col++)
      for (let a = 0; a < g.k; a++)
        for (let row = 0; row < 7; row++) {
          if (rows[row][col] !== '1') continue;
          for (let b = 0; b < g.k; b++)
            pts.push({ x: g.ox + (g.colAt[j] + col) * g.P + (a + 0.5) * g.m, y: g.oy + row * g.P + (b + 0.5) * g.m, j });
        }
  });
  return pts;
}

const ROLL = 1.5; // seconds for the first drum; each next drum takes a little longer

export const odometer: Variant = {
  label: 'odometer',
  lens: 0.6,
  layout(f) {
    const g = geometry(f);
    const pts = microDots(g);
    const used = new Uint8Array(pts.length);
    for (let i = 0; i < f.n; i++) {
      const pi = Math.floor((i * pts.length) / f.n);
      used[pi] = 1;
      f.tx[i] = pts[pi].x;
      f.ty[i] = pts[pi].y;
      g.glyphOf[i] = pts[pi].j;
    }
    const spare: number[] = [];
    pts.forEach((p, pi) => { if (!used[pi]) spare.push(p.x, p.y); });
    g.spare = Float32Array.from(spare);
    f.state.geo = g;
    if (f.state.rollStart === undefined) f.state.rollStart = f.now || performance.now();
    return g.m;
  },
  enter(f) {
    f.state.rollStart = performance.now();
  },
  click(f, i) {
    if (i >= 0 && f.days[i].e) return false;
    f.state.rollStart = f.now;
    return true;
  },
  draw(f) {
    const g: Geo = f.state.geo;
    if (!g) return;
    const { ctx, colors, n, days, x, y, s, lens } = f;
    const { P, k, m } = g;
    const G = 9 * P; // drum pitch: one glyph plus a blank band
    const t = f.reduced ? 99 : (f.now - f.state.rollStart) / 1000;
    const digits = g.chars.map((c, j) => (c === ',' ? -1 : j)).filter((j) => j >= 0);

    // Unlit LEDs: the panel the numerals sit on.
    ctx.fillStyle = colors.dim;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    g.chars.forEach((c, j) => {
      const rows = GLYPHS[c];
      for (let row = 0; row < 7; row++)
        for (let col = 0; col < rows[0].length; col++) {
          if (rows[row][col] === '1') continue;
          const cx = g.ox + (g.colAt[j] + col + 0.5) * P, cy = g.oy + (row + 0.5) * P;
          ctx.moveTo(cx + m * 0.22, cy);
          ctx.arc(cx, cy, m * 0.22, 0, TAU);
        }
    });
    ctx.fill();

    // Drum state per glyph: value v rolls up to the target digit.
    const landed: number[] = [];
    const roll: { v: number; speed: number }[] = [];
    g.chars.forEach((c, j) => {
      if (c === ',') { landed[j] = 1; roll[j] = { v: 0, speed: 0 }; return; }
      const r = digits.indexOf(j);
      const dur = ROLL + r * 0.28;
      const spins = 1 + r;
      const p = clamp(t / dur, 0, 1);
      const target = Number(c);
      const v = target - 10 * spins * (1 - easeOutQuart(p));
      const speed = (10 * spins * 4 * (1 - p) ** 3) / dur; // digits per second
      roll[j] = { v, speed };
      landed[j] = smooth(0.92, 1, p);
    });

    // Ghost numerals on the spinning drums, stretched by their speed.
    g.chars.forEach((c, j) => {
      if (c === ',' || landed[j] >= 1) return;
      const { v, speed } = roll[j];
      const w = 5;
      const left = g.ox + g.colAt[j] * P, top = g.oy;
      ctx.save();
      ctx.beginPath();
      ctx.rect(left - P * 0.2, top - P * 0.6, w * P + P * 0.4, 7 * P + P * 1.2);
      ctx.clip();
      const blur = Math.min(speed * 0.012, 1) * P * 0.9;
      ctx.fillStyle = colors.ink;
      for (let kk = Math.floor(v) - 1; kk <= Math.floor(v) + 1; kk++) {
        const off = (kk - v) * G;
        if (Math.abs(off) > 8 * P) continue;
        const rows = GLYPHS[String(((kk % 10) + 10) % 10)];
        ctx.beginPath();
        for (let row = 0; row < 7; row++)
          for (let col = 0; col < 5; col++) {
            if (rows[row][col] !== '1') continue;
            for (let a = 0; a < k; a++)
              for (let b = 0; b < k; b++) {
                const cx = left + col * P + (a + 0.5) * m;
                const cy = top + row * P + (b + 0.5) * m + off;
                const fade = 1 - smooth(3.2 * P, 4.4 * P, Math.abs(cy - (top + 3.5 * P)));
                if (fade <= 0) continue;
                ctx.moveTo(cx + m * 0.26, cy);
                ctx.ellipse(cx, cy, m * 0.26, m * 0.26 + blur, 0, 0, TAU);
              }
          }
        ctx.globalAlpha = 0.55 * (1 - landed[j]);
        ctx.fill();
      }
      ctx.restore();
    });

    // Spare micro-dots inside lit pixels: same structure, no day behind them.
    ctx.fillStyle = colors.dim;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (let q = 0; q < g.spare.length; q += 2) {
      ctx.moveTo(g.spare[q] + m * 0.16, g.spare[q + 1]);
      ctx.arc(g.spare[q], g.spare[q + 1], m * 0.16, 0, TAU);
    }
    ctx.fill();

    // The days themselves, once their drum has landed.
    for (let i = 0; i < n - 1; i++) {
      const vis = s[i] * landed[g.glyphOf[i]];
      if (vis < 0.01) continue;
      const d = days[i], grow = 1 + lens[i] * 1.2;
      ctx.globalAlpha = (d.l ? levelAlpha(d.l) : 1) * vis;
      ctx.fillStyle = d.l ? colors.ink : colors.dim;
      ctx.beginPath();
      ctx.arc(x[i], y[i], m * (0.2 + 0.055 * d.l) * grow, 0, TAU);
      ctx.fill();
      if (d.e) {
        ctx.globalAlpha = vis;
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x[i], y[i], m * 0.62 * grow, 0, TAU);
        ctx.stroke();
      }
    }
    const today = n - 1;
    const tv = s[today] * landed[g.glyphOf[today]];
    if (tv > 0.01) drawToday(f, x[today], y[today], m * 0.42 * (1 + lens[today]));

    // Window rules above and below the drums, with a small caption.
    const ruleL = g.ox - P * 0.4, ruleR = g.ox + (g.colAt[g.chars.length - 1] + GLYPHS[g.chars[g.chars.length - 1]][0].length) * P + P * 0.4;
    ctx.globalAlpha = 0.18 * s[0];
    ctx.strokeStyle = colors.ink;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ruleL, g.oy - P * 0.6);
    ctx.lineTo(ruleR, g.oy - P * 0.6);
    ctx.moveTo(ruleL, g.oy + 7.6 * P);
    ctx.lineTo(ruleR, g.oy + 7.6 * P);
    ctx.stroke();
    ctx.globalAlpha = s[0];
    ctx.fillStyle = colors.faint;
    ctx.font = `400 ${Math.round(Math.max(11, Math.min(14, P * 0.28)))}px ${SANS}`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText('days shipped, and counting', ruleL, g.oy + 7.6 * P + 12);
    ctx.textAlign = 'right';
    const done = landed.every((l) => l >= 1);
    ctx.fillText(done ? 'click to spin again' : 'spinning…', ruleR, g.oy + 7.6 * P + 12);
    ctx.globalAlpha = 1;
  },
};
