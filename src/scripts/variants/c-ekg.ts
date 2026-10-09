/* A heart monitor on graph paper: one lead per year, January to December, commits as spikes and
   every essay a full P-QRS-T beat. A sweep runs across all leads at once leaving a phosphor
   trail; hovering scrubs the sweep, and an essay "beeps" (ring + title) as the sweep crosses it. */

import { type Field, type Variant, MONTHS, TAU } from '../field-kit';
import { SANS, clamp, drawToday, maxCount } from './c-util';

type Lead = { year: number; top: number; base: number; ys: Float32Array; total: number; first: number; last: number };
type Geo = { left: number; w: number; top: number; rowH: number; samples: number; leads: Lead[]; dx: number };

const SWEEP = 7000; // ms per pass
const gauss = (x: number, mu: number, sd: number) => Math.exp(-((x - mu) ** 2) / (2 * sd * sd));

function geometry(f: Field): Geo {
  const fr = f.frame;
  const { cal, n, days } = f;
  const y0 = cal.y[0], years = cal.y[n - 1] - y0 + 1;
  const mobile = fr.w < 600;
  const left = fr.left + (mobile ? 0 : 40), w = fr.w - (mobile ? 0 : 40);
  const rowH = fr.h / years;
  const samples = Math.round(w * 1.5);
  const dx = w / 365;
  const max = maxCount(f);
  const leads: Lead[] = [];
  for (let r = 0; r < years; r++) {
    const top = fr.top + r * rowH;
    leads.push({ year: y0 + r, top, base: top + rowH * 0.66, ys: new Float32Array(samples), total: 0, first: -1, last: -1 });
  }
  // Sum of beat kernels per sample column, from the days near it.
  for (let i = 0; i < n; i++) {
    const L = leads[cal.y[i] - y0];
    if (L.first < 0) L.first = i;
    L.last = i;
    L.total += days[i].c ?? 0;
  }
  const A = rowH * 0.42;
  for (const L of leads) {
    for (let k = 0; k < samples; k++) {
      const px = (k / (samples - 1)) * w; // px from lead start
      const doy = px / dx;
      let v = 0;
      for (let dd = Math.floor(doy) - 4; dd <= Math.floor(doy) + 4; dd++) {
        const i = L.first + dd - f.cal.doy[L.first];
        if (i < L.first || i > L.last) continue;
        const d = days[i];
        const cx = (f.cal.doy[i] + 0.5) * dx;
        if (d.e) {
          const a = rowH * 0.56;
          v += a * (0.12 * gauss(px, cx - 1.9 * dx, 0.45 * dx) - 0.14 * gauss(px, cx - 0.32 * dx, 0.12 * dx)
            + 1 * gauss(px, cx, 0.16 * dx) - 0.3 * gauss(px, cx + 0.34 * dx, 0.13 * dx) + 0.24 * gauss(px, cx + 2.2 * dx, 0.6 * dx));
        } else if (d.c) {
          const a = A * (Math.log1p(d.c) / Math.log1p(max));
          v += a * (gauss(px, cx, 0.17 * dx) - 0.18 * gauss(px, cx + 0.36 * dx, 0.14 * dx));
        }
      }
      // Living baseline: a whisper of noise only where time has passed.
      const inside = doy >= f.cal.doy[L.first] && doy <= f.cal.doy[L.last] + 1;
      L.ys[k] = inside ? L.base - v + Math.sin(k * 1.7) * 0.35 * Math.sin(k * 0.13) : NaN;
    }
  }
  return { left, w, top: fr.top, rowH, samples, leads, dx };
}

export const ekg: Variant = {
  label: 'ekg',
  theme: 'dark',
  lens: 0,
  layout(f) {
    const g = geometry(f);
    f.state.geo = g;
    f.state.head ??= 0;
    const { cal, n } = f;
    const y0 = cal.y[0];
    for (let i = 0; i < n; i++) {
      const L = g.leads[cal.y[i] - y0];
      const k = Math.round(((cal.doy[i] + 0.5) * g.dx / g.w) * (g.samples - 1));
      // Sit on the peak of that day's spike.
      let peak = L.ys[k];
      for (let q = Math.max(0, k - 2); q <= Math.min(g.samples - 1, k + 2); q++) if (L.ys[q] < peak) peak = L.ys[q];
      f.tx[i] = g.left + (cal.doy[i] + 0.5) * g.dx;
      f.ty[i] = Number.isFinite(peak) ? peak : L.base;
    }
    return Math.max(g.dx, 7);
  },
  tick(f) {
    const g: Geo = f.state.geo;
    if (!g) return;
    const p = f.pointer;
    if (f.reduced) {
      f.state.head = (f.cal.doy[f.n - 1] + 0.5) * g.dx / g.w;
      return;
    }
    if (p && p.x > g.left && p.x < g.left + g.w) {
      const target = (p.x - g.left) / g.w;
      let d = target - f.state.head;
      if (d > 0.5) d -= 1; else if (d < -0.5) d += 1;
      f.state.head = (f.state.head + d * Math.min(f.dt * 10, 1) + 1) % 1;
    } else {
      f.state.head = (f.state.head + (f.dt * 1000) / SWEEP) % 1;
    }
  },
  draw(f) {
    const g: Geo = f.state.geo;
    if (!g) return;
    const { ctx, colors, n, days, x, y, s } = f;
    const head = f.state.head as number;

    // Graph paper: a fine line every week, a firmer one at each month.
    ctx.strokeStyle = colors.ink;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.045;
    ctx.beginPath();
    for (let d = 0; d <= 365; d += 7) {
      const gx = Math.round(g.left + d * g.dx) + 0.5;
      ctx.moveTo(gx, g.top);
      ctx.lineTo(gx, g.top + g.rowH * g.leads.length);
    }
    const unit = g.dx * 7;
    for (let gy = g.top; gy <= g.top + g.rowH * g.leads.length + 0.5; gy += unit) {
      ctx.moveTo(g.left, Math.round(gy) + 0.5);
      ctx.lineTo(g.left + g.w, Math.round(gy) + 0.5);
    }
    ctx.stroke();
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    const monthStarts = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
    for (const d of monthStarts) {
      const gx = Math.round(g.left + d * g.dx) + 0.5;
      ctx.moveTo(gx, g.top);
      ctx.lineTo(gx, g.top + g.rowH * g.leads.length);
    }
    ctx.stroke();

    // Month letters along the top, lead labels on the left.
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = colors.faint;
    ctx.font = `500 10px ${SANS}`;
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    for (let m = 0; m < 12; m++) ctx.fillText(MONTHS[m], g.left + monthStarts[m] * g.dx + 4, g.top - 6);

    const headX = g.left + head * g.w;
    for (const L of g.leads) {
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = colors.faint;
      ctx.font = `500 11px ${SANS}`;
      ctx.textBaseline = 'middle';
      const total = `${L.total.toLocaleString('en-US')}`;
      if (g.left - f.frame.left >= 30) {
        ctx.textAlign = 'right';
        ctx.fillText(String(L.year), g.left - 10, L.base - 6);
        ctx.globalAlpha = 0.45;
        ctx.font = `400 10px ${SANS}`;
        ctx.fillText(total, g.left - 10, L.base + 8);
      } else {
        ctx.textAlign = 'left';
        ctx.fillText(`${L.year}`, g.left + 2, L.top + 10);
        ctx.globalAlpha = 0.45;
        ctx.font = `400 10px ${SANS}`;
        ctx.fillText(`${total} commits`, g.left + 36, L.top + 10);
      }

      // Phosphor: draw the trace in chunks, brightest just behind the sweep, a gap just ahead.
      const CH = 90;
      const per = Math.ceil(g.samples / CH);
      ctx.lineJoin = 'round';
      for (let c = 0; c < CH; c++) {
        const k0 = c * per, k1 = Math.min(g.samples - 1, k0 + per);
        const u = (k0 + k1) / 2 / (g.samples - 1);
        const age = f.reduced ? 0.4 : (head - u + 1) % 1;
        if (age > 0.965) continue;
        const a = 0.2 + 0.8 * (1 - age) ** 2.4;
        const fresh = age < 0.06;
        ctx.beginPath();
        let pen = false;
        for (let k = k0; k <= k1; k++) {
          const yy = L.ys[k];
          if (!Number.isFinite(yy)) { pen = false; continue; }
          const xx = g.left + (k / (g.samples - 1)) * g.w;
          if (pen) ctx.lineTo(xx, yy); else { ctx.moveTo(xx, yy); pen = true; }
        }
        ctx.strokeStyle = colors.ink;
        if (fresh) {
          ctx.globalAlpha = 0.14 * (1 - age / 0.06);
          ctx.lineWidth = 5;
          ctx.stroke();
        }
        ctx.globalAlpha = a * s[L.first];
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }

      // The sweep's bright point on this lead.
      if (!f.reduced) {
        const k = Math.round(head * (g.samples - 1));
        const yy = L.ys[k];
        if (Number.isFinite(yy)) {
          const glow = ctx.createRadialGradient(headX, yy, 0, headX, yy, 16);
          glow.addColorStop(0, colors.ink);
          glow.addColorStop(1, 'transparent');
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = glow;
          ctx.fillRect(headX - 16, yy - 16, 32, 32);
          ctx.globalAlpha = 1;
          ctx.fillStyle = colors.ink;
          ctx.beginPath();
          ctx.arc(headX, yy, 2.2, 0, TAU);
          ctx.fill();
        }
      }
    }

    // Beeps: essays light up as the sweep crosses them.
    ctx.font = `500 11px ${SANS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    for (let i = 0; i < n; i++) {
      if (!days[i].e || s[i] < 0.5) continue;
      const u = (x[i] - g.left) / g.w;
      const age = f.reduced ? 1 : (head - u + 1) % 1;
      // A small permanent mark so essays read even between beeps.
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x[i], y[i] - 5, 2.5, 0, TAU);
      ctx.stroke();
      if (age < 0.22) {
        const t = age / 0.22;
        ctx.globalAlpha = (1 - t) * 0.8;
        ctx.beginPath();
        ctx.arc(x[i], y[i], 4 + t * 26, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = Math.min(1, (1 - t) * 1.6);
        ctx.fillStyle = colors.ink;
        const tx = clamp(x[i], g.left + 80, g.left + g.w - 80);
        ctx.fillText(days[i].e!.map((e) => e.t).join(' · '), tx, y[i] - 12 - t * 6);
      }
    }

    // Readout of the date under the sweep.
    if (!f.reduced) {
      const doy = Math.floor(head * 365);
      const md = new Date(Date.UTC(2023, 0, 1 + doy));
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = colors.ink;
      ctx.font = `500 11px ${SANS}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`${md.getUTCDate()} ${MONTHS[md.getUTCMonth()]}`, clamp(headX, g.left + 20, g.left + g.w - 20), g.top + g.rowH * g.leads.length + 6);
    }

    const t = n - 1;
    if (s[t] > 0.5) drawToday(f, x[t], y[t], 3);
    ctx.globalAlpha = 1;
  },
};
