/* One line through time at a scale you can read. Commits rise as stalks above it, essays hang
   below with their titles, years stand as tall rules. The page flies in from the first day and
   stops at today; wheel or drag pans with inertia. */

import { type Field, type Variant, MONTHS, TAU, levelAlpha } from '../field-kit';
import { clamp, easeInOutQuart, edgeFade, font, lerp, pressMoved, pressStart, pressWasDrag, todayMark } from './d-common';

const left = (f: Field) => f.frame.left;
const panMin = (f: Field) => -f.frame.w * 0.12;
const panMax = (f: Field) => (f.n - 1) * f.state.sp - f.frame.w * 0.5;
const panToday = (f: Field) => (f.n - 1) * f.state.sp - f.frame.w * 0.8;

function place(f: Field) {
  const S = f.state;
  for (let i = 0; i < f.n; i++) {
    f.x[i] = f.tx[i] = left(f) + i * S.sp - S.pan;
    f.y[i] = f.ty[i] = S.lineY;
  }
}

export const timeline: Variant = {
  label: 'timeline',
  physics: true,
  layout(f) {
    const S = f.state;
    S.sp = f.width < 640 ? 10 : 14;
    S.lineY = f.frame.top + f.frame.h * (f.width < 640 ? 0.36 : 0.4);
    // The minimap: all of it, a hairline tall, along the bottom of the field.
    S.mapY = f.frame.top + f.frame.h - 6;
    if (S.pan === undefined) { S.pan = panToday(f); S.vel = 0; }
    // Essays alternate between four hanging depths so neighbours' titles never collide.
    S.essays = [];
    for (let i = 0, k = 0; i < f.n; i++) if (f.days[i].e) S.essays.push({ i, depth: k++ % 4 });
    place(f);
    return S.sp;
  },
  enter(f) {
    const S = f.state;
    if (f.reduced) return;
    S.flight = { t0: performance.now(), from: panMin(f), to: panToday(f), dur: 4200 };
    S.pan = panMin(f);
    place(f);
  },
  tick(f) {
    const S = f.state, p = f.pointer, dt = f.dt || 1 / 60;
    if (S.flight) {
      const u = clamp((f.now - S.flight.t0) / S.flight.dur, 0, 1);
      S.pan = lerp(S.flight.from, S.flight.to, easeInOutQuart(u));
      if (u >= 1) S.flight = null;
    } else if (p?.down && S.scrub) {
      // Scrubbing the minimap: the window follows the pointer.
      const total = (f.n - 1) * S.sp;
      const want = clamp((p.x - f.frame.left) / f.frame.w, 0, 1) * total - f.frame.w / 2;
      S.pan += (clamp(want, panMin(f), panMax(f)) - S.pan) * Math.min(1, dt * 14);
      S.vel = 0;
    } else if (p?.down && pressMoved(f)) {
      S.pan -= p.dx;
      S.vel = lerp(S.vel, -p.dx / dt, 0.4);
    } else {
      S.pan += S.vel * dt;
      S.vel *= Math.exp(-dt * 3);
      // Rubber-band back inside the story.
      const lo = panMin(f), hi = panMax(f);
      if (S.pan < lo) { S.pan += (lo - S.pan) * Math.min(1, dt * 9); S.vel *= 0.85; }
      if (S.pan > hi) { S.pan += (hi - S.pan) * Math.min(1, dt * 9); S.vel *= 0.85; }
    }
    if (p?.down && pressMoved(f)) S.flight = null;
    place(f);
  },
  wheel(f, e) {
    const S = f.state;
    S.flight = null;
    S.vel = 0;
    S.pan += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    S.pan = clamp(S.pan, panMin(f) - 120, panMax(f) + 120);
    return true;
  },
  pointerDown(f) {
    pressStart(f);
    f.state.flight = null;
    f.state.vel = 0;
    f.state.scrub = !!f.pointer && Math.abs(f.pointer.y - f.state.mapY) < 18;
  },
  pointerUp(f) {
    f.state.scrub = false;
  },
  click(f) {
    const scrubbed = Math.abs((f.pointer?.y ?? -99) - f.state.mapY) < 18;
    return pressWasDrag(f) || scrubbed;
  },
  draw(f) {
    const { ctx, colors, n, days, cal, x, lens, s } = f;
    const S = f.state, sp: number = S.sp, ly: number = S.lineY, W = f.width;
    const i0 = clamp(Math.floor((S.pan - 140) / sp), 0, n - 1);
    const i1 = clamp(Math.ceil((S.pan + W + 40) / sp), 0, n - 1);
    const t = n - 1;
    const ruleTop = ly - Math.min(160, f.frame.h * 0.34);

    // The line: solid through the past, dotted into the future.
    ctx.strokeStyle = colors.ink;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.moveTo(Math.max(x[0], 0), ly);
    ctx.lineTo(Math.min(x[t], W), ly);
    ctx.stroke();
    if (x[t] < W) {
      ctx.setLineDash([2, 5]);
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.moveTo(x[t] + sp * 0.6, ly);
      ctx.lineTo(W, ly);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.textBaseline = 'alphabetic';
    for (let i = i0; i <= i1; i++) {
      const xi = x[i], d = days[i], vis = s[i];
      if (vis < 0.01) continue;
      // Years stand as tall hairlines with their number on top; months get a small tick.
      if (cal.doy[i] === 0 || i === 0) {
        ctx.globalAlpha = 0.16 * vis;
        ctx.beginPath();
        ctx.moveTo(xi, ruleTop + 8);
        ctx.lineTo(xi, ly + 10);
        ctx.stroke();
        ctx.globalAlpha = vis;
        ctx.fillStyle = colors.ink;
        ctx.font = font(13);
        ctx.textAlign = 'left';
        ctx.fillText(String(cal.y[i]), xi - 1, ruleTop);
      } else if (cal.dom[i] === 1) {
        ctx.globalAlpha = 0.3 * vis;
        ctx.beginPath();
        ctx.moveTo(xi, ly + 3);
        ctx.lineTo(xi, ly + 8);
        ctx.stroke();
        if (sp >= 13) {
          ctx.globalAlpha = 0.9 * vis;
          ctx.fillStyle = colors.faint;
          ctx.font = font(10);
          ctx.textAlign = 'left';
          ctx.fillText(MONTHS[cal.m[i]], xi + 3, ly + 20);
        }
      }

      // Commits rise as stalks; the pointer lifts the ones near it.
      const lift = 1 + lens[i] * 0.7;
      if (d.c) {
        const h = Math.min(6 + Math.log1p(d.c) * sp * 0.95, ly - ruleTop - 26) * lift * vis;
        ctx.globalAlpha = levelAlpha(d.l);
        ctx.lineCap = 'round';
        ctx.lineWidth = Math.max(1.5, sp * 0.26);
        ctx.beginPath();
        ctx.moveTo(xi, ly - 4);
        ctx.lineTo(xi, ly - 4 - h);
        ctx.stroke();
        ctx.lineCap = 'butt';
        ctx.lineWidth = 1;
      } else {
        ctx.globalAlpha = vis;
        ctx.fillStyle = colors.dim;
        ctx.beginPath();
        ctx.arc(xi, ly, 1.4, 0, TAU);
        ctx.fill();
      }
    }

    // Essays hang beneath the line on threads, titles beside them.
    for (const { i, depth } of S.essays as { i: number; depth: number }[]) {
      const xi = x[i];
      if (xi < -360 || xi > W + 40 || s[i] < 0.01) continue;
      const end = ly + 46 + depth * 30, a = s[i];
      ctx.globalAlpha = 0.35 * a;
      ctx.beginPath();
      ctx.moveTo(xi, ly + 5);
      ctx.lineTo(xi, end - 3);
      ctx.stroke();
      ctx.globalAlpha = a;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(xi, ly, sp * 0.34, 0, TAU);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.fillStyle = colors.ink;
      ctx.beginPath();
      ctx.arc(xi, end, 2.5, 0, TAU);
      ctx.fill();
      ctx.font = font(12);
      ctx.textAlign = 'left';
      ctx.fillText(days[i].e!.map((e) => e.t).join(' · '), xi + 9, end + 4);
    }

    // You are here.
    if (x[t] > -40 && x[t] < W + 40) {
      todayMark(f, x[t], ly, sp * 0.34 + 1.5);
      const top = ruleTop + 30;
      ctx.globalAlpha = 0.5;
      ctx.setLineDash([1, 3]);
      ctx.beginPath();
      ctx.moveTo(x[t], top + 8);
      ctx.lineTo(x[t], ly - 10);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.ink;
      ctx.font = font(12);
      ctx.textAlign = 'center';
      ctx.fillText('you are here', x[t], top);
    }
    ctx.globalAlpha = 1;
    edgeFade(f, Math.min(120, W * 0.12));

    // Minimap: every day as a hairline tick, with the current view as a bracket.
    const fr = f.frame, my: number = S.mapY, total = (n - 1) * sp;
    for (let i = 0; i < n; i++) {
      const d = days[i];
      if (!d.l && !d.e) continue;
      const mx = fr.left + (i / (n - 1)) * fr.w;
      ctx.globalAlpha = d.e ? 1 : levelAlpha(d.l) * 0.7;
      ctx.fillStyle = colors.ink;
      const h = d.e ? 12 : 2 + d.l * 1.6;
      ctx.fillRect(mx, my - h, 1, h);
    }
    const v0 = fr.left + clamp(S.pan / total, 0, 1) * fr.w;
    const v1 = fr.left + clamp((S.pan + W) / total, 0, 1) * fr.w;
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = colors.ink;
    ctx.fillRect(v0, my - 16, Math.max(2, v1 - v0), 20);
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = colors.ink;
    ctx.lineWidth = 1;
    ctx.strokeRect(v0 + 0.5, my - 16.5, Math.max(2, v1 - v0) - 1, 20);
    ctx.globalAlpha = 1;
  },
};
