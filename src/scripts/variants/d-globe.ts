/* A small planet of days. Time spirals from the north pole (the first essay) to the south pole
   (today); years are latitude lines, essays stand up as pins. It spins in, drifts, and can be
   thrown around by dragging. Only the near hemisphere can be hovered. */

import { type Field, type Variant, TAU, dotRadius, levelAlpha } from '../field-kit';
import { clamp, font, pressMoved, pressStart, pressWasDrag, smoothstep, todayMark } from './d-common';

const D = 3.4; // camera distance, in sphere radii
const PIN = 1.17;
const AUTO = 0.14; // rad/s idle spin
const PITCH = -0.46; // tilted so the southern, recent hemisphere faces you

function build(f: Field) {
  const S = f.state, n = f.n;
  S.bx = new Float32Array(n); S.by = new Float32Array(n); S.bz = new Float32Array(n);
  S.pz = new Float32Array(n); S.pp = new Float32Array(n);
  S.sx = new Float32Array(n); S.sy = new Float32Array(n);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const yv = 1 - (2 * (i + 0.5)) / n, r = Math.sqrt(1 - yv * yv), a = i * golden;
    S.bx[i] = Math.cos(a) * r; S.by[i] = yv; S.bz[i] = Math.sin(a) * r;
  }
  // Latitudes where each year begins.
  S.years = [];
  for (let i = 1; i < n; i++) {
    if (f.cal.y[i] !== f.cal.y[i - 1]) S.years.push({ y: 1 - (2 * (i + 0.5)) / n, label: String(f.cal.y[i]) });
  }
  S.yaw = 0.6; S.pitch = PITCH; S.vyaw = AUTO; S.vpitch = 0;
}

/** Rotate a unit-sphere point and project it. Returns [screenX, screenY, depth, perspective]. */
function project(S: any, X: number, Y: number, Z: number, out: number[]) {
  const ca = Math.cos(S.yaw), sa = Math.sin(S.yaw), cb = Math.cos(S.pitch), sb = Math.sin(S.pitch);
  const x1 = X * ca + Z * sa, z1 = -X * sa + Z * ca;
  const y2 = Y * cb - z1 * sb, z2 = Y * sb + z1 * cb;
  const p = D / (D - z2);
  out[0] = S.cx + x1 * S.R * p;
  out[1] = S.cy - y2 * S.R * p;
  out[2] = z2;
  out[3] = p;
}

function projectAll(f: Field) {
  const S = f.state, o = [0, 0, 0, 0];
  for (let i = 0; i < f.n; i++) {
    const k = f.days[i].e ? PIN : 1;
    project(S, S.bx[i], S.by[i], S.bz[i], o);
    S.sx[i] = o[0]; S.sy[i] = o[1]; S.pz[i] = o[2]; S.pp[i] = o[3];
    if (k !== 1) project(S, S.bx[i] * k, S.by[i] * k, S.bz[i] * k, o);
    f.x[i] = f.tx[i] = o[0];
    f.y[i] = f.ty[i] = o[1];
  }
}

export const globe: Variant = {
  label: 'globe',
  physics: true,
  layout(f) {
    const S = f.state;
    if (!S.bx) build(f);
    S.R = Math.min(f.frame.w, f.frame.h) * 0.43;
    S.cx = f.frame.left + f.frame.w / 2;
    S.cy = f.frame.top + f.frame.h / 2;
    projectAll(f);
    return S.R * Math.sqrt((4 * Math.PI) / f.n) * 0.95;
  },
  enter(f) {
    // Spin in like a thrown marble, then settle into a drift.
    if (!f.reduced) f.state.vyaw = 5.5;
  },
  tick(f) {
    const S = f.state, p = f.pointer, dt = f.dt || 1 / 60;
    if (p?.down && pressMoved(f)) {
      S.yaw += p.dx * 0.0065;
      S.pitch = clamp(S.pitch + p.dy * 0.0065, -1.35, 1.35);
      S.vyaw += ((p.dx * 0.0065) / dt - S.vyaw) * 0.5;
      S.vpitch += ((p.dy * 0.0065) / dt - S.vpitch) * 0.5;
    } else if (!f.reduced) {
      S.yaw += S.vyaw * dt;
      S.pitch = clamp(S.pitch + S.vpitch * dt, -1.35, 1.35);
      // Momentum bleeds off toward a slow idle spin and the resting tilt.
      S.vyaw += (AUTO - S.vyaw) * Math.min(1, dt * 1.1);
      S.vpitch *= Math.exp(-dt * 2.5);
      S.pitch += (PITCH - S.pitch) * Math.min(1, dt * 0.35);
    }
    projectAll(f);
  },
  pointerDown(f) {
    pressStart(f);
  },
  click(f) {
    return pressWasDrag(f);
  },
  hit(f, px, py) {
    const S = f.state;
    let best = -1, bestD = Math.max(f.cell, 8) ** 2 * 0.6;
    for (let i = 0; i < f.n; i++) {
      if (S.pz[i] < 0.05 || f.s[i] < 0.5) continue;
      const d = (f.x[i] - px) ** 2 + (f.y[i] - py) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  },
  draw(f) {
    const { ctx, colors, n, days, x, y, s, lens, cell } = f;
    const S = f.state, o = [0, 0, 0, 0];

    // Silhouette.
    const rim = (S.R * D) / Math.sqrt(D * D - 1);
    ctx.strokeStyle = colors.ink;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.arc(S.cx, S.cy, rim, 0, TAU);
    ctx.stroke();

    // Year latitudes, brighter on the near side, labelled where they meet the right limb.
    ctx.font = font(10);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    for (const yr of S.years as { y: number; label: string }[]) {
      const r = Math.sqrt(1 - yr.y * yr.y);
      let px = 0, py = 0, pz = 0, bestX = -Infinity, lx = 0, ly = 0;
      for (let k = 0; k <= 96; k++) {
        const a = (k / 96) * TAU;
        project(S, Math.cos(a) * r, yr.y, Math.sin(a) * r, o);
        if (k > 0) {
          ctx.globalAlpha = (pz + o[2]) / 2 > 0 ? 0.16 : 0.05;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(o[0], o[1]);
          ctx.stroke();
        }
        if (o[2] > 0 && o[0] > bestX) { bestX = o[0]; lx = o[0]; ly = o[1]; }
        px = o[0]; py = o[1]; pz = o[2];
      }
      if (bestX > -Infinity) {
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = colors.faint;
        ctx.fillText(yr.label, lx + 8, ly);
      }
    }

    // Far side first, then near side, so near days sit on top.
    for (const near of [false, true]) {
      for (let i = 0; i < n; i++) {
        const z = S.pz[i];
        if (near !== z >= 0 || s[i] < 0.01) continue;
        const d = days[i], depth = 0.12 + 0.88 * smoothstep(-0.35, 0.45, z), p = S.pp[i];
        const grow = 1 + lens[i] * 1.2;
        if (d.e) {
          // A pin: thread from the surface to a ringed head.
          ctx.globalAlpha = depth;
          ctx.strokeStyle = colors.ink;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(S.sx[i], S.sy[i]);
          ctx.lineTo(x[i], y[i]);
          ctx.stroke();
          ctx.fillStyle = colors.bg;
          ctx.beginPath();
          ctx.arc(x[i], y[i], cell * 0.36 * p * grow * s[i], 0, TAU);
          ctx.fill();
          ctx.lineWidth = 1.25;
          ctx.stroke();
          ctx.fillStyle = colors.ink;
          ctx.beginPath();
          ctx.arc(x[i], y[i], cell * 0.12 * p * s[i], 0, TAU);
          ctx.fill();
          continue;
        }
        if (i === n - 1) continue;
        ctx.globalAlpha = (d.l ? levelAlpha(d.l) : 1) * depth;
        ctx.fillStyle = d.l ? colors.ink : colors.dim;
        ctx.beginPath();
        ctx.arc(x[i], y[i], dotRadius(d, cell) * p * grow * s[i], 0, TAU);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    const t = n - 1;
    if (S.pz[t] > -0.2) {
      ctx.globalAlpha = smoothstep(-0.2, 0.3, S.pz[t]);
      todayMark(f, x[t], y[t], cell * 0.3 * S.pp[t] * s[t]);
    }
    ctx.globalAlpha = 1;
  },
};
