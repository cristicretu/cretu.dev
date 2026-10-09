/* Group B — organic and cosmic. An orrery, a garden, a tree, fireflies, a galaxy and wet ink:
   the same days, given bodies that grow, sway, drift and glow. */

import { type Field, type Variant, TAU, center, gridLayout, hash, levelAlpha } from '../field-kit';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Fills every non-today day in one path per contribution level (one fill call each). */
function fillLevels(f: Field, shape: (i: number) => void, skip?: (i: number) => boolean) {
  const { ctx, days, n, colors, s } = f;
  for (let l = 0; l <= 4; l++) {
    ctx.beginPath();
    let any = false;
    for (let i = 0; i < n - 1; i++) {
      if (days[i].l !== l || s[i] < 0.01 || (skip && skip(i))) continue;
      shape(i);
      any = true;
    }
    if (!any) continue;
    ctx.globalAlpha = l ? levelAlpha(l) : 1;
    ctx.fillStyle = l ? colors.ink : colors.dim;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** A pointed leaf centred on (cx, cy), pointing along `ang`. Adds a subpath. */
function leafPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, len: number, wid: number, ang: number) {
  const c = Math.cos(ang), s = Math.sin(ang);
  const bx = cx - (c * len) / 2, by = cy - (s * len) / 2;
  const ex = cx + (c * len) / 2, ey = cy + (s * len) / 2;
  const px = -s * wid, py = c * wid;
  ctx.moveTo(bx, by);
  ctx.quadraticCurveTo(cx + px, cy + py, ex, ey);
  ctx.quadraticCurveTo(cx - px, cy - py, bx, by);
}

/** Today: a solid dot with a slow pulse ring. */
function todayPulse(f: Field, x: number, y: number, r: number) {
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

/** Soft round glow sprite, cached per colour. */
const sprites = new Map<string, HTMLCanvasElement>();
function glow(r: number, g: number, b: number) {
  const key = `${r},${g},${b}`;
  let c = sprites.get(key);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d')!;
  const grad = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
  grad.addColorStop(0.18, `rgba(${r},${g},${b},0.55)`);
  grad.addColorStop(0.45, `rgba(${r},${g},${b},0.14)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = grad;
  x.fillRect(0, 0, 64, 64);
  sprites.set(key, c);
  return c;
}

/* ------------------------------------------------------------------------------------------ */
/* orbit: an orrery. Each year is an orbit around today; inner years run faster (Kepler).     */

function orbitPlace(f: Field) {
  const st = f.state, g = st.g, ang: Float32Array = st.ang;
  for (let i = 0; i < f.n - 1; i++) {
    const year = f.cal.y[i], len = year % 4 === 0 ? 366 : 365;
    const r = g.Rmin + (year - g.y0) * g.gap;
    const omega = 0.09 * (g.Rmin / r) ** 1.5;
    const a = -Math.PI / 2 + (TAU * f.cal.doy[i]) / len + st.time * omega;
    ang[i] = a;
    f.tx[i] = g.cx + Math.cos(a) * r;
    f.ty[i] = g.cy + Math.sin(a) * r * g.tilt;
  }
  const t = f.n - 1;
  f.tx[t] = g.cx;
  f.ty[t] = g.cy;
  ang[t] = 0;
}

const orbit: Variant = {
  label: 'orbit',
  layout(f) {
    const st = f.state;
    st.time ??= 0;
    st.speed ??= 1;
    st.ang ??= new Float32Array(f.n);
    const { cx, cy } = center(f);
    const tilt = 0.42;
    const Rmax = Math.min(f.frame.w / 2, f.frame.h / 2 / tilt - 14) * 0.96;
    const y0 = f.cal.y[0], years = f.cal.y[f.n - 1] - y0 + 1;
    const Rmin = Rmax * 0.24;
    st.g = { cx, cy, tilt, Rmin, y0, years, gap: (Rmax - Rmin) / Math.max(years - 1, 1) };
    st.scale = clamp(Rmax / 420, 0.6, 1.6);
    orbitPlace(f);
    return Math.max(9, 11 * st.scale);
  },
  tick(f) {
    const st = f.state;
    // Hovering slows time almost to a stop, so a day can be read as it passes.
    const target = f.pointer ? 0.1 : 1;
    st.speed += (target - st.speed) * Math.min(f.dt * 3, 1);
    if (!f.reduced) st.time += f.dt * st.speed;
    orbitPlace(f);
  },
  over(f) {
    const { ctx, colors, s } = f, g = f.state.g;
    ctx.font = '500 10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    // Year labels sit on the orbits' near-right edge, on a chip of page colour so passing
    // bodies don't scribble through them.
    for (let k = 0; k < g.years; k++) {
      const r = g.Rmin + k * g.gap, lx = g.cx + r * 0.7071, ly = g.cy + r * g.tilt * 0.7071 + 3;
      ctx.globalAlpha = s[0];
      ctx.fillStyle = colors.bg;
      ctx.fillRect(lx - 14, ly - 1, 28, 13);
      ctx.globalAlpha = 0.6 * s[0];
      ctx.fillStyle = colors.faint;
      ctx.fillText(String(g.y0 + k), lx, ly);
    }
    ctx.globalAlpha = 1;
  },
  draw(f) {
    const { ctx, colors, n, x, y, s, lens, days } = f;
    const st = f.state, g = st.g, sc: number = st.scale, ang: Float32Array = st.ang;

    ctx.lineWidth = 1;
    ctx.font = '500 10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let k = 0; k < g.years; k++) {
      const r = g.Rmin + k * g.gap;
      ctx.globalAlpha = 0.1 * s[0];
      ctx.strokeStyle = colors.ink;
      ctx.beginPath();
      ctx.ellipse(g.cx, g.cy, r, r * g.tilt, 0, 0, TAU);
      ctx.stroke();
    }

    // Bodies nearer the viewer (lower half of each ellipse) are larger and drawn over the sun.
    const radius = (i: number) => {
      const d = days[i];
      const depth = 0.75 + 0.45 * ((Math.sin(ang[i]) + 1) / 2);
      return (d.l ? 1.25 + 0.75 * d.l : 0.95) * sc * depth * s[i] * (1 + lens[i] * 1.3);
    };
    const body = (i: number) => {
      const r = radius(i);
      ctx.moveTo(x[i] + r, y[i]);
      ctx.arc(x[i], y[i], r, 0, TAU);
    };
    fillLevels(f, body, (i) => Math.sin(ang[i]) >= 0);

    // The sun: today, with a slow corona.
    const t = n - 1, sr = 11 * sc * s[t];
    if (s[t] > 0.01) {
      ctx.strokeStyle = colors.ink;
      for (let k = 0; k < 3; k++) {
        const phase = f.reduced ? (k + 0.5) / 3 : ((f.now / 3200 + k / 3) % 1);
        ctx.globalAlpha = (1 - phase) * 0.3 * s[t];
        ctx.beginPath();
        ctx.arc(g.cx, g.cy, sr * (1.25 + phase * 2.8), 0, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.ink;
      ctx.beginPath();
      ctx.arc(x[t], y[t], sr * (1 + lens[t] * 0.3), 0, TAU);
      ctx.fill();
    }

    fillLevels(f, body, (i) => Math.sin(ang[i]) < 0);

    // Essays carry a moon, and the moon a satellite.
    ctx.strokeStyle = colors.ink;
    ctx.fillStyle = colors.ink;
    for (let i = 0; i < n - 1; i++) {
      if (!days[i].e || s[i] < 0.01) continue;
      const r = radius(i);
      ctx.globalAlpha = s[i];
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x[i], y[i], r + 3 * sc, 0, TAU);
      ctx.stroke();
      const ma = st.time * 1.4 + hash(i) * TAU;
      const mx = x[i] + Math.cos(ma) * 9 * sc, my = y[i] + Math.sin(ma) * 9 * sc * g.tilt;
      ctx.beginPath();
      ctx.arc(mx, my, 1.7 * sc * s[i], 0, TAU);
      ctx.fill();
      const sa = st.time * 4.2 + i;
      ctx.globalAlpha = 0.7 * s[i];
      ctx.beginPath();
      ctx.arc(mx + Math.cos(sa) * 3.6 * sc, my + Math.sin(sa) * 3.6 * sc * g.tilt, 0.8 * sc, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },
};

/* ------------------------------------------------------------------------------------------ */
/* garden: a stem per month. Days are leaves along it, essays bloom, the pointer stirs wind.  */

function gardenPlace(f: Field) {
  const st = f.state, g = st.g;
  const { cal, n, days } = f;
  const t: number = st.time;
  for (let m = 0; m < g.M; m++) {
    const wind = f.reduced ? 0 : 0.09 * Math.sin(t * 0.8 + m * 0.21) + 0.045 * Math.sin(t * 2.1 + m * 0.9);
    st.sway[m] = wind + st.bend[m];
  }
  for (let i = 0; i < n; i++) {
    const m = cal.mi[i];
    const u = 0.1 + (0.9 * (g.k[i] + 0.5)) / g.len[m];
    const H = g.H[m] * st.grow[m], b = st.sway[m];
    const sx = g.left + (m + 0.5) * g.spacing + b * H * 0.3 * u * u;
    const sy = g.ground - u * H;
    const side = g.k[i] % 2 ? 1 : -1;
    // Leaves point up and out from the stem's tangent.
    const tangent = Math.atan2(-H, 2 * b * H * 0.3 * u);
    const la = tangent + side * 0.95;
    const L = days[i].l ? g.spacing * (0.36 + 0.12 * days[i].l) : g.spacing * 0.2;
    st.la[i] = la;
    st.L[i] = L;
    f.tx[i] = sx + (Math.cos(la) * L) / 2;
    f.ty[i] = sy + (Math.sin(la) * L) / 2;
  }
}

const garden: Variant = {
  label: 'garden',
  layout(f) {
    const st = f.state, fr = f.frame, { n, cal, days } = f;
    const M = cal.mi[n - 1] + 1;
    const spacing = fr.w / M;
    const A = new Float32Array(M), len = new Uint8Array(M), k = new Uint8Array(n), first = new Int32Array(M).fill(-1);
    for (let i = 0; i < n; i++) {
      const m = cal.mi[i];
      if (first[m] < 0) first[m] = i;
      k[i] = len[m]++;
      A[m] += days[i].l + (days[i].e ? 3 : 0);
    }
    let Amax = 1;
    for (let m = 0; m < M; m++) Amax = Math.max(Amax, A[m]);
    const H = new Float32Array(M);
    for (let m = 0; m < M; m++) H[m] = fr.h * (0.16 + 0.78 * Math.sqrt(A[m] / Amax));
    st.g = { M, spacing, ground: fr.top + fr.h, H, len, k, first, left: fr.left };
    st.time ??= 0;
    st.bend ??= new Float32Array(M);
    st.bv ??= new Float32Array(M);
    st.sway ??= new Float32Array(M);
    st.grow ??= new Float32Array(M);
    st.la ??= new Float32Array(n);
    st.L ??= new Float32Array(n);
    gardenPlace(f);
    return clamp(spacing * 0.85, 5, 14);
  },
  tick(f) {
    const st = f.state, g = st.g, dt = f.dt;
    if (!f.reduced) st.time += dt;
    for (let m = 0; m < g.M; m++) {
      // Stems sprout as their first day arrives.
      const target = f.s[g.first[m]] > 0.3 ? 1 : 0;
      st.grow[m] += (target - st.grow[m]) * Math.min(dt * (f.reduced ? 60 : 2.6), 1);
    }
    const p = f.pointer;
    if (p && !f.reduced && p.dx) {
      for (let m = 0; m < g.M; m++) {
        const dx = p.x - (g.left + (m + 0.5) * g.spacing);
        if (Math.abs(dx) > 120 || p.y > g.ground + 12 || p.y < g.ground - g.H[m] - 30) continue;
        st.bv[m] += ((p.dx * 2.4) / (0.3 * g.H[m])) * (1 - Math.abs(dx) / 120);
      }
    }
    for (let m = 0; m < g.M; m++) {
      st.bv[m] += (-26 * st.bend[m] - 3.2 * st.bv[m]) * dt;
      st.bend[m] = clamp(st.bend[m] + st.bv[m] * dt, -1.3, 1.3);
    }
    gardenPlace(f);
  },
  draw(f) {
    const { ctx, colors, n, x, y, s, lens, days, cal } = f;
    const st = f.state, g = st.g;
    const la: Float32Array = st.la, L: Float32Array = st.L;

    // Ground and year marks.
    ctx.strokeStyle = colors.ink;
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(g.left - 8, g.ground + 0.5);
    ctx.lineTo(g.left + g.M * g.spacing + 8, g.ground + 0.5);
    ctx.stroke();
    ctx.fillStyle = colors.faint;
    ctx.font = '500 10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.globalAlpha = 0.7;
    for (let m = 0; m < g.M; m++) {
      const i = g.first[m];
      if (m > 0 && cal.y[i] === cal.y[g.first[m - 1]]) continue;
      ctx.fillText(String(cal.y[i]), g.left + m * g.spacing + 2, g.ground + 8);
    }

    // Stems.
    ctx.globalAlpha = 0.34;
    ctx.beginPath();
    for (let m = 0; m < g.M; m++) {
      const H = g.H[m] * st.grow[m];
      if (H < 1) continue;
      const x0 = g.left + (m + 0.5) * g.spacing;
      ctx.moveTo(x0, g.ground);
      ctx.quadraticCurveTo(x0, g.ground - H / 2, x0 + st.sway[m] * H * 0.3, g.ground - H);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    fillLevels(
      f,
      (i) => {
        const k = s[i] * (1 + lens[i] * 1.2);
        leafPath(ctx, x[i], y[i], L[i] * k, L[i] * 0.3 * k, la[i]);
      },
      (i) => !!days[i].e,
    );

    // Essays bloom: six petals around an open eye.
    for (let i = 0; i < n - 1; i++) {
      if (!days[i].e || s[i] < 0.01) continue;
      const pr = g.spacing * 0.42 * s[i] * (1 + lens[i] * 0.8) + 1.5;
      const spin = (f.reduced ? 0 : st.time * 0.25) + hash(i) * TAU;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = colors.ink;
      ctx.beginPath();
      for (let p = 0; p < 6; p++) {
        const a = spin + (p * TAU) / 6;
        leafPath(ctx, x[i] + Math.cos(a) * pr, y[i] + Math.sin(a) * pr, pr * 1.7, pr * 0.42, a);
      }
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.bg;
      ctx.beginPath();
      ctx.arc(x[i], y[i], pr * 0.42, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const t = n - 1;
    if (s[t] > 0.01) todayPulse(f, x[t], y[t], Math.max(2.5, g.spacing * 0.22) * s[t]);
  },
};

/* ------------------------------------------------------------------------------------------ */
/* tree: trunk is time, a branch per year, a twig per month; days are leaves, essays fruit.   */

type Twig = { sx: number; sy: number; ex: number; ey: number; B: number };

function treePlace(f: Field) {
  const st = f.state, g = st.g, { cal, n } = f;
  const t: number = st.time, calm = f.reduced ? 0 : 1;
  const lean = 0.022 * Math.sin(t * 0.5) * calm;
  const bx = g.cx, by = g.ground;
  const topX = bx + Math.sin(lean) * g.Ht, topY = by - Math.cos(lean) * g.Ht;
  st.trunk = [bx, by, topX, topY];
  const branches: number[][] = [];
  const twigs: Twig[] = st.twigs;
  for (let yi = 0; yi < g.Y; yi++) {
    const p = g.Y > 1 ? yi / (g.Y - 1) : 1;
    const along = 0.3 + 0.7 * p;
    const sx = bx + (topX - bx) * along, sy = by + (topY - by) * along;
    const newest = yi === g.Y - 1;
    const side = newest ? 0 : (g.Y - 2 - yi) % 2 === 0 ? 1 : -1;
    const A = lean + side * (1.02 - 0.46 * p) + 0.05 * Math.sin(t * 0.9 + yi * 1.7) * calm;
    const L = newest ? g.S * 0.6 : g.S * (0.8 - 0.3 * p);
    const ex = sx + Math.sin(A) * L, ey = sy - Math.cos(A) * L;
    branches.push([sx, sy, ex, ey, A, yi]);
    for (const mi of g.months[yi] as number[]) {
      const m = g.cm[mi];
      const u = 0.16 + (0.8 * (m + 0.5)) / 12;
      const ms = m % 2 ? 1 : -1;
      const B = A + ms * 0.82 + 0.1 * Math.sin(t * 1.6 + mi * 0.7) * calm;
      const tl = L * 0.36 * (1 - 0.4 * u);
      const tsx = sx + (ex - sx) * u, tsy = sy + (ey - sy) * u;
      twigs[mi] = { sx: tsx, sy: tsy, ex: tsx + Math.sin(B) * tl, ey: tsy - Math.cos(B) * tl, B };
    }
  }
  st.branches = branches;
  const ox: Float32Array = st.ox, oy: Float32Array = st.oy, la: Float32Array = st.la;
  for (let i = 0; i < n; i++) {
    const tw = twigs[cal.mi[i]];
    const v = 0.18 + (0.82 * (cal.dom[i] - 0.5)) / 31;
    const sd = cal.dom[i] % 2 ? 1 : -1;
    const off = g.cell * (0.4 + 0.45 * hash(i * 3.7)) * sd;
    // Perpendicular to the twig, whose direction is (sin B, -cos B).
    const px = Math.cos(tw.B), py = Math.sin(tw.B);
    la[i] = tw.B - Math.PI / 2 + sd * 0.9;
    f.tx[i] = tw.sx + (tw.ex - tw.sx) * v + px * off + ox[i];
    f.ty[i] = tw.sy + (tw.ey - tw.sy) * v + py * off + oy[i];
  }
}

function taper(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, w0: number, w1: number) {
  const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1;
  const nx = -dy / d, ny = dx / d;
  ctx.moveTo(x0 + nx * w0, y0 + ny * w0);
  ctx.lineTo(x1 + nx * w1, y1 + ny * w1);
  ctx.arc(x1, y1, w1, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI, true);
  ctx.lineTo(x0 - nx * w0, y0 - ny * w0);
  ctx.closePath();
}

const tree: Variant = {
  label: 'tree',
  layout(f) {
    const st = f.state, fr = f.frame, { cal, n } = f;
    const { cx } = center(f);
    const S = Math.min(fr.w * 0.5, fr.h * 0.74);
    const y0 = cal.y[0], Y = cal.y[n - 1] - y0 + 1, M = cal.mi[n - 1] + 1;
    const months: number[][] = Array.from({ length: Y }, () => []);
    const cm = new Uint8Array(M);
    for (let i = 0; i < n; i++) {
      const mi = cal.mi[i];
      if (i === 0 || mi !== cal.mi[i - 1]) {
        months[cal.y[i] - y0].push(mi);
        cm[mi] = cal.m[i];
      }
    }
    const cell = clamp(S / 26, 6, 12);
    st.g = { cx, ground: fr.top + fr.h, S, Ht: fr.h * 0.36, Y, months, cm, cell, scl: S / 300 };
    st.time ??= 0;
    st.twigs ??= new Array(M);
    st.ox ??= new Float32Array(n);
    st.oy ??= new Float32Array(n);
    st.ovx ??= new Float32Array(n);
    st.ovy ??= new Float32Array(n);
    st.la ??= new Float32Array(n);
    treePlace(f);
    return cell;
  },
  tick(f) {
    const st = f.state, { n, x, y, dt } = f;
    if (!f.reduced) st.time += dt;
    const ox: Float32Array = st.ox, oy: Float32Array = st.oy;
    const ovx: Float32Array = st.ovx, ovy: Float32Array = st.ovy;
    const p = f.pointer;
    if (p && !f.reduced) {
      const sp = Math.hypot(p.dx, p.dy);
      if (sp > 1.5) {
        // A fast pass through the crown shakes leaves loose.
        const R = 64;
        for (let i = 0; i < n; i++) {
          const d = Math.hypot(x[i] - p.x, y[i] - p.y);
          if (d > R) continue;
          const k = 1 - d / R;
          ovx[i] += p.dx * 7 * k + (hash(i * 9.1 + f.now) - 0.5) * sp * 6 * k;
          ovy[i] += p.dy * 7 * k - sp * 3 * k;
        }
      }
    }
    for (let i = 0; i < n; i++) {
      if (ovx[i] === 0 && ovy[i] === 0 && ox[i] === 0 && oy[i] === 0) continue;
      const far = Math.hypot(ox[i], oy[i]);
      // Loose leaves flutter, sag, and drift home.
      ovx[i] += (-4.5 * ox[i] - 1.5 * ovx[i] + Math.sin(f.now * 0.004 + i) * far * 0.9) * dt;
      ovy[i] += (-4.5 * oy[i] - 1.5 * ovy[i] + Math.min(far, 40) * 0.6) * dt;
      ox[i] += ovx[i] * dt;
      oy[i] += ovy[i] * dt;
      if (far < 0.05 && Math.abs(ovx[i]) + Math.abs(ovy[i]) < 0.05) ox[i] = oy[i] = ovx[i] = ovy[i] = 0;
    }
    treePlace(f);
  },
  draw(f) {
    const { ctx, colors, n, x, y, s, lens, days } = f;
    const st = f.state, g = st.g, scl: number = g.scl;
    const la: Float32Array = st.la;
    const grow = s[0];

    // Ground.
    ctx.strokeStyle = colors.ink;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.moveTo(g.cx - g.S * 0.7, g.ground + 0.5);
    ctx.lineTo(g.cx + g.S * 0.7, g.ground + 0.5);
    ctx.stroke();

    // Wood: one solid tone, filled piece by piece so joints never double up.
    const [bx, by, tx, ty] = st.trunk as number[];
    ctx.fillStyle = colors.faint;
    ctx.globalAlpha = grow;
    const fillPiece = (fn: () => void) => { ctx.beginPath(); fn(); ctx.fill(); };
    fillPiece(() => taper(ctx, bx, by, tx, ty, 8 * scl, 3.6 * scl));
    for (const sgn of [-1, 1]) {
      fillPiece(() => {
        ctx.moveTo(bx, by - 12 * scl);
        ctx.quadraticCurveTo(bx + sgn * 10 * scl, by - 3 * scl, bx + sgn * 30 * scl, by + 0.5);
        ctx.lineTo(bx, by + 0.5);
        ctx.closePath();
      });
    }
    for (const [sx, sy, ex, ey] of st.branches as number[][]) fillPiece(() => taper(ctx, sx, sy, ex, ey, 3.4 * scl, 0.9 * scl));
    ctx.strokeStyle = colors.faint;
    ctx.globalAlpha = 0.75 * grow;
    ctx.lineWidth = Math.max(0.8, scl);
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const tw of st.twigs as Twig[]) {
      if (!tw) continue;
      ctx.moveTo(tw.sx, tw.sy);
      ctx.lineTo(tw.ex, tw.ey);
    }
    ctx.stroke();

    // Year labels just past each branch tip.
    ctx.globalAlpha = 0.6 * grow;
    ctx.fillStyle = colors.faint;
    ctx.font = '500 10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const [, , ex, ey, A, yi] of st.branches as number[][]) {
      ctx.fillText(String(f.cal.y[0] + yi), ex + Math.sin(A) * 14, ey - Math.cos(A) * 14);
    }

    fillLevels(
      f,
      (i) => {
        const L = g.cell * (days[i].l ? 0.55 + 0.16 * days[i].l : 0.4) * s[i] * (1 + lens[i] * 1.2);
        leafPath(ctx, x[i], y[i], L, L * 0.34, la[i]);
      },
      (i) => !!days[i].e,
    );

    // Fruit.
    for (let i = 0; i < n - 1; i++) {
      if (!days[i].e || s[i] < 0.01) continue;
      const r = g.cell * 0.45 * s[i] * (1 + lens[i] * 0.8) + 1;
      ctx.globalAlpha = 1;
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x[i], y[i] - r);
      ctx.quadraticCurveTo(x[i] + r * 0.3, y[i] - r * 1.6, x[i] + r * 0.6, y[i] - r * 1.9);
      ctx.stroke();
      ctx.fillStyle = colors.ink;
      ctx.beginPath();
      ctx.arc(x[i], y[i], r, 0, TAU);
      ctx.fill();
      ctx.fillStyle = colors.bg;
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.arc(x[i] - r * 0.35, y[i] - r * 0.35, r * 0.24, 0, TAU);
      ctx.fill();
    }

    const t = n - 1;
    if (s[t] > 0.01) todayPulse(f, x[t], y[t], g.cell * 0.32 * s[t]);
  },
};

/* ------------------------------------------------------------------------------------------ */
/* fireflies: blinking oscillators that slowly fall into step (Kuramoto), gathered by hand.   */

const fireflies: Variant = {
  label: 'fireflies',
  theme: 'dark',
  physics: true,
  lens: 0.5,
  layout(f) {
    const st = f.state, { n, tx, ty, frame: fr } = f;
    const cell = gridLayout(f);
    st.hx ??= new Float32Array(n);
    st.hy ??= new Float32Array(n);
    for (let i = 0; i < n; i++) {
      st.hx[i] = clamp(tx[i] + (hash(i * 7.1) - 0.5) * cell * 3, fr.left, fr.left + fr.w);
      st.hy[i] = clamp(ty[i] + (hash(i * 3.3) - 0.5) * cell * 3, fr.top, fr.top + fr.h);
      tx[i] = st.hx[i];
      ty[i] = st.hy[i];
    }
    if (!st.ph) {
      st.ph = new Float32Array(n);
      st.om = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        st.ph[i] = hash(i * 11.3) * TAU;
        st.om[i] = TAU * (0.3 + 0.14 * (hash(i * 5.7) - 0.5));
      }
      st.t = 0;
    }
    st.cell = cell;
    return cell;
  },
  tick(f) {
    const st = f.state, { n, x, y, vx, vy, dt, width, height } = f;
    const hx: Float32Array = st.hx, hy: Float32Array = st.hy, ph: Float32Array = st.ph, om: Float32Array = st.om;
    if (f.reduced) {
      for (let i = 0; i < n; i++) { x[i] = hx[i]; y[i] = hy[i]; }
      return;
    }
    st.t += dt;

    // Local mean field on a coarse grid: each firefly listens to its neighbourhood only,
    // so synchrony spreads as travelling waves instead of one global blink.
    const G = 110, cols = Math.ceil(width / G) + 2, rows = Math.ceil(height / G) + 2;
    if (!st.gc || st.gc.length !== cols * rows * 3) st.gc = new Float32Array(cols * rows * 3);
    const gc: Float32Array = st.gc;
    gc.fill(0);
    const cellOf = (i: number) =>
      clamp(Math.floor(y[i] / G) + 1, 0, rows - 1) * cols + clamp(Math.floor(x[i] / G) + 1, 0, cols - 1);
    for (let i = 0; i < n; i++) {
      const c = cellOf(i) * 3;
      gc[c] += Math.cos(ph[i]);
      gc[c + 1] += Math.sin(ph[i]);
      gc[c + 2] += 1;
    }
    const K = Math.min(2.4, 0.2 + st.t * 0.1);
    for (let i = 0; i < n; i++) {
      const c = cellOf(i), cx = c % cols, cy = (c / cols) | 0;
      let C = -Math.cos(ph[i]), S = -Math.sin(ph[i]), N = -1;
      for (let oy = -1; oy <= 1; oy++) {
        const ry = cy + oy;
        if (ry < 0 || ry >= rows) continue;
        for (let ox = -1; ox <= 1; ox++) {
          const rx = cx + ox;
          if (rx < 0 || rx >= cols) continue;
          const k = (ry * cols + rx) * 3;
          C += gc[k]; S += gc[k + 1]; N += gc[k + 2];
        }
      }
      let d = om[i];
      if (N > 0) d += K * (Math.hypot(C, S) / N) * Math.sin(Math.atan2(S, C) - ph[i]);
      ph[i] = (ph[i] + d * dt) % TAU;
    }

    // Wander near home; the pointer is a jar they swirl into.
    const p = f.pointer, t = st.t;
    for (let i = 0; i < n; i++) {
      const h = hash(i);
      const wa = t * 0.5 * (0.6 + h) + hash(i * 9.7) * TAU;
      let ax = Math.cos(wa) * 13, ay = Math.sin(wa * 1.3) * 11;
      let home = 0.55;
      if (p) {
        const dx = p.x - x[i], dy = p.y - y[i], d = Math.hypot(dx, dy) || 1;
        if (d < 260) {
          const k = 1 - d / 260;
          home *= 1 - k;
          const pull = d < 22 + h * 18 ? -120 : 170;
          ax += (dx / d) * pull * k + (-dy / d) * 95 * k;
          ay += (dy / d) * pull * k + (dx / d) * 95 * k;
        }
      }
      ax += (hx[i] - x[i]) * home;
      ay += (hy[i] - y[i]) * home;
      vx[i] += (ax - vx[i]) * Math.min(dt * 2.2, 1);
      vy[i] += (ay - vy[i]) * Math.min(dt * 2.2, 1);
      x[i] += vx[i] * dt;
      y[i] += vy[i] * dt;
    }
  },
  draw(f) {
    const { ctx, n, x, y, s, lens, days } = f;
    const st = f.state, ph: Float32Array = st.ph, cell: number = st.cell;
    const spr = glow(255, 226, 168);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n - 1; i++) {
      if (s[i] < 0.01) continue;
      const flash = f.reduced ? 0.2 : Math.max(0, Math.cos(ph[i])) ** 16;
      const bf = [0.3, 0.5, 0.66, 0.83, 1][days[i].l];
      const essay = days[i].e ? 1 : 0;
      // At rest a firefly is a faint ember; only a flash blooms.
      const size = cell * (0.3 + (1.7 * flash + essay * 0.7) * bf) * s[i] * (1 + lens[i] * 0.6);
      ctx.globalAlpha = Math.min(1, s[i] * ((0.06 + 0.94 * flash) * bf + essay * 0.25));
      ctx.drawImage(spr, x[i] - size, y[i] - size, size * 2, size * 2);
      ctx.globalAlpha = s[i] * (0.28 + 0.72 * flash) * bf;
      ctx.fillStyle = '#fff6e2';
      ctx.fillRect(x[i] - 0.8, y[i] - 0.8, 1.6, 1.6);
    }
    ctx.globalCompositeOperation = 'source-over';
    // Essays wear a faint halo ring so they can be found between flashes.
    ctx.strokeStyle = 'rgba(255,236,200,0.16)';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    for (let i = 0; i < n - 1; i++) {
      if (!days[i].e || s[i] < 0.01) continue;
      ctx.moveTo(x[i] + cell * 0.6, y[i]);
      ctx.arc(x[i], y[i], cell * 0.6, 0, TAU);
    }
    ctx.stroke();
    const t = n - 1;
    if (s[t] > 0.01) {
      ctx.globalCompositeOperation = 'lighter';
      const size = cell * (1.6 + Math.sin(f.now / 600) * 0.25) * s[t];
      ctx.drawImage(spr, x[t] - size, y[t] - size, size * 2, size * 2);
      ctx.globalCompositeOperation = 'source-over';
      todayPulse(f, x[t], y[t], cell * 0.18 * s[t]);
    }
  },
};

/* ------------------------------------------------------------------------------------------ */
/* galaxy: two arms, old days in the core, today on the rim. Differential rotation; wheel zooms. */

function galaxyPlace(f: Field) {
  const st = f.state, g = st.g;
  const wr: Float32Array = st.wr, wa: Float32Array = st.wa;
  const cr = Math.cos(g.rot), sr = Math.sin(g.rot);
  const omegaRim = TAU / 210;
  for (let i = 0; i < f.n; i++) {
    const r = wr[i] * g.R;
    const a = wa[i] + (omegaRim / Math.max(wr[i], 0.14)) * st.time;
    const lx = Math.cos(a) * r, ly = Math.sin(a) * r * g.tilt;
    f.tx[i] = g.cx + (lx * cr - ly * sr) * st.z + st.px;
    f.ty[i] = g.cy + (lx * sr + ly * cr) * st.z + st.py;
  }
}

const galaxy: Variant = {
  label: 'galaxy',
  theme: 'dark',
  lens: 0.6,
  layout(f) {
    const st = f.state, fr = f.frame, n = f.n;
    const { cx, cy } = center(f);
    const tilt = 0.58;
    st.g = { cx, cy, tilt, rot: -0.38, R: Math.min(fr.w / 2, fr.h / 2 / tilt) * 0.94 };
    if (!st.wr) {
      st.wr = new Float32Array(n);
      st.wa = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const gauss = hash(i * 1.7) + hash(i * 2.9) + hash(i * 4.3) - 1.5;
        const g2 = hash(i * 6.1) + hash(i * 8.3) - 1;
        // Most days ride the two arms; a quarter of the quiet ones scatter through the disc.
        const disc = !f.days[i].l && !f.days[i].e && hash(i * 12.7) < 0.25;
        st.wr[i] = (0.05 + 0.95 * t ** 0.9) * (1 + gauss * (disc ? 0.3 : 0.14));
        st.wa[i] = (i % 2) * Math.PI + 4.6 * t ** 0.75 + (disc ? g2 * Math.PI : gauss * 0.62 * (1.15 - t) + g2 * 0.12);
      }
      st.time = 0;
      st.z = st.zt = 1;
      st.px = st.py = st.pxt = st.pyt = 0;
    }
    galaxyPlace(f);
    return 8;
  },
  enter(f) {
    f.state.born = performance.now();
  },
  tick(f) {
    const st = f.state, k = Math.min(f.dt * 7, 1);
    if (!f.reduced) st.time += f.dt;
    st.z += (st.zt - st.z) * k;
    st.px += (st.pxt - st.px) * k;
    st.py += (st.pyt - st.py) * k;
    galaxyPlace(f);
    f.cell = Math.max(6, 7 * st.z ** 0.6);
  },
  wheel(f, e) {
    const st = f.state, g = st.g, p = f.pointer;
    const zNew = clamp(st.zt * Math.exp(-e.deltaY * 0.0016), 0.7, 7);
    // Keep the point under the cursor still while zooming.
    const ax = p ? p.x : g.cx, ay = p ? p.y : g.cy;
    const wx = (ax - g.cx - st.pxt) / st.zt, wy = (ay - g.cy - st.pyt) / st.zt;
    st.zt = zNew;
    if (zNew <= 1.02) { st.pxt = 0; st.pyt = 0; } else { st.pxt = ax - g.cx - zNew * wx; st.pyt = ay - g.cy - zNew * wy; }
    return true;
  },
  draw(f) {
    const { ctx, n, x, y, s, lens, days } = f;
    const st = f.state, g = st.g, z: number = st.z;
    const star = glow(236, 236, 242);
    ctx.globalCompositeOperation = 'lighter';

    // Diffuse disc and bright core.
    const cx = g.cx + st.px, cy = g.cy + st.py;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(g.rot);
    ctx.scale(1, g.tilt);
    let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, g.R * z);
    grad.addColorStop(0, 'rgba(236,236,242,0.10)');
    grad.addColorStop(0.5, 'rgba(236,236,242,0.03)');
    grad.addColorStop(1, 'rgba(236,236,242,0)');
    ctx.globalAlpha = s[0];
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, g.R * z, 0, TAU);
    ctx.fill();
    grad = ctx.createRadialGradient(0, 0, 0, 0, 0, g.R * 0.32 * z);
    grad.addColorStop(0, 'rgba(255,250,240,0.32)');
    grad.addColorStop(1, 'rgba(255,250,240,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, g.R * 0.32 * z, 0, TAU);
    ctx.fill();
    ctx.restore();

    const zs = Math.sqrt(z);
    for (let i = 0; i < n - 1; i++) {
      if (s[i] < 0.01) continue;
      const l = days[i].l;
      if (!l && !days[i].e) {
        ctx.globalAlpha = 0.42 * s[i];
        ctx.fillStyle = '#c9c9d0';
        const r = 0.6 * zs * (1 + lens[i]);
        ctx.fillRect(x[i] - r, y[i] - r, r * 2, r * 2);
        continue;
      }
      const size = (2.2 + 1.5 * l) * zs * s[i] * (1 + lens[i] * 0.9);
      ctx.globalAlpha = Math.min(1, 0.35 + 0.17 * l);
      ctx.drawImage(star, x[i] - size, y[i] - size, size * 2, size * 2);
    }

    // Essays flare with four-point spikes.
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < n - 1; i++) {
      if (!days[i].e || s[i] < 0.01) continue;
      const L = 9 * zs * s[i] * (1 + lens[i]);
      ctx.globalAlpha = s[i];
      ctx.drawImage(star, x[i] - L * 0.8, y[i] - L * 0.8, L * 1.6, L * 1.6);
      ctx.beginPath();
      ctx.moveTo(x[i] - L, y[i]);
      ctx.lineTo(x[i] + L, y[i]);
      ctx.moveTo(x[i], y[i] - L);
      ctx.lineTo(x[i], y[i] + L);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';

    const t = n - 1;
    if (s[t] > 0.01) todayPulse(f, x[t], y[t], 2.6 * zs * s[t]);

    // A one-time hint that the wheel does something.
    const hint = 1 - (performance.now() - (st.born ?? 0) - 2500) / 1500;
    if (hint > 0) {
      ctx.globalAlpha = clamp(hint, 0, 1) * 0.7;
      ctx.fillStyle = f.colors.faint;
      ctx.font = '500 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('scroll to zoom', g.cx, f.frame.top + f.frame.h + 4);
    }
    ctx.globalAlpha = 1;
  },
};

/* ------------------------------------------------------------------------------------------ */
/* ink: each day lands as a drop that blooms and settles; the pointer drags wet trails.       */

/** An irregular, smoothed blob; the same seed always makes the same outline. */
function blobPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, seed: number) {
  const K = 8, px: number[] = [], py: number[] = [];
  for (let k = 0; k < K; k++) {
    const a = (k / K) * TAU + hash(seed * 0.37) * TAU;
    const rr = r * (1 + 0.17 * (hash(seed * 13.1 + k * 7.3) * 2 - 1));
    px.push(x + Math.cos(a) * rr);
    py.push(y + Math.sin(a) * rr);
  }
  ctx.moveTo((px[K - 1] + px[0]) / 2, (py[K - 1] + py[0]) / 2);
  for (let k = 0; k < K; k++) {
    const j = (k + 1) % K;
    ctx.quadraticCurveTo(px[k], py[k], (px[k] + px[j]) / 2, (py[k] + py[j]) / 2);
  }
}

type Drip = { x: number; y: number; t: number; r: number };

const ink: Variant = {
  label: 'ink',
  lens: 0.7,
  layout(f) {
    const st = f.state, n = f.n;
    const cell = gridLayout(f);
    st.bx ??= new Float32Array(n);
    st.by ??= new Float32Array(n);
    st.ox ??= new Float32Array(n);
    st.oy ??= new Float32Array(n);
    st.born ??= new Float32Array(n).fill(-1);
    st.trail ??= [] as Drip[];
    for (let i = 0; i < n; i++) {
      st.bx[i] = f.tx[i] + (hash(i * 3.1) - 0.5) * cell * 0.3;
      st.by[i] = f.ty[i] + (hash(i * 5.3) - 0.5) * cell * 0.3;
      f.tx[i] = st.bx[i] + st.ox[i];
      f.ty[i] = st.by[i] + st.oy[i];
    }
    st.cell = cell;
    return cell;
  },
  tick(f) {
    const st = f.state, { n, s, x, y, dt, now } = f, cell: number = st.cell;
    const born: Float32Array = st.born, ox: Float32Array = st.ox, oy: Float32Array = st.oy;
    for (let i = 0; i < n; i++) {
      if (born[i] < 0 && s[i] > 0.04) born[i] = f.reduced ? now - 1e5 : now;
    }
    const trail: Drip[] = st.trail;
    const p = f.pointer;
    if (p && !f.reduced) {
      const sp = Math.hypot(p.dx, p.dy);
      if (sp > 0.5) {
        const steps = Math.ceil(sp / 3);
        const r = clamp(cell * 0.12 + sp * 0.06, cell * 0.1, cell * 0.55);
        for (let k = 1; k <= steps; k++) {
          trail.push({ x: p.x - p.dx * (1 - k / steps), y: p.y - p.dy * (1 - k / steps), t: now, r });
        }
        // Wet ink drags the drops it passes through.
        const R = cell * 1.7;
        for (let i = 0; i < n; i++) {
          const d = Math.hypot(x[i] - p.x, y[i] - p.y);
          if (d > R) continue;
          const k = 1 - d / R;
          ox[i] = clamp(ox[i] + p.dx * 0.45 * k, -cell * 3, cell * 3);
          oy[i] = clamp(oy[i] + p.dy * 0.45 * k, -cell * 3, cell * 3);
        }
      }
    }
    while (trail.length && (trail.length > 1600 || now - trail[0].t > 7000)) trail.shift();
    const relax = Math.exp(-dt / 2.4);
    for (let i = 0; i < n; i++) {
      if (ox[i] || oy[i]) {
        ox[i] *= relax;
        oy[i] *= relax;
        if (Math.abs(ox[i]) + Math.abs(oy[i]) < 0.02) ox[i] = oy[i] = 0;
      }
      f.tx[i] = st.bx[i] + ox[i];
      f.ty[i] = st.by[i] + oy[i];
    }
  },
  draw(f) {
    const { ctx, colors, n, x, y, s, lens, days, now } = f;
    const st = f.state, cell: number = st.cell, born: Float32Array = st.born;

    // Trails: glossy while wet, then dry to a faint stain and fade.
    const trail: Drip[] = st.trail;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let k = 1; k < trail.length; k++) {
      const a = trail[k - 1], b = trail[k];
      if (b.t - a.t > 60) continue;
      const age = now - b.t, wet = Math.exp(-age / 900), fade = 1 - age / 7000;
      ctx.globalAlpha = (0.05 + 0.24 * wet) * fade;
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = b.r * 2 * (1 + 0.15 * wet);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const size = (i: number) => {
      const age = now - born[i];
      const g = f.reduced ? 1 : 1 - Math.exp(-age / 320) * Math.cos(age / 150);
      const d = days[i];
      return (d.l ? cell * (0.12 + 0.065 * d.l) : cell * 0.085) * g * s[i] * (1 + lens[i] * 1.2);
    };
    const wetOf = (i: number) => (f.reduced ? 0 : Math.exp(-(now - born[i]) / 700));

    // Dry drops batch by level: a pale body with a darker rim where pigment pooled.
    for (let l = 0; l <= 4; l++) {
      ctx.beginPath();
      let any = false;
      for (let i = 0; i < n - 1; i++) {
        if (days[i].l !== l || days[i].e || born[i] < 0 || s[i] < 0.01 || wetOf(i) > 0.05) continue;
        blobPath(ctx, x[i], y[i], size(i), i);
        any = true;
      }
      if (!any) continue;
      ctx.fillStyle = l ? colors.ink : colors.dim;
      ctx.globalAlpha = l ? 0.14 + 0.17 * l : 0.85;
      ctx.fill();
      if (l) {
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = 0.7;
        ctx.globalAlpha = 0.18 + 0.13 * l;
        ctx.stroke();
      }
    }

    // Fresh drops one by one, darker while still wet.
    for (let i = 0; i < n - 1; i++) {
      if (days[i].e || born[i] < 0 || s[i] < 0.01) continue;
      const wet = wetOf(i);
      if (wet <= 0.05) continue;
      const l = days[i].l;
      ctx.beginPath();
      blobPath(ctx, x[i], y[i], size(i), i);
      ctx.fillStyle = l ? colors.ink : colors.dim;
      ctx.globalAlpha = Math.min(1, (l ? 0.14 + 0.17 * l : 0.85) + 0.35 * wet);
      ctx.fill();
    }

    // Essays: big blots with splatter.
    for (let i = 0; i < n - 1; i++) {
      if (!days[i].e || born[i] < 0 || s[i] < 0.01) continue;
      const age = now - born[i];
      const g = f.reduced ? 1 : 1 - Math.exp(-age / 380) * Math.cos(age / 170);
      const R = cell * 0.44 * g * s[i] * (1 + lens[i] * 0.8);
      ctx.fillStyle = colors.ink;
      ctx.globalAlpha = 0.82;
      ctx.beginPath();
      blobPath(ctx, x[i], y[i], R, i * 3 + 1);
      const spl = clamp((g - 0.5) / 0.5, 0, 1);
      for (let k = 0; k < 6; k++) {
        const a = hash(i * 31 + k) * TAU, dd = R * (1.3 + hash(i * 17 + k) * 0.9);
        const r = R * (0.06 + 0.12 * hash(i * 7 + k)) * spl;
        if (r < 0.3) continue;
        ctx.moveTo(x[i] + Math.cos(a) * dd + r, y[i] + Math.sin(a) * dd);
        ctx.arc(x[i] + Math.cos(a) * dd, y[i] + Math.sin(a) * dd, r, 0, TAU);
      }
      ctx.fill();
    }

    // Today stays wet: a drop with a moving sheen.
    const t = n - 1;
    if (s[t] > 0.01 && born[t] >= 0) {
      const R = cell * 0.36 * s[t] * (1 + lens[t] * 0.8);
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.ink;
      ctx.beginPath();
      blobPath(ctx, x[t], y[t], R, t);
      ctx.fill();
      const sh = f.reduced ? 0 : Math.sin(now / 700) * R * 0.12;
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = colors.bg;
      ctx.beginPath();
      ctx.ellipse(x[t] - R * 0.3 + sh, y[t] - R * 0.38, R * 0.26, R * 0.13, -0.5, 0, TAU);
      ctx.fill();
      todayRing(f, x[t], y[t], R);
    }
    ctx.globalAlpha = 1;
  },
};

function todayRing(f: Field, x: number, y: number, r: number) {
  const { ctx, colors } = f;
  const phase = f.reduced ? 0.5 : (f.now % 2400) / 2400;
  ctx.globalAlpha = (1 - phase) * 0.45;
  ctx.strokeStyle = colors.ink;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r * (1.2 + phase * 2), 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export const groupB: Record<string, Variant> = { orbit, garden, tree, fireflies, galaxy, ink };
