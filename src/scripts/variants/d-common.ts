/* Helpers shared by the group D variants (camera, 3D, play). */

import { type Field, TAU, fitGrid } from '../field-kit';

export const font = (size: number, weight = 500) => `${weight} ${size}px Inter, system-ui, sans-serif`;

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);
export const easeOutBack = (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;

/** The default grid, but boustrophedon: odd rows run right to left, so consecutive days always touch. */
export function serpentine(f: Field) {
  const { cell, cols, rows } = fitGrid(f);
  const ox = f.frame.left + (f.frame.w - cols * cell) / 2 + cell / 2;
  const oy = f.frame.top + (f.frame.h - rows * cell) / 2 + cell / 2;
  for (let i = 0; i < f.n; i++) {
    const r = Math.floor(i / cols);
    const c = r % 2 ? cols - 1 - (i % cols) : i % cols;
    f.tx[i] = ox + c * cell;
    f.ty[i] = oy + r * cell;
  }
  /** Day index under a point, or -1. */
  const at = (px: number, py: number) => {
    const r = Math.round((py - oy) / cell), c = Math.round((px - ox) / cell);
    if (r < 0 || r >= rows || c < 0 || c >= cols) return -1;
    const i = r * cols + (r % 2 ? cols - 1 - c : c);
    return i < f.n ? i : -1;
  };
  return { cell, cols, rows, ox, oy, at };
}

/** Today's solid dot with the slow breathing ring every variant shares. */
export function todayMark(f: Field, x: number, y: number, r: number) {
  const { ctx, colors } = f;
  const phase = f.reduced ? 0.5 : (f.now % 2400) / 2400;
  ctx.globalAlpha = 1;
  ctx.fillStyle = colors.ink;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = (1 - phase) * 0.5;
  ctx.strokeStyle = colors.ink;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r * (1 + phase * 3), 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Fade the canvas out toward its left and right edges (reveals the page background). */
export function edgeFade(f: Field, size: number) {
  const { ctx, width } = f;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  const l = ctx.createLinearGradient(0, 0, size, 0);
  l.addColorStop(0, 'rgba(0,0,0,1)');
  l.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = l;
  ctx.fillRect(0, 0, size, f.height);
  const r = ctx.createLinearGradient(width - size, 0, width, 0);
  r.addColorStop(0, 'rgba(0,0,0,0)');
  r.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = r;
  ctx.fillRect(width - size, 0, size, f.height);
  ctx.restore();
}

/** Track whether a press turned into a drag, so the click that ends it can be swallowed. */
export function pressStart(f: Field) {
  f.state.press = f.pointer ? { x: f.pointer.x, y: f.pointer.y, moved: false } : null;
}
export function pressMoved(f: Field) {
  const p = f.state.press, q = f.pointer;
  if (p && q && !p.moved && Math.hypot(q.x - p.x, q.y - p.y) > 5) p.moved = true;
  return !!p?.moved;
}
/** True when the click ending this press should be ignored (it was a drag). Resets the press. */
export function pressWasDrag(f: Field) {
  const moved = !!f.state.press?.moved;
  f.state.press = null;
  return moved;
}
