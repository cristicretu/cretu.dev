/* A halftone print of the word "hi" made of the days, on a hex screen. Dot size is ink coverage:
   the letters are embossed (a blurred height map), so the pointer works as a raking light and the
   bevels brighten and darken as it moves. Commits add a little ink to every dot; essays ring. */

import { type Field, type Variant, TAU, fitGrid, levelAlpha } from '../field-kit';
import { SANS, clamp } from './c-util';

const WORD = 'hi';

function heightMap(f: Field, cell: number) {
  const fr = f.frame;
  const sc = 0.25;
  const W = Math.max(8, Math.floor(fr.w * sc)), H = Math.max(8, Math.floor(fr.h * sc));
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const o = c.getContext('2d', { willReadFrequently: true })!;
  o.font = `900 100px ${SANS}`;
  const m = o.measureText(WORD);
  const tall = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  const size = Math.min((100 * W * 0.82) / m.width, (100 * H * 0.86) / tall);
  o.font = `900 ${size}px ${SANS}`;
  o.textAlign = 'center';
  o.textBaseline = 'alphabetic';
  const mm = o.measureText(WORD);
  o.fillStyle = '#000';
  o.fillText(WORD, W / 2, H / 2 + (mm.actualBoundingBoxAscent - mm.actualBoundingBoxDescent) / 2);
  const data = o.getImageData(0, 0, W, H).data;
  const a = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) a[i] = data[i * 4 + 3] / 255;
  // Separable box blur, three passes ≈ gaussian: rounds the letter edges into bevels.
  const r = Math.max(1, Math.round(cell * sc * 1.5));
  const tmp = new Float32Array(W * H);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < H; y++) {
      let acc = 0;
      for (let x = -r; x <= r; x++) acc += a[y * W + clamp(x, 0, W - 1)];
      for (let x = 0; x < W; x++) {
        tmp[y * W + x] = acc / (2 * r + 1);
        acc += a[y * W + clamp(x + r + 1, 0, W - 1)] - a[y * W + clamp(x - r, 0, W - 1)];
      }
    }
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += tmp[clamp(y, 0, H - 1) * W + x];
      for (let y = 0; y < H; y++) {
        a[y * W + x] = acc / (2 * r + 1);
        acc += tmp[clamp(y + r + 1, 0, H - 1) * W + x] - tmp[clamp(y - r, 0, H - 1) * W + x];
      }
    }
  }
  const sample = (px: number, py: number) => {
    const x = clamp((px - fr.left) * sc, 0, W - 1), y = clamp((py - fr.top) * sc, 0, H - 1);
    return a[Math.floor(y) * W + Math.floor(x)];
  };
  return { sample, step: 1 / sc };
}

export const halftone: Variant = {
  label: 'halftone',
  lens: 0,
  layout(f) {
    const { cell, cols, rows } = fitGrid(f);
    const ox = f.frame.left + (f.frame.w - (cols - 0.5) * cell) / 2 + cell / 2;
    const oy = f.frame.top + (f.frame.h - rows * cell) / 2 + cell / 2;
    for (let i = 0; i < f.n; i++) {
      const r = Math.floor(i / cols);
      f.tx[i] = ox + (i % cols) * cell + (r % 2 ? cell / 2 : 0);
      f.ty[i] = oy + r * cell;
    }
    const hm = heightMap(f, cell);
    const tone = new Float32Array(f.n), gx = new Float32Array(f.n), gy = new Float32Array(f.n);
    const e = hm.step * 1.5;
    for (let i = 0; i < f.n; i++) {
      tone[i] = hm.sample(f.tx[i], f.ty[i]);
      gx[i] = (hm.sample(f.tx[i] + e, f.ty[i]) - hm.sample(f.tx[i] - e, f.ty[i])) / (2 * e);
      gy[i] = (hm.sample(f.tx[i], f.ty[i] + e) - hm.sample(f.tx[i], f.ty[i] - e)) / (2 * e);
    }
    f.state.tone = tone; f.state.gx = gx; f.state.gy = gy;
    f.state.r ??= new Float32Array(f.n);
    return cell;
  },
  tick(f) {
    // The light: the pointer, or a slow orbit when there isn't one.
    const fr = f.frame;
    const cx = fr.left + fr.w / 2, cy = fr.top + fr.h / 2;
    let lx: number, ly: number;
    if (f.pointer) { lx = f.pointer.x; ly = f.pointer.y; }
    else if (f.reduced) { lx = fr.left; ly = fr.top; }
    else {
      const a = f.now / 2600;
      lx = cx + Math.cos(a) * fr.w * 0.42;
      ly = cy + Math.sin(a) * fr.h * 0.42;
    }
    const L = (f.state.light ??= { x: lx, y: ly });
    const k = Math.min(f.dt * 8, 1);
    L.x += (lx - L.x) * k; L.y += (ly - L.y) * k;
  },
  draw(f) {
    const { ctx, colors, n, days, x, y, s, cell } = f;
    const tone: Float32Array = f.state.tone, gx: Float32Array = f.state.gx, gy: Float32Array = f.state.gy;
    const rr: Float32Array = f.state.r;
    const L = f.state.light as { x: number; y: number } | undefined;
    if (!tone || !L) return;
    const lz = cell * 9, relief = cell * 44;
    const ease = Math.min(f.dt * 10, 1);
    ctx.fillStyle = colors.ink;
    for (let i = 0; i < n; i++) {
      if (s[i] < 0.01) continue;
      const d = days[i];
      // Surface normal from the bevel slope, then a lambert term against the light.
      let nx = -gx[i] * relief, ny = -gy[i] * relief, nz = 1;
      const nl = Math.hypot(nx, ny, nz);
      nx /= nl; ny /= nl; nz /= nl;
      let lx = L.x - x[i], ly = L.y - y[i], lzz = lz;
      const ll = Math.hypot(lx, ly, lzz);
      lx /= ll; ly /= ll; lzz /= ll;
      const lit = clamp(nx * lx + ny * ly + nz * lzz, 0, 1);
      const t = tone[i];
      // Lit faces print lighter (smaller dots); faces turned away print heavier.
      const cover = t * clamp(1.12 - lit * 1.0, 0.08, 1);
      const target = cell * (0.06 + 0.03 * d.l) + cell * 0.5 * Math.sqrt(cover);
      rr[i] += (target - rr[i]) * ease;
      ctx.globalAlpha = t > 0.15 ? 1 : d.l ? levelAlpha(d.l) : 0.9;
      ctx.fillStyle = t > 0.15 || d.l ? colors.ink : colors.dim;
      ctx.beginPath();
      ctx.arc(x[i], y[i], rr[i] * s[i], 0, TAU);
      ctx.fill();
      if (d.e) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x[i], y[i], Math.max(rr[i] + 3, cell * 0.42) * s[i], 0, TAU);
        ctx.stroke();
      }
    }
    // Today, last in the screen.
    const t = n - 1;
    if (s[t] > 0.01) {
      const ph = f.reduced ? 0.5 : (f.now % 2400) / 2400;
      ctx.globalAlpha = (1 - ph) * 0.6;
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x[t], y[t], cell * (0.35 + ph * 0.9), 0, TAU);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },
};
