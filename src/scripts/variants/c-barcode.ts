/* Every day as one bar of a barcode, edge to edge. Unmagnified the bars are finer than a pixel
   and read as texture; the pointer is a scanner loupe that spreads them apart (a smooth fisheye
   that keeps both ends pinned), with a laser line and essay titles printed under their guard
   bars. With no pointer the loupe drifts on its own. */

import { type Field, type Variant } from '../field-kit';
import { SANS, clamp, drawToday, smooth } from './c-util';

type Band = { left: number; w: number; top: number; h: number };

function band(f: Field): Band {
  const fr = f.frame;
  const h = Math.min(fr.h * 0.52, fr.w * 0.42);
  return { left: fr.left, w: fr.w, top: fr.top + (fr.h - h) / 2 - fr.h * 0.04, h };
}

const bump = (t: number) => (t < 1 ? (0.5 + 0.5 * Math.cos(Math.PI * t)) ** 1.6 : 0);

export const barcode: Variant = {
  label: 'barcode',
  physics: true,
  lens: 0,
  layout(f) {
    const b = band(f);
    f.state.band = b;
    f.state.weights ??= new Float32Array(f.n);
    f.state.widths ??= new Float32Array(f.n);
    f.state.center ??= b.left + b.w * 0.5;
    f.state.mag ??= 1;
    for (let i = 0; i < f.n; i++) {
      f.tx[i] = b.left + ((i + 0.5) / f.n) * b.w;
      f.ty[i] = b.top + b.h * 0.5;
    }
    return Math.max(b.w / f.n, 6);
  },
  tick(f) {
    const b: Band = f.state.band;
    const { n, x, y } = f;
    const p = f.pointer;
    const inBand = p && p.y > b.top - 60 && p.y < b.top + b.h + 80 && p.x > b.left && p.x < b.left + b.w;
    const mobile = b.w < 600;
    const M = mobile ? 9 : 16;
    let targetC: number, targetMag: number;
    if (inBand) {
      targetC = p!.x;
      targetMag = M;
    } else if (f.reduced) {
      targetC = f.state.center;
      targetMag = 1;
    } else {
      // Idle: the scanner wanders across the code.
      targetC = b.left + b.w * (0.5 + 0.42 * Math.sin(f.now / 5200));
      targetMag = M * 0.7;
    }
    const k = Math.min(f.dt * (inBand ? 30 : 3), 1);
    f.state.center += (targetC - f.state.center) * k;
    f.state.mag += (targetMag - f.state.mag) * Math.min(f.dt * 6, 1);
    const R = Math.max(70, b.w * (mobile ? 0.14 : 0.085));
    const c = f.state.center, mag = f.state.mag;
    const wts: Float32Array = f.state.weights;
    let total = 0;
    for (let i = 0; i < n; i++) {
      const hx = b.left + ((i + 0.5) / n) * b.w;
      const wt = 1 + (mag - 1) * bump(Math.abs(hx - c) / R);
      wts[i] = wt;
      total += wt;
    }
    // Cumulative widths keep the ends pinned and push the rest aside.
    const widths: Float32Array = f.state.widths;
    let acc = 0;
    for (let i = 0; i < n; i++) {
      const u = (b.w * wts[i]) / total;
      x[i] = b.left + acc + u / 2;
      y[i] = b.top + b.h * 0.5;
      widths[i] = u;
      acc += u;
    }
    f.state.R = R;
  },
  hit(f, px, py) {
    const b: Band = f.state.band;
    if (!b || py < b.top - 16 || py > b.top + b.h + 40) return -1;
    let lo = 0, hi = f.n - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (f.x[mid] < px) lo = mid + 1; else hi = mid;
    }
    const cand = lo > 0 && Math.abs(f.x[lo - 1] - px) < Math.abs(f.x[lo] - px) ? lo - 1 : lo;
    return f.s[cand] > 0.5 ? cand : -1;
  },
  draw(f) {
    const b: Band = f.state.band;
    if (!b) return;
    const { ctx, colors, n, days, x, s } = f;
    const wts: Float32Array = f.state.weights, widths: Float32Array = f.state.widths;
    const mag = f.state.mag;
    const guard = b.h * 0.09;

    for (let i = 0; i < n; i++) {
      if (s[i] < 0.01) continue;
      const d = days[i];
      const u = widths[i];
      const bw = Math.max(u * (d.e ? 0.62 : 0.3 + 0.11 * d.l), 0.35);
      const h = b.h + (d.e ? guard : 0);
      // Bars grow from the middle, left to right with the intro.
      ctx.globalAlpha = d.e ? 1 : d.l ? 0.42 + 0.145 * d.l : 1;
      ctx.fillStyle = d.e || d.l ? colors.ink : colors.dim;
      ctx.fillRect(x[i] - bw / 2, b.top + (b.h * (1 - s[i])) / 2, bw, b.h * s[i] + (h - b.h) * s[i]);
    }
    ctx.globalAlpha = 1;

    // Loupe: corner brackets, laser line and essay titles where it magnifies.
    const loupe = smooth(1.5, 4, mag);
    if (loupe > 0.01) {
      // The magnified span on screen: where weights are noticeably above 1.
      let l = -1, r = -1;
      for (let i = 0; i < n; i++) {
        if (wts[i] > 1 + (mag - 1) * 0.08) {
          if (l < 0) l = i;
          r = i;
        }
      }
      if (l >= 0) {
        const L = x[l] - widths[l] / 2 - 6, Rr = x[r] + widths[r] / 2 + 6;
        const T = b.top - 14, B = b.top + b.h + guard + 14, arm = 12;
        ctx.globalAlpha = loupe * 0.9;
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        for (const [cx, cy, sx, sy] of [[L, T, 1, 1], [Rr, T, -1, 1], [L, B, 1, -1], [Rr, B, -1, -1]]) {
          ctx.moveTo(cx + sx * arm, cy);
          ctx.lineTo(cx, cy);
          ctx.lineTo(cx, cy + sy * arm);
        }
        ctx.stroke();

        // Laser: a fine line sweeping up and down inside the brackets, with a soft glow.
        const ly = b.top + b.h * (0.5 + 0.46 * Math.sin(f.now / (f.reduced ? 1e9 : 420)));
        const grad = ctx.createLinearGradient(L, 0, Rr, 0);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.12, colors.ink);
        grad.addColorStop(0.88, colors.ink);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.globalAlpha = loupe * 0.12;
        ctx.fillRect(L, ly - 3, Rr - L, 6);
        ctx.globalAlpha = loupe * 0.85;
        ctx.fillRect(L, ly - 0.5, Rr - L, 1);

        // Date span above the loupe.
        ctx.globalAlpha = loupe;
        ctx.fillStyle = colors.faint;
        ctx.font = `400 11px ${SANS}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${f.dateOf(l)} – ${f.dateOf(r)}`, clamp((L + Rr) / 2, b.left + 60, b.left + b.w - 60), T - 6);

        // Essay titles hang under their guard bars, readable only when spread apart.
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = `400 10px ${SANS}`;
        for (let i = l; i <= r; i++) {
          if (!days[i].e) continue;
          const a = smooth(3, mag * 0.75, wts[i]);
          if (a < 0.02) continue;
          ctx.save();
          ctx.translate(x[i], b.top + b.h + guard + 8);
          ctx.rotate(Math.PI / 2);
          ctx.globalAlpha = a;
          ctx.fillStyle = colors.ink;
          const title = days[i].e!.map((e) => e.t).join(' · ');
          ctx.fillText(title.length > 30 ? `${title.slice(0, 29).trimEnd()}…` : title, 0, 0);
          ctx.restore();
        }
      }
    }

    // Human-readable line under the code, the way real barcodes print their digits.
    const essays = days.reduce((a, d) => a + (d.e?.length ?? 0), 0);
    const first = f.dateOf(0).split(' ');
    const digits = `${first[2]} ${String(f.cal.m[0] + 1).padStart(2, '0')} ${first[0].padStart(2, '0')}   ${n.toLocaleString('en-US').replace(',', ' ')}   ${essays}`;
    ctx.globalAlpha = s[0] * (1 - loupe * 0.85);
    ctx.fillStyle = colors.ink;
    ctx.font = `500 ${b.w < 600 ? 12 : 15}px ${SANS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.32em';
    ctx.fillText(digits, b.left + b.w / 2, b.top + b.h + guard + 18);
    if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0px';

    // Today: a notch under the last bar.
    const t = n - 1;
    if (s[t] > 0.5) {
      drawToday(f, x[t] - 1, b.top - 10, 3);
    }
    ctx.globalAlpha = 1;
  },
};
