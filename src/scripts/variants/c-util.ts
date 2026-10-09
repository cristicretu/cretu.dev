import type { Field } from '../field-kit';

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
export const easeOutQuart = (t: number) => 1 - (1 - t) ** 4;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const smooth = (a: number, b: number, t: number) => {
  const x = clamp((t - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
};

/** Largest contribution count in the data, at least 1. */
export function maxCount(f: Field) {
  let m = 1;
  for (const d of f.days) if ((d.c ?? 0) > m) m = d.c!;
  return m;
}

/** 0–1 log-scaled activity for a day. */
export function activity(f: Field, i: number, max: number) {
  return Math.log1p(f.days[i].c ?? 0) / Math.log1p(max);
}

export const SANS = 'Inter, system-ui, sans-serif';

/** The engine's today pulse, for variants that take over drawing. */
export function drawToday(f: Field, x: number, y: number, r: number, color = f.colors.ink) {
  const { ctx } = f;
  const phase = f.reduced ? 0.5 : (f.now % 2400) / 2400;
  ctx.fillStyle = color;
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = (1 - phase) * 0.5;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r + phase * r * 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Opaque mix of two #rgb/#rrggbb colours (t = 0 → a, 1 → b); falls back to b. */
export function mix(a: string, b: string, t: number) {
  const parse = (c: string) => {
    const h = c.trim().replace('#', '');
    if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(h)) return null;
    const full = h.length === 3 ? h.split('').map((ch) => ch + ch).join('') : h;
    return [0, 2, 4].map((k) => parseInt(full.slice(k, k + 2), 16));
  };
  const A = parse(a), B = parse(b);
  if (!A || !B) return b;
  const c = A.map((v, k) => Math.round(v + (B[k] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
