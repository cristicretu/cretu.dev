/* Layouts for the days field. Each variant only decides where every day sits (and may draw
   something under or over the dots); springs, lens, hover, intro and the info hole are shared,
   so switching variants morphs the same dots from one shape into the next. */

import {
  type Field,
  type Variant,
  MONTHS,
  TAU,
  center,
  fitGrid,
  gridLayout,
  hash,
  levelAlpha,
  monthGrid,
} from './field-kit';
import { groupA } from './variants/a';
import { meadow } from './variants/meadow';
import { groupB } from './variants/b';
import { groupC } from './variants/c';
import { groupD } from './variants/d';

export type { Day, Field, Variant } from './field-kit';

function yearLabels(f: Field, g: ReturnType<typeof monthGrid>) {
  const { ctx, cal, n } = f;
  ctx.fillStyle = f.colors.faint;
  ctx.font = '500 11px Inter, system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    if (i > 0 && cal.y[i] === cal.y[i - 1]) continue;
    const col = g.colOf(i);
    ctx.globalAlpha = f.s[i];
    if (g.tall) {
      ctx.textAlign = 'right';
      ctx.fillText(String(cal.y[i]), g.ox - g.cell, g.oy + col * g.cell);
    } else {
      ctx.textAlign = 'left';
      ctx.fillText(String(cal.y[i]), g.ox + col * g.cell - g.cell * 0.3, g.oy - g.cell * 1.2);
    }
  }
  ctx.globalAlpha = 1;
}

const base: Record<string, Variant> = {
  /** The original: every day in reading order, as large a grid as fits. */
  grid: {
    label: 'grid',
    layout: gridLayout,
  },

  meadow,

  /** Sunflower: the first day at the center, today on the outer edge. */
  spiral: {
    label: 'spiral',
    layout(f) {
      const { cx, cy } = center(f);
      const c = Math.min(f.frame.w, f.frame.h) / 2 / Math.sqrt(f.n);
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < f.n; i++) {
        const r = c * Math.sqrt(i + 0.5), a = i * golden;
        f.tx[i] = cx + Math.cos(a) * r;
        f.ty[i] = cy + Math.sin(a) * r;
      }
      return c * 1.75;
    },
  },

  /** A clock face: one ring per year, the same date at the same angle every year. */
  rings: {
    label: 'rings',
    layout(f) {
      const { cx, cy } = center(f);
      const { cal, n } = f;
      const y0 = cal.y[0], years = cal.y[n - 1] - y0 + 1;
      const R = Math.min(f.frame.w, f.frame.h) / 2 - 18, inner = R * 0.3;
      const gap = (R - inner) / Math.max(years - 1, 1);
      for (let i = 0; i < n; i++) {
        const year = cal.y[i], len = year % 4 === 0 ? 366 : 365;
        const r = inner + (year - y0) * gap, a = -Math.PI / 2 + (TAU * cal.doy[i]) / len;
        f.tx[i] = cx + Math.cos(a) * r;
        f.ty[i] = cy + Math.sin(a) * r;
      }
      // Sized by the ring gap, not the arc: neighbouring days overlap into a textured band.
      return gap * 0.55;
    },
    under(f) {
      const { ctx, n } = f;
      const { cx, cy } = center(f);
      const R = Math.min(f.frame.w, f.frame.h) / 2 - 18;
      ctx.strokeStyle = f.colors.ink;
      ctx.fillStyle = f.colors.faint;
      ctx.lineWidth = 1;
      // Month names around the outside.
      ctx.font = '500 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = f.s[0];
      for (let m = 0; m < 12; m++) {
        const a = -Math.PI / 2 + (TAU * (m + 0.5)) / 12;
        ctx.fillText(MONTHS[m], cx + Math.cos(a) * (R + 18), cy + Math.sin(a) * (R + 18));
      }
      // The hand: center to today.
      const t = n - 1;
      ctx.globalAlpha = 0.18 * f.s[t];
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(f.x[t], f.y[t]);
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
  },

  /** A wall calendar: one column per month, one row per day of the month. */
  calendar: {
    label: 'calendar',
    layout(f) {
      const g = monthGrid(f);
      for (let i = 0; i < f.n; i++) g.place(i, g.colOf(i), f.cal.dom[i] - 1);
      return g.cell;
    },
    under(f) {
      yearLabels(f, monthGrid(f));
    },
  },

  /** The calendar, sorted: each month's active days sink to the floor, heaviest first. */
  stacks: {
    label: 'stacks',
    layout(f) {
      const g = monthGrid(f);
      const { n, days, cal } = f;
      for (let i = 0; i < n; ) {
        let j = i;
        while (j < n && cal.mi[j] === cal.mi[i]) j++;
        const idx = Array.from({ length: j - i }, (_, k) => i + k);
        const active = idx.filter((k) => days[k].l).sort((a, b) => days[b].l - days[a].l || a - b);
        const quiet = idx.filter((k) => !days[k].l);
        active.forEach((k, r) => g.place(k, g.colOf(k), 30 - r));
        quiet.forEach((k, r) => g.place(k, g.colOf(k), r));
        i = j;
      }
      return g.cell;
    },
    under(f) {
      yearLabels(f, monthGrid(f));
    },
  },

  /** Unknown Pleasures: one ridge per month, peaks are commits. */
  ridges: {
    label: 'ridges',
    hideDots: true,
    layout(f) {
      const { n, days, cal, frame: fr } = f;
      const months = cal.mi[n - 1] + 1;
      const gap = fr.h / (months + 6), amp = gap * 6;
      const max = Math.log1p(Math.max(1, ...days.map((d) => d.c ?? 0)));
      const left = fr.left + fr.w * 0.12, w = fr.w * 0.76;
      for (let i = 0; i < n; i++) {
        const v = Math.log1p(days[i].c ?? 0) / max;
        f.tx[i] = left + ((cal.dom[i] - 1) / 30) * w;
        f.ty[i] = fr.top + amp + cal.mi[i] * gap - v * amp;
      }
      return Math.max(gap, w / 31 / 2);
    },
    under(f) {
      const { ctx, n, cal, x, y, s } = f;
      const fr = f.frame;
      const months = cal.mi[n - 1] + 1;
      const gap = fr.h / (months + 6);
      const left = fr.left + fr.w * 0.12, w = fr.w * 0.76;
      ctx.lineWidth = 1.25;
      ctx.lineJoin = 'round';
      for (let i = 0; i < n; ) {
        let j = i;
        while (j < n && cal.mi[j] === cal.mi[i]) j++;
        const alpha = s[i];
        if (alpha > 0.01) {
          const base = fr.top + gap * 6 + cal.mi[i] * gap;
          ctx.beginPath();
          ctx.moveTo(left - fr.w * 0.06, base);
          ctx.lineTo(left - (w / 30) * 0.5, base);
          for (let k = i; k < j - 1; k++) {
            ctx.quadraticCurveTo(x[k], y[k], (x[k] + x[k + 1]) / 2, (y[k] + y[k + 1]) / 2);
          }
          ctx.quadraticCurveTo(x[j - 1], y[j - 1], x[j - 1] + (w / 30) * 0.5, base);
          ctx.lineTo(left + w + fr.w * 0.06, base);
          // Fill with the page colour so nearer ridges hide the ones behind.
          ctx.globalAlpha = 1;
          ctx.fillStyle = f.colors.bg;
          ctx.fill();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = f.colors.ink;
          ctx.stroke();
        }
        i = j;
      }
      ctx.globalAlpha = 1;
    },
  },

  /** The days spell the name, time running left to right through the letters. */
  name: {
    label: 'name',
    enter(f) {
      // Canvas text doesn't wait for webfonts; rasterize again once the heavy weight is in.
      document.fonts?.load('900 100px Inter').then(() => f.relayout());
    },
    layout(f) {
      const fr = f.frame;
      const W = Math.max(1, Math.floor(fr.w)), H = Math.max(1, Math.floor(fr.h));
      const off = document.createElement('canvas');
      off.width = W; off.height = H;
      const o = off.getContext('2d', { willReadFrequently: true })!;
      const word = 'cretu';
      o.font = '900 100px Inter, system-ui, sans-serif';
      const m = o.measureText(word);
      const tall = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      const size = Math.min((100 * W * 0.96) / m.width, (100 * H * 0.9) / tall);
      o.font = `900 ${size}px Inter, system-ui, sans-serif`;
      o.textAlign = 'center';
      o.textBaseline = 'alphabetic';
      const mm = o.measureText(word);
      o.fillText(word, W / 2, H / 2 + (mm.actualBoundingBoxAscent - mm.actualBoundingBoxDescent) / 2);
      const data = o.getImageData(0, 0, W, H).data;
      const sample = (sp: number) => {
        const pts: [number, number][] = [];
        for (let px = sp / 2; px < W; px += sp)
          for (let py = sp / 2; py < H; py += sp)
            if (data[(Math.floor(py) * W + Math.floor(px)) * 4 + 3] > 128) pts.push([px, py]);
        return pts;
      };
      // Widest spacing that still yields a dot for every day.
      let lo = 1, hi = 80;
      for (let k = 0; k < 18; k++) {
        const mid = (lo + hi) / 2;
        if (sample(mid).length >= f.n) lo = mid; else hi = mid;
      }
      const pts = sample(lo); // column-major already: left to right, top to bottom
      for (let i = 0; i < f.n; i++) {
        const p = pts[Math.floor((i * pts.length) / f.n)] ?? [W / 2, H / 2];
        f.tx[i] = fr.left + p[0];
        f.ty[i] = fr.top + p[1];
      }
      // Dots sit on a tight sampling grid; size them up so the letterforms read as solid ink.
      return lo * 1.7;
    },
  },

  /** The timeline as a paragraph: essay titles set as type, the days between them as dot runs,
      today a blinking caret at the end of the sentence. */
  prose: {
    label: 'prose',
    layout(f) {
      const { ctx, n, days, frame: fr } = f;
      const titleOf = (i: number) => days[i].e!.map((e) => e.t).join(', ');
      const flow = (fs: number, place: boolean) => {
        ctx.font = `500 ${fs}px Inter, system-ui, sans-serif`;
        const dotW = fs * 0.36, gap = fs * 0.32, lineH = fs * 1.38;
        let x = 0, y = 0;
        for (let i = 0; i < n; i++) {
          const w = days[i].e ? ctx.measureText(titleOf(i)).width + gap * 2 : dotW;
          if (x + w > fr.w && x > 0) { x = 0; y += lineH; }
          if (place) {
            f.state.left[i] = fr.left + x + (days[i].e ? gap : 0);
            f.tx[i] = fr.left + x + w / 2;
            f.ty[i] = fr.top + y + lineH / 2;
          }
          x += w;
        }
        return y + lineH;
      };
      // Largest type size whose paragraph still fits the frame.
      let lo = 6, hi = 96;
      for (let k = 0; k < 16; k++) {
        const mid = (lo + hi) / 2;
        if (flow(mid, false) <= fr.h) lo = mid; else hi = mid;
      }
      f.state.left = new Float32Array(n);
      f.state.fs = lo;
      const height = flow(lo, true);
      const dy = (fr.h - height) / 2;
      for (let i = 0; i < n; i++) f.ty[i] += dy;
      return lo * 0.5;
    },
    draw(f) {
      const { ctx, n, days, x, y, s, lens, colors, now } = f;
      const fs: number = f.state.fs ?? 16, left: Float32Array | undefined = f.state.left;
      ctx.font = `500 ${fs}px Inter, system-ui, sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      for (let i = 0; i < n - 1; i++) {
        if (s[i] < 0.01) continue;
        const d = days[i];
        if (d.e && left) {
          ctx.globalAlpha = s[i];
          ctx.fillStyle = colors.ink;
          // Text rides the spring: offset from its layout spot by the dot's live displacement.
          ctx.fillText(d.e.map((e) => e.t).join(', '), left[i] + (x[i] - f.tx[i]), y[i]);
          if (f.hovered === i) {
            const w = ctx.measureText(d.e.map((e) => e.t).join(', ')).width;
            ctx.fillRect(left[i] + (x[i] - f.tx[i]), y[i] + fs * 0.6, w, 1.5);
          }
          continue;
        }
        ctx.globalAlpha = (d.l ? levelAlpha(d.l) : 1) * s[i];
        ctx.fillStyle = d.l ? colors.ink : colors.dim;
        ctx.beginPath();
        ctx.arc(x[i], y[i], fs * (0.07 + 0.016 * d.l) * (1 + lens[i]), 0, TAU);
        ctx.fill();
      }
      // Today: the caret where the next word goes.
      const t = n - 1;
      ctx.globalAlpha = s[t] * (f.reduced || Math.floor(now / 530) % 2 === 0 ? 1 : 0);
      ctx.fillStyle = colors.ink;
      ctx.fillRect(x[t] - 1, y[t] - fs * 0.55, 2, fs * 1.1);
      ctx.globalAlpha = 1;
    },
  },

  /** Night sky: days as stars, essays joined into one constellation that ends at today. */
  sky: {
    label: 'sky',
    theme: 'dark',
    layout(f) {
      const { cell, cols, rows } = fitGrid(f);
      const ox = f.frame.left + (f.frame.w - cols * cell) / 2 + cell / 2;
      const oy = f.frame.top + (f.frame.h - rows * cell) / 2 + cell / 2;
      for (let i = 0; i < f.n; i++) {
        f.tx[i] = ox + (i % cols) * cell + (hash(i) - 0.5) * cell * 0.9;
        f.ty[i] = oy + Math.floor(i / cols) * cell + (hash(i + 9999) - 0.5) * cell * 0.9;
      }
      return cell;
    },
    alpha(f, i) {
      if (!f.days[i].l) return 0.5;
      return 0.55 + 0.45 * Math.sin(f.now / 900 + hash(i) * TAU);
    },
    under(f) {
      const { ctx, n, days, x, y, s } = f;
      ctx.strokeStyle = f.colors.ink;
      ctx.lineWidth = 1;
      let prev = -1;
      for (let i = 0; i < n; i++) {
        if (!days[i].e && i !== n - 1) continue;
        if (prev >= 0 && s[i] > 0.01) {
          ctx.globalAlpha = 0.2 * s[i];
          ctx.beginPath();
          ctx.moveTo(x[prev], y[prev]);
          ctx.lineTo(x[i], y[i]);
          ctx.stroke();
        }
        prev = i;
      }
      ctx.globalAlpha = 1;
    },
  },
};

export const variants: Record<string, Variant> = { ...base, ...groupA, ...groupB, ...groupC, ...groupD };
export const variantNames = Object.keys(variants);
