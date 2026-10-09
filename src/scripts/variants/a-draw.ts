/* Drawing and bookkeeping shared by the tactile-physics variants (group A). */

import { type Field, TAU, levelAlpha } from '../field-kit';

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Ink weighted by contribution level; quiet days in the dim tone. */
export function inkFor(f: Field, i: number, alpha = 1) {
  const d = f.days[i];
  f.ctx.globalAlpha = (d.l ? levelAlpha(d.l) : 1) * alpha;
  f.ctx.fillStyle = d.l ? f.colors.ink : f.colors.dim;
}

/** A day as a dot with an essay ring, matching the default field's language. */
export function dayDot(f: Field, i: number, x: number, y: number, r: number, ring: number, alpha = 1) {
  const { ctx } = f;
  inkFor(f, i, alpha);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  if (f.days[i].e) {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = f.colors.ink;
    ctx.lineWidth = Math.max(1, f.cell * 0.06);
    ctx.beginPath();
    ctx.arc(x, y, ring, 0, TAU);
    ctx.stroke();
  }
}

/** Today: solid ink with a slow pulse ring. */
export function todayMark(f: Field, x: number, y: number, r: number) {
  const { ctx } = f;
  const phase = f.reduced ? 0.5 : (f.now % 2400) / 2400;
  ctx.globalAlpha = 1;
  ctx.fillStyle = f.colors.ink;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = (1 - phase) * 0.5;
  ctx.strokeStyle = f.colors.ink;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r * (1 + phase * 3), 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** For bodies that wander from their layout targets: hide whatever is under the info panel now. */
export function liveHole(f: Field) {
  const panel = f.infoOpen ? document.querySelector('[data-info-panel]') : null;
  if (!panel) {
    f.ts.fill(1);
    return;
  }
  const r = panel.getBoundingClientRect(), pad = Math.max(f.cell * 1.5, 16);
  const l = r.left - pad, rt = r.right + pad, t = r.top - pad, b = r.bottom + pad;
  for (let i = 0; i < f.n; i++) {
    f.ts[i] = f.x[i] > l && f.x[i] < rt && f.y[i] > t && f.y[i] < b ? 0 : 1;
  }
}

/** Columns of the row-major grid gridLayout() just wrote. */
export function gridCols(f: Field) {
  let cols = 1;
  while (cols < f.n && f.ty[cols] === f.ty[0]) cols++;
  return cols;
}

/** True when the engine just placed every day on its target (a fresh page load, not a morph). */
export function freshMount(f: Field) {
  const last = f.n - 1;
  return f.x[0] === f.tx[0] && f.y[0] === f.ty[0] && f.x[last] === f.tx[last] && f.y[last] === f.ty[last];
}
