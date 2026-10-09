/* The days woven into cloth: each day is a crossing of a weft row and a warp column in a 2/2
   twill, the thread over the crossing thicker and darker the more was shipped. Essays are
   knots with a loose tail; the last row is still being woven and ends at a needle. Hover
   presses into the cloth; press and drag pinches it and it snaps back on release. */

import { type Field, type Variant, TAU, fitGrid } from '../field-kit';
import { SANS, mix } from './c-util';

type Geo = { cols: number; rows: number; cell: number; hx: Float32Array; hy: Float32Array };

const weftOver = (r: number, c: number) => (r + c) % 4 < 2;

export const loom: Variant = {
  label: 'loom',
  lens: 0,
  layout(f) {
    const { cell, cols, rows } = fitGrid(f);
    const ox = f.frame.left + (f.frame.w - cols * cell) / 2 + cell / 2;
    const oy = f.frame.top + (f.frame.h - rows * cell) / 2 + cell / 2;
    const hx = new Float32Array(f.n), hy = new Float32Array(f.n);
    for (let i = 0; i < f.n; i++) {
      hx[i] = f.tx[i] = ox + (i % cols) * cell;
      hy[i] = f.ty[i] = oy + Math.floor(i / cols) * cell;
    }
    f.state.geo = { cols, rows, cell, hx, hy } satisfies Geo;
    return cell;
  },
  pointerDown(f) {
    if (f.pointer) f.state.grab = { x: f.pointer.x, y: f.pointer.y };
  },
  pointerUp(f) {
    f.state.grab = null;
  },
  tick(f) {
    const g: Geo = f.state.geo;
    if (!g) return;
    const { n, tx, ty } = f;
    const p = f.pointer, grab = f.state.grab as { x: number; y: number } | null;
    const R = g.cell * 4.2, R2 = R * R, spread = 2 * (g.cell * 3.2) ** 2;
    for (let i = 0; i < n; i++) {
      let ox = 0, oy = 0;
      if (grab && p) {
        // Pinch: cloth near the grab point follows the pointer, falling off with distance.
        const dx = g.hx[i] - grab.x, dy = g.hy[i] - grab.y;
        const w = Math.exp(-(dx * dx + dy * dy) / spread);
        let mx = p.x - grab.x, my = p.y - grab.y;
        const len = Math.hypot(mx, my), cap = g.cell * 7;
        if (len > cap) { mx *= cap / len; my *= cap / len; }
        ox = mx * w; oy = my * w;
      } else if (p && !f.reduced) {
        // A fingertip pressing into the cloth: threads part around it.
        const dx = g.hx[i] - p.x, dy = g.hy[i] - p.y, d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > 0.01) {
          const d = Math.sqrt(d2), push = (1 - d / R) ** 2 * g.cell * 0.55;
          ox = (dx / d) * push; oy = (dy / d) * push;
        }
      }
      tx[i] = g.hx[i] + ox;
      ty[i] = g.hy[i] + oy;
    }
  },
  draw(f) {
    const g: Geo = f.state.geo;
    if (!g) return;
    const { ctx, colors, n, days, x, y, s } = f;
    const { cols, cell } = g;
    const sway = f.reduced ? 0 : f.now / 900;
    const W = cell * 0.74;
    const half = cell * 0.5;

    // Each crossing is two short "floats": the thread underneath, then the one on top (the 2/2
    // twill decides which), separated by a hairline of page colour. Endpoints are midpoints to
    // the neighbouring crossings, so the cloth stays continuous when it's pulled.
    const under = new Path2D();
    const halo = new Path2D();
    const over: Path2D[] = Array.from({ length: 5 }, () => new Path2D());
    const mid = (i: number, j: number, ax: number, ay: number) =>
      j >= 0 && j < n && s[j] >= 0.5 ? [(x[i] + x[j]) / 2, (y[i] + y[j]) / 2] : [x[i] + ax, y[i] + ay];
    for (let i = 0; i < n; i++) {
      if (s[i] < 0.5) continue;
      const r = Math.floor(i / cols), c = i % cols;
      const [wx0, wy0] = mid(i, c > 0 ? i - 1 : -1, -half, 0);
      const [wx1, wy1] = mid(i, c < cols - 1 ? i + 1 : -1, half, 0);
      const [vx0, vy0] = mid(i, i - cols, 0, -half);
      const [vx1, vy1] = mid(i, i + cols, 0, half);
      const wo = weftOver(r, c);
      const [ux0, uy0, ux1, uy1] = wo ? [vx0, vy0, vx1, vy1] : [wx0, wy0, wx1, wy1];
      const [ox0, oy0, ox1, oy1] = wo ? [wx0, wy0, wx1, wy1] : [vx0, vy0, vx1, vy1];
      under.moveTo(ux0, uy0);
      under.lineTo(ux1, uy1);
      // Inset the float a touch so its rounded ends read as a stitch.
      const ix = (ox1 - ox0) * 0.06, iy = (oy1 - oy0) * 0.06;
      halo.moveTo(ox0 + ix, oy0 + iy);
      halo.lineTo(ox1 - ix, oy1 - iy);
      over[days[i].l].moveTo(ox0 + ix, oy0 + iy);
      over[days[i].l].lineTo(ox1 - ix, oy1 - iy);
    }
    // Opaque tones (no alpha) so overlapping float ends never darken.
    const tone = [0.12, 0.3, 0.45, 0.65, 0.92].map((t) => mix(colors.bg, colors.ink, t));
    ctx.lineCap = 'butt';
    ctx.globalAlpha = 1;
    ctx.strokeStyle = mix(colors.bg, colors.dim, 0.7);
    ctx.lineWidth = W * 0.92;
    ctx.stroke(under);
    ctx.lineCap = 'round';
    ctx.globalAlpha = 1;
    ctx.strokeStyle = colors.bg;
    ctx.lineWidth = W + 2;
    ctx.stroke(halo);
    for (let l = 0; l < 5; l++) {
      ctx.strokeStyle = tone[l];
      ctx.lineWidth = W;
      ctx.stroke(over[l]);
    }

    // Fringe: loose warp ends above the first row and weft ends off both selvedges.
    const fringe = new Path2D();
    for (let i = 0; i < n; i++) {
      if (s[i] < 0.5) continue;
      const c = i % cols;
      const wob = (k: number) => Math.sin(sway * 1.3 + i * 0.7 + k) * cell * 0.18;
      if (i < cols) {
        fringe.moveTo(x[i], y[i] - half);
        fringe.quadraticCurveTo(x[i] + wob(0) * 0.5, y[i] - cell * 0.85, x[i] + wob(1), y[i] - cell * 1.15);
      }
      if (c === 0) {
        fringe.moveTo(x[i] - half, y[i]);
        fringe.quadraticCurveTo(x[i] - cell * 0.85, y[i] + wob(0) * 0.5, x[i] - cell * 1.15, y[i] + wob(2));
      }
      if (c === cols - 1) {
        fringe.moveTo(x[i] + half, y[i]);
        fringe.quadraticCurveTo(x[i] + cell * 0.85, y[i] + wob(0) * 0.5, x[i] + cell * 1.15, y[i] + wob(2));
      }
    }
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = colors.dim;
    ctx.lineWidth = Math.max(1, W * 0.35);
    ctx.stroke(fringe);

    // Essays: a knot with a loose curling tail.
    for (let i = 0; i < n; i++) {
      if (!days[i].e || s[i] < 0.5) continue;
      const k = cell * 0.26;
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.ink;
      ctx.beginPath();
      ctx.ellipse(x[i], y[i], k * 1.15, k * 0.95, 0.6, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = colors.bg;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x[i], y[i], k * 0.55, k * 0.4, 0.6, 0, TAU);
      ctx.stroke();
      const sw = Math.sin(sway * 1.4 + i) * cell * 0.25;
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = Math.max(1, cell * 0.08);
      ctx.beginPath();
      ctx.moveTo(x[i] + k * 0.6, y[i] + k * 0.6);
      ctx.bezierCurveTo(x[i] + cell * 0.5, y[i] + cell * 0.6, x[i] + cell * 0.2 + sw, y[i] + cell * 0.9, x[i] + cell * 0.55 + sw, y[i] + cell * 1.05);
      ctx.stroke();
    }

    // Today: the weft runs off the last crossing to a needle, still working.
    const t = n - 1;
    if (s[t] > 0.5) {
      const bob = f.reduced ? 0 : Math.sin(f.now / 380) * cell * 0.18;
      const nx = x[t] + cell * 1.25, ny = y[t] - cell * 0.15 + bob;
      ctx.globalAlpha = 1;
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = Math.max(1, cell * 0.09);
      ctx.beginPath();
      ctx.moveTo(x[t], y[t]);
      ctx.quadraticCurveTo(x[t] + cell * 0.6, y[t] + cell * 0.35, nx - cell * 0.35, ny + cell * 0.12);
      ctx.stroke();
      ctx.save();
      ctx.translate(nx, ny);
      ctx.rotate(-0.42 + (f.reduced ? 0 : Math.sin(f.now / 380) * 0.08));
      ctx.fillStyle = colors.ink;
      ctx.beginPath();
      ctx.moveTo(-cell * 0.45, 0);
      ctx.quadraticCurveTo(0, -cell * 0.09, cell * 0.95, 0);
      ctx.quadraticCurveTo(0, cell * 0.09, -cell * 0.45, 0);
      ctx.fill();
      ctx.fillStyle = colors.bg;
      ctx.beginPath();
      ctx.ellipse(-cell * 0.3, 0, cell * 0.09, cell * 0.035, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = colors.faint;
      ctx.font = `400 11px ${SANS}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('today', nx + cell * 1.05, ny);
    }
    ctx.globalAlpha = 1;
  },
};
