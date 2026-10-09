/* A snake works through the days in order, along a boustrophedon path so it never jumps. Days
   it has eaten light up at their real weight; essays are big meals it gulps (you can watch the
   bulge travel down its body). Drag to steer it, or use W A S D. When it reaches today it
   curls up around it, sleeps, and the story starts over. */

import { type Field, type Variant, TAU, dotRadius, levelAlpha } from '../field-kit';
import { clamp, pressMoved, pressStart, pressWasDrag, serpentine, todayMark } from './d-common';

type Pt = { x: number; y: number };
type Mode = 'auto' | 'steer' | 'keys' | 'return' | 'coil' | 'still';

const KEYS: Record<string, [number, number]> = {
  w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
  ArrowUp: [0, -1], ArrowDown: [0, 1],
};

function pathAt(f: Field, p: number): Pt {
  const i = clamp(Math.floor(p), 0, f.n - 1), j = Math.min(i + 1, f.n - 1), u = p - i;
  return { x: f.tx[i] + (f.tx[j] - f.tx[i]) * u, y: f.ty[i] + (f.ty[j] - f.ty[i]) * u };
}

function eat(f: Field, i: number) {
  const S = f.state;
  if (i < 0 || S.eaten[i]) return;
  S.eaten[i] = 1;
  S.eatT[i] = f.now;
  S.count++;
  if (f.days[i].e) {
    S.gulps.push(f.now);
    S.pauseUntil = f.now + 420;
  }
}

function bodyLength(f: Field) {
  return f.cell * (4 + f.state.count * 0.013);
}

function moveHead(f: Field, tx: number, ty: number, speed: number, turn: number) {
  const S = f.state, h = S.head, dt = f.dt;
  const want = Math.atan2(ty - h.y, tx - h.x);
  let da = want - h.a;
  da = Math.atan2(Math.sin(da), Math.cos(da));
  h.a += clamp(da, -turn * dt, turn * dt);
  const dist = Math.hypot(tx - h.x, ty - h.y);
  const v = Math.min(speed, dist * 6);
  h.x += Math.cos(h.a) * v * dt;
  h.y += Math.sin(h.a) * v * dt;
}

function record(f: Field) {
  const S = f.state, h = S.head, hist: Pt[] = S.hist, last = hist[hist.length - 1];
  if (!last || Math.hypot(h.x - last.x, h.y - last.y) > 1.5) hist.push({ x: h.x, y: h.y });
  if (hist.length > 2400) hist.splice(0, hist.length - 2400);
}

function reset(f: Field, all: boolean) {
  const S = f.state, start = pathAt(f, 0);
  S.eaten = new Uint8Array(f.n);
  S.eatT = new Float32Array(f.n);
  S.count = 0;
  S.p = 0;
  S.gulps = [];
  S.pauseUntil = 0;
  if (all) {
    S.head = { x: start.x - f.cell * 3, y: start.y, a: 0 };
    S.hist = [];
    for (let k = 12; k >= 0; k--) S.hist.push({ x: start.x - f.cell * (3 + k * 0.4), y: start.y });
  }
}

export const snake: Variant = {
  label: 'snake',
  layout(f) {
    const S = f.state;
    const g = serpentine(f);
    const resized = S.g && (S.g.cell !== g.cell || S.g.ox !== g.ox);
    S.g = g;
    f.cell = g.cell;
    if (!S.eaten) { reset(f, true); S.mode = 'auto' as Mode; }
    else if (resized) {
      const h = S.mode === 'coil' ? { x: f.tx[f.n - 1], y: f.ty[f.n - 1] } : pathAt(f, S.p);
      S.head.x = h.x; S.head.y = h.y;
      S.hist = [{ x: h.x, y: h.y }];
    }
    return g.cell;
  },
  enter(f) {
    const S = f.state;
    S.onKey = (e: KeyboardEvent) => {
      const k = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (!k || S.mode === 'still' || (e.target as HTMLElement)?.closest?.('input, textarea')) return;
      e.preventDefault();
      S.keyDir = k;
      S.mode = 'keys';
      S.lastInput = performance.now();
    };
    window.addEventListener('keydown', S.onKey);
    if (f.reduced) {
      // Already fed and asleep, curled around today.
      S.eaten.fill(1);
      S.count = f.n;
      S.mode = 'still';
      const t = f.n - 1, L = bodyLength(f);
      S.hist = [];
      // Tail at the centre, head on the outside of the coil.
      let a = 0;
      for (let len = 0; len < L; a += 0.05) {
        const r = f.cell * (0.9 + a * 0.12);
        S.hist.push({ x: f.tx[t] + Math.cos(a) * r, y: f.ty[t] + Math.sin(a) * r });
        len += r * 0.05;
      }
      const head = S.hist[S.hist.length - 1];
      S.head = { x: head.x, y: head.y, a: a + Math.PI / 2 };
    }
  },
  exit(f) {
    window.removeEventListener('keydown', f.state.onKey);
  },
  pointerDown(f) {
    pressStart(f);
  },
  click(f) {
    return pressWasDrag(f);
  },
  tick(f) {
    const S = f.state, p = f.pointer, now = f.now, cell = f.cell;
    if (S.mode === 'still') return;

    if (p?.down && pressMoved(f)) { S.mode = 'steer'; S.lastInput = now; }
    if ((S.mode === 'steer' || S.mode === 'keys') && !p?.down && now - S.lastInput > 1600) S.mode = 'return';

    const fast = 260 + cell * 4;
    if (S.mode === 'auto') {
      if (now > S.pauseUntil) S.p = Math.min(f.n - 1, S.p + (14 + S.p * 0.025) * f.dt);
      const target = pathAt(f, S.p), ahead = pathAt(f, Math.min(f.n - 1, S.p + 0.5));
      // Slither: sway across the path as it goes.
      const pa = Math.atan2(ahead.y - target.y, ahead.x - target.x);
      const sway = Math.sin(S.p * 1.6) * cell * 0.22;
      target.x += -Math.sin(pa) * sway;
      target.y += Math.cos(pa) * sway;
      const h = S.head;
      if (Math.hypot(target.x - h.x, target.y - h.y) > 0.01) h.a = Math.atan2(target.y - h.y, target.x - h.x);
      h.x = target.x; h.y = target.y;
      for (let i = Math.floor(S.p); i >= 0 && !S.eaten[i]; i--) eat(f, i);
      if (S.p >= f.n - 1) {
        const t = f.n - 1;
        S.mode = 'coil';
        S.coilT = now;
        S.coilA = Math.atan2(h.y - f.ty[t], h.x - f.tx[t]) + 0.01;
        S.coilR = Math.max(cell * 1.6, Math.hypot(h.y - f.ty[t], h.x - f.tx[t]));
      }
    } else if (S.mode === 'steer' && p) {
      moveHead(f, p.x, p.y, fast, 8);
    } else if (S.mode === 'keys' || S.mode === 'steer') {
      const dir = S.mode === 'keys' ? S.keyDir : [Math.cos(S.head.a), Math.sin(S.head.a)];
      moveHead(f, S.head.x + dir[0] * 200, S.head.y + dir[1] * 200, fast * 0.85, 12);
      // Wrap around the field like the old phones did.
      const fr = f.frame, h = S.head;
      if (h.x < fr.left - cell) { h.x = fr.left + fr.w + cell; S.hist.push({ x: NaN, y: NaN }); }
      if (h.x > fr.left + fr.w + cell) { h.x = fr.left - cell; S.hist.push({ x: NaN, y: NaN }); }
      if (h.y < fr.top - cell) { h.y = fr.top + fr.h + cell; S.hist.push({ x: NaN, y: NaN }); }
      if (h.y > fr.top + fr.h + cell) { h.y = fr.top - cell; S.hist.push({ x: NaN, y: NaN }); }
    } else if (S.mode === 'return') {
      const target = pathAt(f, S.p);
      moveHead(f, target.x, target.y, fast, 9);
      if (Math.hypot(target.x - S.head.x, target.y - S.head.y) < cell * 0.35) S.mode = 'auto';
    } else if (S.mode === 'coil') {
      const t = f.n - 1;
      S.coilR = Math.max(cell * 0.85, S.coilR - cell * 1.4 * f.dt);
      S.coilA += (Math.min(220, cell * 9) / S.coilR) * f.dt * Math.max(0.15, 1 - (now - S.coilT) / 5000);
      S.head.x = f.tx[t] + Math.cos(S.coilA) * S.coilR;
      S.head.y = f.ty[t] + Math.sin(S.coilA) * S.coilR;
      S.head.a = S.coilA + Math.PI / 2;
      // Nap, then the days go dark again from the oldest, and it heads back to the start.
      const nap = now - S.coilT - 6500;
      if (nap > 0) {
        const upto = Math.floor((nap / 1600) * f.n);
        for (let i = 0; i < Math.min(upto, f.n); i++) S.eaten[i] = 0;
        if (upto >= f.n) {
          reset(f, false);
          S.mode = 'return';
        }
      }
    }

    // Free-roaming heads eat whatever they pass over.
    if (S.mode === 'steer' || S.mode === 'keys' || S.mode === 'return') eat(f, S.g.at(S.head.x, S.head.y));
    record(f);
  },
  draw(f) {
    const { ctx, colors, n, days, x, y, s, lens, cell, now } = f;
    const S = f.state;

    // The days: eaten ones at their true weight (with a little pop), the rest as faint crumbs.
    for (let i = 0; i < n - 1; i++) {
      if (s[i] < 0.01) continue;
      const d = days[i], grow = (1 + lens[i] * 1.4) * s[i];
      if (S.eaten[i]) {
        const pop = 1 + 0.9 * Math.exp(-(now - S.eatT[i]) / 140);
        ctx.globalAlpha = d.l ? levelAlpha(d.l) : 0.55;
        ctx.fillStyle = d.l ? colors.ink : colors.dim;
        ctx.beginPath();
        ctx.arc(x[i], y[i], dotRadius(d, cell) * grow * pop, 0, TAU);
        ctx.fill();
      } else {
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = colors.dim;
        ctx.beginPath();
        ctx.arc(x[i], y[i], cell * 0.05 * grow, 0, TAU);
        ctx.fill();
      }
      if (d.e) {
        ctx.globalAlpha = S.eaten[i] ? 1 : 0.45;
        ctx.strokeStyle = S.eaten[i] ? colors.ink : colors.faint;
        ctx.lineWidth = Math.max(1, cell * 0.06);
        ctx.beginPath();
        ctx.arc(x[i], y[i], cell * 0.38 * grow, 0, TAU);
        ctx.stroke();
      }
    }
    todayMark(f, x[n - 1], y[n - 1], cell * 0.3 * s[n - 1]);

    // The body: walk back from the head along its trail, tapering, with gulps as travelling bulges.
    const hist: Pt[] = S.hist, L = bodyLength(f), w0 = cell * 0.52;
    const bulges = (S.gulps as number[]).map((t0) => ((now - t0) / 1000) * cell * 7);
    S.gulps = (S.gulps as number[]).filter((_, k) => bulges[k] < L + cell);
    const pts: Pt[] = [{ x: S.head.x, y: S.head.y }];
    const lens2: number[] = [0];
    let len = 0;
    for (let k = hist.length - 1; k >= 0 && len < L; k--) {
      const a = pts[pts.length - 1], b = hist[k];
      if (Number.isNaN(b.x)) { pts.push(b); lens2.push(len); continue; }
      if (Number.isNaN(a.x)) { pts.push(b); lens2.push(len); continue; }
      const seg = Math.hypot(b.x - a.x, b.y - a.y);
      if (seg < 0.5) continue;
      if (len + seg > L) {
        // Cut the last segment exactly at the tail.
        const u = (L - len) / seg;
        pts.push({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
        lens2.push(L);
        break;
      }
      len += seg;
      pts.push(b);
      lens2.push(len);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = colors.ink;
    ctx.lineCap = 'round';
    for (let k = pts.length - 1; k > 0; k--) {
      const a = pts[k], b = pts[k - 1];
      if (Number.isNaN(a.x) || Number.isNaN(b.x)) continue;
      const t = Math.min(1, lens2[k] / L);
      let w = w0 * (1 - 0.72 * t ** 1.6);
      for (const bl of bulges) w += w0 * 0.55 * Math.exp(-(((lens2[k] - bl) / (cell * 0.9)) ** 2));
      ctx.lineWidth = Math.max(1, w);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    // Scales: a dotted spine in the page colour.
    ctx.fillStyle = colors.bg;
    let next = cell * 0.9;
    for (let k = 1; k < pts.length; k++) {
      if (lens2[k] < next || Number.isNaN(pts[k].x)) continue;
      next = lens2[k] + cell * 0.55;
      const t = Math.min(1, lens2[k] / L);
      ctx.globalAlpha = 0.5 * (1 - t);
      ctx.beginPath();
      ctx.arc(pts[k].x, pts[k].y, w0 * 0.09 * (1 - t * 0.6), 0, TAU);
      ctx.fill();
    }
    ctx.lineCap = 'butt';

    // Head, eyes that blink, and a tongue that tastes the air.
    const h = S.head, ca = Math.cos(h.a), sa = Math.sin(h.a);
    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.ink;
    ctx.beginPath();
    ctx.ellipse(h.x + ca * w0 * 0.12, h.y + sa * w0 * 0.12, w0 * 0.72, w0 * 0.6, h.a, 0, TAU);
    ctx.fill();
    const asleep = S.mode === 'still' || (S.mode === 'coil' && now - S.coilT > 3500);
    const blink = asleep || now % 4200 < 120;
    for (const side of [-1, 1]) {
      const ex = h.x + ca * w0 * 0.32 - sa * side * w0 * 0.3;
      const ey = h.y + sa * w0 * 0.32 + ca * side * w0 * 0.3;
      ctx.fillStyle = colors.bg;
      if (blink) {
        ctx.strokeStyle = colors.bg;
        ctx.lineWidth = Math.max(1, w0 * 0.07);
        ctx.beginPath();
        ctx.moveTo(ex - ca * w0 * 0.12, ey - sa * w0 * 0.12);
        ctx.lineTo(ex + ca * w0 * 0.12, ey + sa * w0 * 0.12);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(ex, ey, w0 * 0.15, 0, TAU);
        ctx.fill();
        ctx.fillStyle = colors.ink;
        ctx.beginPath();
        ctx.arc(ex + ca * w0 * 0.05, ey + sa * w0 * 0.05, w0 * 0.07, 0, TAU);
        ctx.fill();
      }
    }
    const flick = (now % 2300) / 300;
    if (!asleep && flick < 1) {
      const out = Math.sin(flick * Math.PI) * w0 * 0.9;
      const bx = h.x + ca * w0 * 0.78, by = h.y + sa * w0 * 0.78;
      const tx = bx + ca * out, ty = by + sa * out;
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = Math.max(1, w0 * 0.08);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(tx, ty);
      for (const side of [-1, 1]) {
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + (ca - sa * side * 0.8) * out * 0.3, ty + (sa + ca * side * 0.8) * out * 0.3);
      }
      ctx.stroke();
    }
    if (asleep) {
      // z z z
      ctx.fillStyle = colors.faint;
      ctx.font = `500 ${Math.max(10, cell * 0.45)}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'left';
      for (let k = 0; k < 3; k++) {
        const ph = ((now / 1400 + k / 3) % 1);
        ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.8;
        ctx.fillText('z', h.x + w0 + ph * cell * 1.2 + k * 2, h.y - w0 - ph * cell * 1.4);
      }
    }
    ctx.globalAlpha = 1;
  },
};
