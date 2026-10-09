/* Meadow: a sketchbook page of hand-drawn wildflowers, one sprig per month, that you can zoom
   into like a map.

   Rows are years and columns are months, so the sheet reads like a calendar from afar. Each
   sprig is drawn in a single fine pen line (see sprigs.ts); its species follows how the month
   went, and every day of the month is one leaf, bud or flower on it. Essays are the showpiece
   blooms, crowning their own plant, and today is the closed bud at the tip of the newest sprig.
   Brushing through a bunch knocks leaves loose; they flutter down, settle on the row and fade,
   and the plant grows them back.

   The camera (camera.ts) follows Figma/Maps conventions: two-finger scroll pans, pinch or
   ⌘-scroll zooms around the pointer, drag pans with momentum, double-click dives, Esc fits.
   The page opens on today's bud and pulls back to the whole sheet. The year under the name in
   the corner follows the part of the sheet you're looking at; a near-invisible ? lists the
   controls. */

import { type Field, type Variant, MONTHS, TAU } from '../field-kit';
import { navigate } from 'astro:transitions/client';
import { Camera } from './camera';
import { Fisheye } from './fisheye';
import { MonthCard } from './meadow-card';
import { type MeadowSound, createMeadowSound } from './meadow-sound';
import { type Organ, type Sprig, buildSprig } from './sprigs';
import { REF, drawSpecimen, frameOf, planMonths } from './specimen';
import { RETURN, afterTransition, handOff, readReturn } from '../specimen-page';

type Leaf = {
  o: Organ;
  c: Cell;
  /** position relative to the bunch's base, in sprig units; velocity; rotation */
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  phase: number;
  landed: number;
};


type Cell = {
  m: number; first: number; len: number; sprig: Sprig;
  /** "2025-06" */
  key: string;
  /** sprig height in reference units */
  h: number;
  col: number; row: number;
  /** placement: base in world coordinates, and the world size of the sprig */
  bx: number; by: number; W: number; H: number;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const font = (size: number, weight = 500) => `${weight} ${size}px Inter, system-ui, sans-serif`;
/** Stereo position of a screen x, for the sounds; null when it's off screen. */
const panAt = (f: Field, x: number) => (x < 0 || x > f.width ? null : clamp((x / f.width) * 2 - 1, -1, 1));

/** Grow every month's sprig. Depends only on the data, so it runs once. */
function grow(f: Field) {
  const S = f.state, { n, cal, days } = f;
  const months = cal.mi[n - 1] + 1;
  const keys = Array.from({ length: months }, (_, m) => {
    const i = cal.mi.indexOf(m);
    return `${cal.y[i]}-${String(cal.m[i] + 1).padStart(2, '0')}`;
  });
  const cells: Cell[] = planMonths(days, cal.mi, keys).map((p) => ({
    m: p.m, key: p.key, first: p.first, len: p.len, h: p.h,
    sprig: buildSprig(days, p.first, p.first + p.len, REF, p.h, p.species, p.seed, n - 1),
    col: 0, row: 0, bx: 0, by: 0, W: 0, H: 0,
  }));
  // Where each day lives within its sprig (reference units), for hit-testing and the readout.
  const hx = new Float32Array(n), hy = new Float32Array(n), cellOf = new Uint16Array(n);
  for (const c of cells) {
    for (const o of c.sprig.organs) {
      hx[o.i] = o.hx;
      hy[o.i] = o.hy;
      cellOf[o.i] = c.m;
    }
  }
  Object.assign(S, { cells, hx, hy, cellOf });
  S.sway = new Float32Array(months);
  S.bend = new Float32Array(months);
  S.bv = new Float32Array(months);
  S.time = 0;
  // Leaves knocked loose, and when each day's leaf will be back (0 = on the plant).
  S.falling = [] as Leaf[];
  S.regrow = new Float64Array(n);
}

/** Lay the sheet out for the current frame. Cheap: positions and one scale, nothing regrown. */
function place(f: Field) {
  const S = f.state, { n, cal } = f, fr = f.frame, cam: Camera = S.cam;
  const narrow = f.width < 640;
  const cols = narrow ? 4 : 12, perYear = 12 / cols;
  const gutter = narrow ? 30 : 48;
  const y0 = cal.y[0];
  const firstRow = Math.floor(cal.m[0] / cols);
  const rows = (cal.y[n - 1] - y0) * perYear + Math.floor(cal.m[n - 1] / cols) - firstRow + 1;
  const cw = (fr.w - gutter) / cols;
  // Rows keep a readable height; on narrow screens the sheet runs taller than the screen.
  const ch = Math.max(fr.h / rows, narrow ? cw * 1.05 : 0);
  const k = Math.min(cw / REF, (ch * 0.84) / (REF * 1.15));

  // How fast the window is being resized becomes wind (consumed by the next tick).
  const now = performance.now();
  if (S.placed && S.lastSize) {
    const secs = Math.max(0.008, (now - S.lastSize.t) / 1000);
    const wind = S.resizeWind ?? { x: 0, y: 0 };
    wind.x += (fr.w - S.lastSize.w) / secs;
    wind.y += (fr.h - S.lastSize.h) / secs;
    S.resizeWind = wind;
  }
  S.lastSize = { w: fr.w, h: fr.h, t: now };

  // Keep the view on the same part of the sheet across the resize.
  const old = S.placed ? cam.bounds : null;
  const u = old ? (cam.cx - old.x0) / Math.max(old.x1 - old.x0, 1) : 0.5;
  const v = old ? (cam.cy - old.y0) / Math.max(old.y1 - old.y0, 1) : 0.5;

  for (const c of S.cells as Cell[]) {
    const mon = cal.m[c.first], year = cal.y[c.first];
    c.col = mon % cols;
    c.row = (year - y0) * perYear + Math.floor(mon / cols) - firstRow;
    c.bx = fr.left + gutter + (c.col + 0.5) * cw;
    c.by = fr.top + (c.row + 0.93) * ch;
    c.W = REF * k;
    c.H = c.h * k;
  }
  Object.assign(S, { cols, cw, ch, k, gutter, firstRow, perYear, rows });
  cam.bounds = { x0: fr.left, y0: fr.top - 24, x1: fr.left + fr.w, y1: fr.top + rows * ch };
  // Deep enough that one flower fills a good part of the screen.
  cam.zMax = Math.max(8, (Math.min(fr.w, fr.h) * 0.9) / (cw * 0.16));
  cam.zMin = 1;
  const b = cam.bounds;
  cam.cx = b.x0 + u * (b.x1 - b.x0);
  cam.cy = b.y0 + v * (b.y1 - b.y0);
  S.placed = true;
}

/** Screen position of a sprig-local point (reference units), including the sprig's sway. */
function project(f: Field, c: Cell, lx: number, ly: number) {
  const S = f.state, cam: Camera = S.cam, a = S.sway[c.m], k: number = S.k;
  const ca = Math.cos(a), sa = Math.sin(a);
  return cam.toScreen(c.bx + (lx * ca - ly * sa) * k, c.by + (lx * sa + ly * ca) * k);
}

const REGROW_AFTER = 6500;
const REGROW_FOR = 900;

/** Detach one leaf: it keeps its place and angle, takes the push, and starts falling. */
function loosen(f: Field, c: Cell, o: Organ, vx: number, vy: number, spin: number) {
  const S = f.state, a = S.sway[c.m], ca = Math.cos(a), sa = Math.sin(a);
  (S.falling as Leaf[]).push({
    o, c,
    x: o.hx * ca - o.hy * sa,
    y: o.hx * sa + o.hy * ca,
    vx: vx + (Math.random() - 0.5) * REF * 0.3,
    vy: vy - c.h * 0.05,
    rot: a,
    vr: (Math.random() - 0.5) * 5 + spin * 1.5,
    phase: Math.random() * Math.PI * 2,
    landed: 0,
  });
  (S.regrow as Float64Array)[o.i] = f.now + REGROW_AFTER;
  const q = project(f, c, o.hx, o.hy), pan = panAt(f, q.x);
  if (pan !== null && q.y > 0 && q.y < f.height) (S.sound as MeadowSound | undefined)?.leafFall(pan, 0.7 + Math.random() * 0.6);
}

/** A window resize blows through the meadow: faster drags bend stalks harder (most near the
    edge being dragged) and, past a point, strip leaves that sail off with the gust. */
function resizeGust(f: Field) {
  const S = f.state, wind = S.resizeWind;
  if (!wind) return;
  S.resizeWind = null;
  const speed = Math.hypot(wind.x, wind.y);
  if (speed < 40) return;
  const cells: Cell[] = S.cells, cols: number = S.cols;
  const dir = Math.sign(wind.x || wind.y);
  const regrow: Float64Array = S.regrow;
  for (const c of cells) {
    // Stalks near the moving (right) edge feel it first and most.
    const near = 0.35 + 0.65 * ((c.col + 0.5) / cols);
    const jitter = 0.8 + 0.4 * Math.sin(c.m * 12.9898);
    S.bv[c.m] += dir * clamp(speed / 900, 0, 2.6) * near * jitter;
    // Strong gusts strip leaves.
    if (speed < 900 || (S.falling as Leaf[]).length > 160) continue;
    const chance = Math.min(0.22, (speed - 900) / 9000) * near;
    for (const o of c.sprig.organs) {
      if (o.kind !== 'leaf' || regrow[o.i] || f.s[o.i] < 0.9 || Math.random() > chance) continue;
      loosen(f, c, o, dir * clamp(speed / 6, 60, 520) * (0.6 + Math.random() * 0.8), -REF * (0.2 + Math.random() * 0.5), dir);
    }
  }
}

/** Knock leaves loose where the pointer brushes quickly, then let them fall. */
function shake(f: Field) {
  const S = f.state, cam: Camera = S.cam, p = f.pointer, now = f.now, dt = f.dt;
  const falling: Leaf[] = S.falling, regrow: Float64Array = S.regrow, k: number = S.k;
  if (p && !p.down && (p.dx || p.dy) && falling.length < 140) {
    const speed = Math.hypot(p.dx, p.dy);
    const reach = Math.max(16, S.cw * cam.z * 0.1);
    for (const c of S.cells as Cell[]) {
      const base = cam.toScreen(c.bx, c.by);
      if (Math.abs(p.x - base.x) > c.W * cam.z || p.y > base.y + 10 || p.y < base.y - c.H * cam.z * 1.1) continue;
      for (const o of c.sprig.organs) {
        if (o.kind !== 'leaf' || regrow[o.i] || f.s[o.i] < 0.9) continue;
        const q = project(f, c, o.hx, o.hy);
        if (Math.hypot(q.x - p.x, q.y - p.y) > reach) continue;
        // Faster brushing shakes more loose; a slow hover only rarely does.
        if (Math.random() > Math.min(1, speed / 26) * 0.45) continue;
        const toLocal = 1 / (cam.z * k);
        loosen(f, c, o, p.dx * toLocal * 9, -Math.abs(p.dy * toLocal) * 3, Math.sign(p.dx || 1));
      }
    }
  }
  // Flutter down: gravity against drag, a side-to-side sway, a lazy tumble. All in the
  // bunch's own units, so a resize mid-fall changes nothing.
  for (let q = falling.length - 1; q >= 0; q--) {
    const L = falling[q], c = L.c;
    if (!L.landed) {
      const fall = c.h * 0.32;
      L.vy += (fall * 2.2 - L.vy) * Math.min(1, dt * 2.4);
      L.vx += (-L.vx * 1.6 + Math.sin(now / 420 + L.phase) * REF * 0.9) * dt;
      L.x += L.vx * dt;
      L.y += L.vy * dt;
      L.vr += (Math.sin(now / 300 + L.phase) * 3 - L.vr * 0.8) * dt;
      L.rot += L.vr * dt;
      // Fallen leaves gather at the foot of their bunch, above the month label.
      if (L.y >= -REF * 0.01) {
        L.y = -REF * 0.01;
        L.landed = now;
        const q = cam.toScreen(c.bx + L.x * k, c.by + L.y * k), pan = panAt(f, q.x);
        if (pan !== null && q.y > 0 && q.y < f.height) (S.sound as MeadowSound | undefined)?.leafLand(pan);
      }
    }
    // Once down it lies where it fell, then fades.
    if (L.landed && now - L.landed > 2600) falling.splice(q, 1);
  }
  for (let i = 0; i < regrow.length; i++) {
    if (regrow[i] && now > regrow[i] + REGROW_FOR) regrow[i] = 0;
  }
}

/** Which day is under the pointer: tested against the drawn shapes themselves (petals, the
    whole spike, the leaf blade, the little stem it hangs from) with a few pixels of slack,
    preferring flowers over leaves and the closest when shapes overlap. */
function hitTest(f: Field, px: number, py: number) {
  const S = f.state, cam: Camera = S.cam, zk = cam.z * S.k;
  const regrow: Float64Array = S.regrow;
  const live = (o: Organ) => f.s[o.i] >= 0.5 && !(regrow[o.i] && f.now < regrow[o.i] + REGROW_FOR);
  // Leaves give way to flowers whenever both are in reach.
  const weight = (o: Organ) => (o.kind === 'leaf' ? 1.8 : 1);
  const cells: Cell[] = S.cells;
  let best = -1, bestScore = Infinity;
  // Close up, flowers are big enough to point at: the pen line itself is the hitbox.
  if (zk >= 2.5) {
    const probe: CanvasRenderingContext2D = (S.probe ??= document.createElement('canvas').getContext('2d')!);
    const slop = 6 / zk;
    probe.lineWidth = slop * 2;
    let top = -1, head = -1, headScore = Infinity;
    for (const c of cells) {
      const base = cam.toScreen(c.bx, c.by);
      if (Math.abs(px - base.x) > c.W * cam.z * 0.8 || py > base.y + 12 || py < base.y - c.H * cam.z * 1.2) continue;
      // Into the sprig's own units, undoing its sway.
      const dx = (px - base.x) / zk, dy = (py - base.y) / zk, a = -S.sway[c.m];
      const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
      for (const o of c.sprig.organs) {
        if (!live(o)) continue;
        const near = Math.hypot(lx - o.hx, ly - o.hy);
        if (near > REF * 0.45 + slop) continue;
        // Right on a flower's head (its petals, or inside an outline-only floret): that's the
        // one. Measured to the head, since an organ's line also carries its whole stalk.
        if (o.kind !== 'leaf') {
          const r = Math.max(o.kind === 'hero' ? 7 : 4.5, 9 / zk);
          if (near < r && near / r < headScore) { headScore = near / r; head = o.i; }
        }
        // On a petal or leaf itself: whatever is drawn on top is what you see, so it wins
        // (organs and bunches paint in order, so the last one found is uppermost).
        if (probe.isPointInPath(o.pens.fill, lx, ly) || probe.isPointInPath(o.pens.ink, lx, ly)) top = o.i;
        else if (probe.isPointInStroke(o.pens.line, lx, ly)) {
          // Only grazing a line (often a stalk): the nearest head, flowers first.
          const score = near * weight(o);
          if (score < bestScore) { bestScore = score; best = o.i; }
        }
      }
    }
    if (head >= 0) return head;
    if (top >= 0) return top;
    if (best >= 0) return best;
    bestScore = Infinity;
  }
  // Too small to aim at (or between petals): snap to the nearest head within reach.
  const reach = 22;
  for (const c of cells) {
    const base = cam.toScreen(c.bx, c.by);
    if (Math.abs(px - base.x) > c.W * cam.z * 0.8 + reach || py > base.y + reach || py < base.y - c.H * cam.z * 1.2 - reach) continue;
    for (const o of c.sprig.organs) {
      if (!live(o)) continue;
      const score = Math.hypot(f.x[o.i] - px, f.y[o.i] - py) * weight(o);
      if (score < bestScore) { bestScore = score; best = o.i; }
    }
  }
  if (bestScore < reach) return best;
  // Anywhere on a bunch's patch of ground still belongs to it: take its nearest flower.
  const w = cam.toWorld(px, py);
  const c = cells.find((q) => Math.abs(w.x - q.bx) < q.W / 2 && w.y < q.by + S.ch * 0.07 && w.y > q.by - S.ch * 0.93);
  if (!c) return -1;
  best = -1; bestScore = Infinity;
  for (const o of c.sprig.organs) {
    if (!live(o)) continue;
    const score = Math.hypot(f.x[o.i] - px, f.y[o.i] - py) * weight(o);
    if (score < bestScore) { bestScore = score; best = o.i; }
  }
  return best;
}

/** A florist's ribbon tied round the bunch in the month a new job began, with a paper tag
    naming the place. Drawn in the sprig's own units (base at 0,0). */
/* The intro: the sheet grows in, bunch by bunch, spreading out from today's bud as the camera
   pulls back. Each stem is drawn up out of the ground, then its leaves and flowers open from
   the bottom up. */
const STEM_FOR = 900, OPEN_FOR = 520, GROWN_BY = STEM_FOR + OPEN_FOR + 220;
const backOut = (t: number) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;

/** When each bunch starts growing: today's first, then outward with distance. */
function sow(f: Field, from: Cell) {
  const S = f.state, cells: Cell[] = S.cells;
  const fx = from.bx, fy = from.by - from.H / 2;
  const d = cells.map((c) => Math.hypot(c.bx - fx, c.by - c.H / 2 - fy));
  const D = Math.max(...d, 1), t0 = performance.now() + 250;
  S.born = Float64Array.from(d, (x, m) => t0 + 3300 * (x / D) ** 0.8 + ((m * 37) % 11) * 12);
  S.bornBy = Math.max(...S.born) + GROWN_BY;
}

/** How long after its bunch starts an organ opens: when the rising stem passes its joint. */
function sprout(c: Cell, o: Organ) {
  const a = clamp(-o.ay / (c.h * 1.2), 0, 1);
  return STEM_FOR * (1 - Math.sqrt(1 - a)) + (o.i % 5) * 22;
}

function ribbon(ctx: CanvasRenderingContext2D, c: Cell, title: string, now: number, reduced: boolean, bg: string, ink: string, zk: number, alpha = 1) {
  // Tied high enough on the stems that the tag hangs clear of the ground and month label.
  const y = -Math.max(30, c.h * 0.34), w = 7;
  ctx.save();
  ctx.globalAlpha = alpha;
  // The wrap, then a bow: two loops and two tails.
  ctx.beginPath();
  ctx.ellipse(0, y, w, 2.2, 0, 0, Math.PI * 2);
  ctx.moveTo(0, y);
  ctx.bezierCurveTo(-9, y - 9, -15, y - 2, -1, y + 0.5);
  ctx.moveTo(0, y);
  ctx.bezierCurveTo(9, y - 9, 15, y - 2, 1, y + 0.5);
  ctx.moveTo(-0.5, y + 1);
  ctx.quadraticCurveTo(-4, y + 8, -7, y + 13);
  ctx.moveTo(0.5, y + 1);
  ctx.quadraticCurveTo(3, y + 7, 4, y + 14);
  ctx.fillStyle = bg;
  ctx.stroke();
  // A tag on a thread, swaying a little.
  const swing = reduced ? 0 : Math.sin(now / 900 + c.m) * 0.08;
  ctx.translate(4, y + 14);
  ctx.rotate(0.12 + swing);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 5);
  ctx.stroke();
  const name = title.replace(/^joined\s+/, '').replace(/\s+as\s+.*$/, '');
  ctx.font = '500 5px Inter, system-ui, sans-serif';
  const tw = Math.max(18, ctx.measureText(name).width + 7);
  ctx.beginPath();
  ctx.moveTo(-tw / 2 + 2.5, 5);
  ctx.lineTo(tw / 2, 5);
  ctx.lineTo(tw / 2, 13);
  ctx.lineTo(-tw / 2, 13);
  ctx.lineTo(-tw / 2, 7.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-tw / 2 + 2.6, 7.6, 0.8, 0, Math.PI * 2);
  ctx.stroke();
  // Lettering only once it can be read.
  if (5 * zk >= 8) {
    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 1, 9.2);
  }
  ctx.restore();
}

/** Middle of the screen area the card leaves free (beside it on wide screens, above it on
    phones); the plain screen centre when the card is closed. */
function freeCenter(f: Field) {
  const S = f.state, card: MonthCard = S.card, c = (S.cam as Camera).screenCenter;
  if (!card?.isOpen) return c;
  const r = card.el.getBoundingClientRect();
  return r.width < f.width * 0.6 ? { x: (r.right + f.width) / 2, y: c.y } : { x: c.x, y: (f.frame.top + r.top) / 2 };
}

/** With the card open, once the camera settles after being moved around, the card follows
    whichever bunch is now in the middle of the free space. It waits for the camera to rest
    so it doesn't flicker through every month passed on the way. */
function followFocus(f: Field) {
  const S = f.state, cam: Camera = S.cam, card: MonthCard = S.card;
  const moved = cam.cx !== S.lastCx || cam.cy !== S.lastCy || cam.z !== S.lastZ;
  S.lastCx = cam.cx; S.lastCy = cam.cy; S.lastZ = cam.z;
  if (!card?.isOpen || cam.flying) { S.settleAt = 0; return; }
  if (moved) { S.settleAt = f.now + 160; return; }
  if (!S.settleAt || f.now < S.settleAt) return;
  S.settleAt = 0;
  if (cam.z < 1.4) return;
  const p = freeCenter(f), w = cam.toWorld(p.x, p.y), cells: Cell[] = S.cells;
  let best: Cell | null = null, bestD = Infinity;
  for (const c of cells) {
    // Prefer the bunch whose column and row contain the point; otherwise the nearest one.
    const inside = Math.abs(w.x - c.bx) < c.W / 2 && w.y < c.by + S.ch * 0.07 && w.y > c.by - S.ch * 0.93;
    const d = inside ? -1 : Math.hypot(w.x - c.bx, w.y - (c.by - c.H / 2));
    if (d < bestD) { bestD = d; best = c; }
  }
  if (best && best.key !== card.openKey) card.open({ key: best.key, m: best.m, first: best.first, len: best.len, h: best.h, sprig: best.sprig }, -1);
}

/** Open a month's card (on day `i`, or the whole bunch for -1) and go there, in the space
    the card leaves free. From afar that frames the bunch; once zoomed in, it glides to the
    flower (or bunch) at the current zoom, so hopping to a neighbour in any direction just
    travels there. */
function focusOn(f: Field, cell: Cell, i: number) {
  const S = f.state, cam: Camera = S.cam, card: MonthCard = S.card;
  card.open({ key: cell.key, m: cell.m, first: cell.first, len: cell.len, h: cell.h, sprig: cell.sprig }, i);
  const frameZ = clamp(Math.min((f.frame.h * 0.8) / cell.H, (f.frame.w * 0.7) / cell.W), 1.5, cam.zMax);
  const close = cam.z >= frameZ * 0.85;
  const z = close ? cam.z : frameZ;
  const tx = close && i >= 0 ? cell.bx + S.hx[i] * S.k : cell.bx;
  const ty = close && i >= 0 ? cell.by + S.hy[i] * S.k : cell.by - cell.H * 0.5;
  const c = cam.screenCenter, free = freeCenter(f);
  // A bunch at the edge of the sheet may need the view to go past the edge to sit beside the
  // card; allow exactly that much.
  const dx = free.x - c.x, dy = free.y - c.y;
  cam.slack = { l: Math.max(0, dx), r: Math.max(0, -dx), t: Math.max(0, dy), b: Math.max(0, -dy) };
  cam.remember();
  cam.flyTo(tx - (free.x - c.x) / z, ty - (free.y - c.y) / z, z, close ? 700 : 1000);
}

/** While a month is open, the rest of the sheet recedes around it: full ink on the focused
    flower (or bunch), fading off radially. The spotlight glides when focus moves on and
    eases in and out with the card. Kept in world units so it rides along with the camera. */
function focusLight(f: Field) {
  const S = f.state, card: MonthCard = S.card, cells: Cell[] = S.cells, cam: Camera = S.cam;
  const key = card?.isOpen ? card.openKey : null;
  const c = key ? cells.find((q) => q.key === key) : null;
  const i = card?.openDay ?? -1, own = !!c && i >= 0 && S.cellOf[i] === c.m;
  // A single flower gets a tight circle; a whole bunch, one that takes it all in. Closing keeps
  // the circle where it was and only lets the light back out.
  const L = S.spot;
  const goal = c
    ? {
        x: own ? c.bx + S.hx[i] * S.k : c.bx,
        y: own ? c.by + S.hy[i] * S.k : c.by - c.H * 0.5,
        r: own ? c.H * 0.32 : Math.max(c.W, c.H) * 0.62,
        a: 1,
      }
    : L ? { ...L, a: 0 } : null;
  if (!goal) return;
  if (!L || L.a < 0.02) Object.assign((S.spot ??= { ...goal, a: 0 }), { x: goal.x, y: goal.y, r: goal.r });
  const id = `${key}:${i}`;
  // A new focus usually sets the camera flying (a click, or Escape flying back): ride that
  // flight with the same easing, so the light lands exactly as the view does.
  if (id !== S.spotId) {
    S.spotId = id;
    S.spotFrom = { ...S.spot };
    S.spotSync = cam.flying;
  }
  const P = S.spot, from = S.spotFrom, t = cam.progress;
  if (S.spotSync && t >= 0) {
    for (const q of ['x', 'y', 'r', 'a'] as const) P[q] = from[q] + (goal[q] - from[q]) * t;
    return;
  }
  // No flight to follow (focus moved on by panning, or closed in place): ease there.
  S.spotSync = false;
  const k = 1 - Math.exp(-f.dt * 9);
  for (const q of ['x', 'y', 'r', 'a'] as const) P[q] += (goal[q] - P[q]) * k;
}

/** The year in the corner follows the row at the middle of the screen once you're zoomed in;
    from afar it's the current year again. Changes roll in rather than snap. */
function followYear(f: Field) {
  const S = f.state, cam: Camera = S.cam, el: HTMLElement | null = S.yearEl;
  if (!el) return;
  let year = S.yearHome as string;
  if (cam.z > 1.3) {
    const row = clamp(Math.floor((cam.cy - f.frame.top) / S.ch), 0, S.rows - 1);
    year = String(f.cal.y[0] + Math.floor((row + S.firstRow) / S.perYear));
  }
  if (year === S.yearShown) return;
  const up = Number(year) > Number(S.yearShown);
  S.yearShown = year;
  if (f.reduced || !el.animate) { el.textContent = year; return; }
  el.style.display = 'inline-block';
  el.getAnimations().forEach((a) => a.cancel());
  const out = el.animate(
    [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateY(${up ? -4 : 4}px)` }],
    { duration: 110, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' },
  );
  out.onfinish = () => {
    if (S.yearShown !== year) return;
    el.textContent = year;
    el.animate(
      [{ opacity: 0, transform: `translateY(${up ? 4 : -4}px)` }, { opacity: 1, transform: 'none' }],
      { duration: 180, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
    );
    out.cancel();
  };
}

const VIEW = 'meadow-view';

/** On the way out: note the view, and if it's an essay from this meadow, lift its bunch off
    the sheet so it can fly to its place beside the text. */
function leave(f: Field, e: Event) {
  const S = f.state, cam: Camera = S.cam, card: MonthCard = S.card;
  const to: URL | undefined = (e as any).to;
  try {
    sessionStorage.setItem(VIEW, JSON.stringify({ cx: cam.cx, cy: cam.cy, z: cam.z, key: card.openKey, day: card.openDay, at: Date.now() }));
  } catch {}
  const m = to?.pathname.match(/^\/writing\/([^/]+)\/?$/);
  if (!m || f.reduced) return;
  const i = f.days.findIndex((d) => d.e?.some((x) => x.s === m[1]));
  if (i < 0) return;
  liftOff(f, (S.cells as Cell[])[S.cellOf[i]], i);
}

function liftOff(f: Field, c: Cell, pick: number) {
  const S = f.state;
  if (!ghost(f, c, pick)) return;
  handOff(c.key);
  const clean = () => {
    S.ghost?.remove();
    S.lifted = -1;
    document.removeEventListener('astro:after-swap', clean);
  };
  document.addEventListener('astro:after-swap', clean);
}

/** A stand-in for a bunch, laid exactly over it, that a view transition can fly to or from. */
function ghost(f: Field, c: Cell, pick: number | undefined) {
  const S = f.state, cam: Camera = S.cam;
  const fr = frameOf(c.h), k = S.k * cam.z, base = cam.toScreen(c.bx, c.by);
  const box = { x: base.x + fr.x * k, y: base.y + fr.y * k, w: fr.w * k, h: fr.h * k };
  if (box.x > f.width || box.y > f.height || box.x + box.w < 0 || box.y + box.h < 0) return false;
  const el = document.createElement('canvas'), dpr = Math.min(devicePixelRatio || 1, 2);
  el.setAttribute('aria-hidden', 'true');
  el.width = Math.round(box.w * dpr);
  el.height = Math.round(box.h * dpr);
  el.style.cssText = `position:fixed;left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px;z-index:3;pointer-events:none;view-transition-name:specimen`;
  const ctx = el.getContext('2d')!;
  ctx.scale(dpr, dpr);
  drawSpecimen(ctx, c.sprig, c.h, { x: 0, y: 0, w: box.w, h: box.h }, {
    ink: f.colors.ink, bg: f.colors.bg, lw: clamp(0.7 + 0.22 * Math.log2(Math.max(cam.z, 1)), 0.72, 1.8), pick, sway: S.sway[c.m],
  });
  document.body.append(el);
  S.ghost = el;
  S.lifted = c.m;
  // The rest of the meadow steps back (or comes forward) while the bunch travels.
  (f.ctx.canvas.parentElement as HTMLElement).style.viewTransitionName = 'meadow';
  return true;
}

/** Back from an essay (or a link to a month): pick up where things were, no intro. */
function comeBack(f: Field) {
  const S = f.state, cam: Camera = S.cam, cells: Cell[] = S.cells;
  const ret = readReturn();
  try { sessionStorage.removeItem(RETURN); } catch {}
  const hash = location.hash.slice(1);
  const byHash = /^\d{4}-\d{2}$/.test(hash) ? cells.find((c) => c.key === hash) : undefined;
  let saved: { cx: number; cy: number; z: number; key: string | null; day: number; at: number } | null = null;
  try {
    saved = JSON.parse(sessionStorage.getItem(VIEW) ?? 'null');
  } catch {}
  if (saved && Date.now() - saved.at > 30 * 60000) saved = null;
  if (byHash && (!saved || saved.key !== byHash.key)) {
    history.replaceState(history.state, '', location.pathname);
    focusOn(f, byHash, -1);
    return true;
  }
  if (!saved) return false;
  cam.cx = saved.cx;
  cam.cy = saved.cy;
  cam.z = clamp(saved.z, cam.zMin, cam.zMax);
  const c = saved.key ? cells.find((x) => x.key === saved!.key) : undefined;
  if (c) {
    (S.card as MonthCard).open({ key: c.key, m: c.m, first: c.first, len: c.len, h: c.h, sprig: c.sprig }, saved.day);
  }
  // Back from an essay: its bunch flies home to its place on the sheet.
  const home = ret && cells.find((x) => x.key === ret.key);
  if (home && !f.reduced) {
    place(f);
    if (ghost(f, home, ret!.pick)) {
      afterTransition(() => {
        S.ghost?.remove();
        S.lifted = -1;
        (f.ctx.canvas.parentElement as HTMLElement).style.viewTransitionName = '';
      });
    }
  }
  if (hash) history.replaceState(history.state, '', location.pathname);
  return true;
}

/** A picked flower rings its own note: higher days of the month, higher notes. */
function chime(f: Field, i: number) {
  const S = f.state, sound: MeadowSound | undefined = S.sound;
  const pan = i >= 0 ? panAt(f, f.x[i]) : null;
  if (!sound || pan === null) return;
  const c: Cell = S.cells[S.cellOf[i]], o = c.sprig.organs.find((q) => q.i === i);
  const kind = f.days[i].e ? 'hero' : o?.kind === 'leaf' ? 'leaf' : o?.kind === 'bud' ? 'bud' : 'flower';
  sound.hover(pan, kind, i - c.first);
}

/** What the meadow sounds like this frame: the card coming and going, and bunches sprouting
    during the intro. */
function listen(f: Field, sound: MeadowSound) {
  const S = f.state, cells: Cell[] = S.cells, card: MonthCard = S.card;
  const key = card.openKey;
  if (key !== (S.heardCard ?? null)) {
    if (key) sound.open();
    else sound.close();
    S.heardCard = key;
  }
  const born: Float64Array | null = S.born ?? null;
  if (born) {
    const grew: Uint8Array = (S.grew ??= new Uint8Array(cells.length));
    for (const c of cells) {
      if (grew[c.m] || f.now < born[c.m]) continue;
      grew[c.m] = 1;
      const q = (S.cam as Camera).toScreen(c.bx, c.by), pan = panAt(f, q.x);
      if (pan !== null && q.y > 0 && q.y - c.H * (S.cam as Camera).z < f.height) sound.grow(pan, c.m / cells.length);
    }
  }
}

/** A barely-there ? near the bottom edge; hover, click or press ? to see the controls. */
function mountHelp(f: Field) {
  const S = f.state;
  const help = document.createElement('div');
  help.className = 'field-help';
  help.innerHTML = `<button type="button" aria-label="Controls" aria-expanded="false">?</button>
<dl role="tooltip">
  <dt>move</dt><dd>drag, two-finger scroll, wasd or arrows</dd>
  <dt>zoom</dt><dd>pinch, ⌘ scroll, q / e</dd>
  <dt>dive in</dt><dd>click or double-click</dd>
  <dt>go back</dt><dd>esc</dd>
  <dt>see it all</dt><dd>0</dd>
  <dt>faster</dt><dd>hold shift</dd>
  <dt>sound</dt><dd>m</dd>
</dl>`;
  document.body.append(help);
  const button = help.querySelector('button')!;
  const toggle = (open?: boolean) => {
    const next = open ?? !help.classList.contains('open');
    help.classList.toggle('open', next);
    button.setAttribute('aria-expanded', String(next));
  };
  button.addEventListener('click', () => toggle());
  S.helpKey = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement)?.closest?.('input, textarea')) return;
    if (e.key === '?') toggle();
    else if (e.key === 'Escape') toggle(false);
    else if (e.key === 'm' && !e.metaKey && !e.ctrlKey) (S.sound as MeadowSound | undefined)?.toggle();
  };
  document.addEventListener('keydown', S.helpKey);
  S.help = help;
}

export const meadow: Variant = {
  label: 'meadow',
  physics: true,
  lens: 0,
  keys: true,
  hideHover: true,
  ownIntro: true,
  busy(f) {
    const S = f.state;
    return (S.cam as Camera).moving || (S.falling as Leaf[]).length > 0 || !!S.born || Math.abs(S.bulge ?? 0) > 0.002 || (S.card as MonthCard).isOpen;
  },
  hit: hitTest,
  layout(f) {
    const S = f.state;
    if (!S.cam) {
      S.cam = new Camera(f);
      S.cam.cx = f.frame.left + f.frame.w / 2;
      S.cam.cy = f.frame.top + f.frame.h / 2;
    }
    if (!S.cells) grow(f);
    place(f);
    return 8;
  },
  enter(f) {
    const S = f.state, cam: Camera = S.cam, fr = f.frame, b = cam.bounds;
    cam.attach(f.ctx.canvas);
    S.lens = f.reduced ? null : Fisheye.create(f.ctx.canvas);
    S.yearEl = document.querySelector('.page-nav .yr');
    S.yearHome = S.yearEl?.textContent ?? '';
    S.yearShown = S.yearHome;
    S.sound = createMeadowSound();
    mountHelp(f);
    S.card = new MonthCard(f, (i) => {
      focusOn(f, (S.cells as Cell[])[S.cellOf[i]], i);
      chime(f, i);
    });
    S.bulge = 0;
    S.lastLogZ = Math.log(cam.z);
    if (import.meta.env.DEV) Object.assign(window as any, { __meadowCam: cam, __meadow: S, __meadowHit: (x: number, y: number) => hitTest(f, x, y), __meadowField: f });
    // Leaving for an essay or anywhere else, the meadow remembers the view to come back to.
    S.onLeave = (e: Event) => leave(f, e);
    document.addEventListener('astro:before-preparation', S.onLeave);
    if (comeBack(f)) return;
    if (f.reduced) return;
    // Open close on today's bud, then pull back to the sheet.
    const t = f.n - 1, c: Cell = S.cells[S.cellOf[t]];
    cam.z = clamp((fr.h * 0.5) / (c.H * 0.35), 3, cam.zMax * 0.5);
    cam.cx = c.bx + S.hx[t] * S.k;
    cam.cy = c.by + S.hy[t] * S.k + c.H * 0.08;
    // On phones the sheet is taller than the screen; land on the newest rows.
    const fitY = Math.min((b.y0 + b.y1) / 2, b.y1 - fr.h / 2);
    cam.flyTo((b.x0 + b.x1) / 2, fitY, 1, 4200, 700);
    sow(f, c);
  },
  exit(f) {
    (f.state.cam as Camera | undefined)?.release();
    (f.state.lens as Fisheye | null | undefined)?.dispose();
    f.state.help?.remove();
    (f.state.card as MonthCard | undefined)?.dispose();
    (f.state.sound as MeadowSound | undefined)?.dispose();
    f.state.helpKey && document.removeEventListener('keydown', f.state.helpKey);
    f.state.onLeave && document.removeEventListener('astro:before-preparation', f.state.onLeave);
    if (f.state.yearEl) f.state.yearEl.textContent = f.state.yearHome;
  },
  tick(f) {
    const S = f.state, cam: Camera = S.cam, dt = f.dt;
    if (!f.reduced) S.time += dt;
    cam.update(dt);
    // The lens follows how fast the zoom is moving: bulge going in, pinch going out, easing
    // back to flat as soon as the zoom stops.
    const logZ = Math.log(cam.z), rate = dt > 0 ? (logZ - (S.lastLogZ ?? logZ)) / dt : 0;
    S.lastLogZ = logZ;
    const sound: MeadowSound | undefined = S.sound;
    sound?.zoom(rate);
    const target = clamp(rate * 0.075, -0.16, 0.2);
    S.bulge ??= 0;
    S.bulge += (target - S.bulge) * (1 - Math.exp(-dt * (Math.abs(target) > Math.abs(S.bulge) ? 9 : 6)));
    const cells: Cell[] = S.cells, p = f.pointer;
    // With "info" open the meadow parts for the document: bunches near it lean away, the way
    // grass parts around someone walking through, and straighten again when it closes.
    const rest: Float32Array = (S.rest ??= new Float32Array(cells.length));
    const panel = f.infoOpen ? document.querySelector('[data-info-panel]')?.getBoundingClientRect() : null;
    const rk = 1 - Math.exp(-dt * (panel ? 2.6 : 1.8));
    // Wind, and the pointer brushing through sprigs it passes over.
    for (const c of cells) {
      let want = 0;
      if (panel && !f.reduced) {
        const base = cam.toScreen(c.bx, c.by), half = (c.W * cam.z) / 2, top = base.y - c.H * cam.z;
        const dx = Math.max(panel.left - (base.x + half), base.x - half - panel.right, 0);
        const dy = Math.max(panel.top - base.y, top - panel.bottom, 0);
        const near = clamp(1 - Math.hypot(dx, dy) / 180, 0, 1);
        const away = Math.sign(base.x - (panel.left + panel.right) / 2) || 1;
        want = away * 0.34 * near * near * (3 - 2 * near);
      }
      rest[c.m] += (want - rest[c.m]) * rk;
      if (p && !f.reduced && !p.down && p.dx) {
        const base = cam.toScreen(c.bx, c.by), top = cam.toScreen(c.bx, c.by - c.H);
        const half = (c.W * cam.z) / 2;
        if (Math.abs(p.x - base.x) < half && p.y < base.y && p.y > top.y) {
          const lever = clamp((base.y - p.y) / Math.max(base.y - top.y, 1), 0.25, 1);
          S.bv[c.m] += ((p.dx / Math.max(c.H * cam.z, 40)) * 2.4) * lever;
        }
      }
      S.bv[c.m] += (-30 * (S.bend[c.m] - rest[c.m]) - 4.2 * S.bv[c.m]) * dt;
      S.bend[c.m] = clamp(S.bend[c.m] + S.bv[c.m] * dt, -0.6, 0.6);
      const gust = f.reduced ? 0 : 0.026 * Math.sin(S.time * 0.9 + c.bx * 0.006 + c.row * 0.8) + 0.01 * Math.sin(S.time * 2.3 + c.m);
      S.sway[c.m] = gust + S.bend[c.m];
    }
    if (!f.reduced) {
      resizeGust(f);
      shake(f);
    }
    const hx: Float32Array = S.hx, hy: Float32Array = S.hy, cellOf: Uint16Array = S.cellOf;
    for (let i = 0; i < f.n; i++) {
      const q = project(f, cells[cellOf[i]], hx[i], hy[i]);
      f.x[i] = f.tx[i] = q.x;
      f.y[i] = f.ty[i] = q.y;
    }
    f.cell = clamp(S.cw * cam.z * 0.08, 5, 60);
    followYear(f);
    followFocus(f);
    focusLight(f);
    // With the card gone, the view eases back inside the sheet.
    if (!(S.card as MonthCard).isOpen && (cam.slack.l || cam.slack.r || cam.slack.t || cam.slack.b)) cam.slack = { l: 0, r: 0, t: 0, b: 0 };
    // A bunch under the pointer wakes up, even one faded back by the focus light.
    const hl: Float32Array = (S.hl ??= new Float32Array(cells.length));
    const hov = f.hovered >= 0 ? S.cellOf[f.hovered] : -1, hk = 1 - Math.exp(-dt * 14);
    for (let m = 0; m < hl.length; m++) hl[m] += ((m === hov ? 1 : 0) - hl[m]) * hk;
    if (sound) listen(f, sound);
  },
  wheel(f, e) {
    const r = f.ctx.canvas.getBoundingClientRect();
    return (f.state.cam as Camera).wheel(e, e.clientX - r.left, e.clientY - r.top);
  },
  click(f, i) {
    const S = f.state, cam: Camera = S.cam, card: MonthCard = S.card;
    if (cam.dragged) { cam.dragged = false; return true; }
    const p = f.pointer;
    if (!p) return true;
    // A flower (or anywhere on a bunch) opens its month's card; empty ground closes it.
    const w = cam.toWorld(p.x, p.y), cells: Cell[] = S.cells;
    const cell = i >= 0 ? cells[S.cellOf[i]] : cells.find((c) => Math.abs(w.x - c.bx) < c.W / 2 && w.y < c.by + S.ch * 0.07 && w.y > c.by - S.ch * 0.93);
    if (!cell) { card.close(); return true; }
    // A second click on an essay's flower opens the essay.
    const essay = i >= 0 && card.openDay === i ? f.days[i].e?.[0] : undefined;
    if (essay) { navigate(`/writing/${essay.s}`); return true; }
    focusOn(f, cell, i);
    chime(f, i);
    return true;
  },
  draw(f) {
    const { ctx, colors, s } = f;
    const S = f.state, cam: Camera = S.cam, cells: Cell[] = S.cells, z = cam.z;
    const { ink, bg, faint } = colors;
    const W = f.width, H = f.height;
    // A fine pen from afar, a touch firmer as the drawing gets large.
    const lw = clamp(0.7 + 0.22 * Math.log2(Math.max(z, 1)), 0.72, 1.8);

    // Year labels down the left margin, month names along the top.
    ctx.font = font(11);
    ctx.textBaseline = 'middle';
    ctx.fillStyle = faint;
    const years = new Set<number>();
    for (const c of cells) {
      const yr = f.cal.y[c.first];
      if (years.has(yr)) continue;
      years.add(yr);
      const q = cam.toScreen(f.frame.left + S.gutter * 0.1, f.frame.top + (c.row + 0.86) * S.ch);
      if (q.y < -20 || q.y > H + 20) continue;
      ctx.globalAlpha = 0.9;
      ctx.textAlign = 'left';
      ctx.fillText(String(yr), Math.max(q.x, 8), q.y);
    }
    if (S.cols === 12) {
      ctx.textAlign = 'center';
      ctx.globalAlpha = clamp(1.6 - z * 0.5, 0, 0.8);
      if (ctx.globalAlpha > 0) {
        for (let m = 0; m < 12; m++) {
          const q = cam.toScreen(f.frame.left + S.gutter + (m + 0.5) * S.cw, f.frame.top - 12);
          ctx.fillText(MONTHS[m], q.x, q.y);
        }
      }
    }

    // The sprigs, in one fine pen line.
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const zk = z * S.k; // screen px per sprig unit
    // The focus spotlight: 1 inside, falling to a faint trace a couple of radii out.
    const spotA: number = S.spot?.a ?? 0;
    const sp = S.spot && spotA > 0.002 ? { ...cam.toScreen(S.spot.x, S.spot.y), r: S.spot.r * z } : null;
    const lit = (x: number, y: number) => {
      if (!sp) return 1;
      const t = clamp((Math.hypot(x - sp.x, y - sp.y) - sp.r) / (sp.r * 1.8 + 40), 0, 1);
      return 1 - spotA * 0.84 * t * t * (3 - 2 * t);
    };
    const hl: Float32Array | undefined = S.hl;
    const born: Float64Array | null = S.born ?? null;
    if (born && f.now > S.bornBy) S.born = null;
    for (const c of cells) {
      const base = cam.toScreen(c.bx, c.by);
      const reach = Math.max(c.W, c.H) * z;
      const wake = (hl?.[c.m] ?? 0) * 0.75;
      if (base.x < -reach || base.x > W + reach || base.y < -20 || base.y - c.H * z * 1.25 > H) continue;
      if (s[c.first] < 0.01 || c.m === S.lifted) continue;
      ctx.save();
      ctx.translate(base.x, base.y);
      ctx.scale(zk, zk);
      ctx.rotate(S.sway[c.m]);
      ctx.lineWidth = lw / zk;
      ctx.strokeStyle = ink;
      const cellLit = lit(base.x, base.y - c.H * z * 0.5) * (1 - wake) + wake;
      ctx.globalAlpha = s[c.first] * cellLit;
      // While it grows in, the stems are drawn up out of the ground like a pen stroke.
      const T = born ? f.now - born[c.m] : Infinity;
      if (T < 0) { ctx.restore(); continue; }
      const rise = T < STEM_FOR ? 1 - (1 - T / STEM_FOR) ** 2 : 1;
      if (rise < 1) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(-REF * 2, -c.h * 1.2 * rise - 1, REF * 4, c.h * 1.2 * rise + REF);
        ctx.clip();
        ctx.stroke(c.sprig.stems);
        ctx.restore();
      } else ctx.stroke(c.sprig.stems);
      // Fills knock out stems behind petals and leaves, then the ink line goes on top.
      const regrow: Float64Array = S.regrow;
      for (const o of c.sprig.organs) {
        if (s[o.i] < 0.01) continue;
        // A leaf that fell is gone, then grows back out from where it joins the stem.
        const g = regrow[o.i] ? clamp((f.now - regrow[o.i]) / REGROW_FOR, 0, 1) : 1;
        if (g <= 0) continue;
        // Growing in: each leaf and flower opens once the stem reaches its joint, with a
        // little overshoot, leaves unfurling outward as they go.
        const b = T < GROWN_BY ? clamp((T - sprout(c, o)) / OPEN_FOR, 0, 1) : 1;
        if (b <= 0) continue;
        ctx.globalAlpha = s[o.i] * (lit(f.x[o.i], f.y[o.i]) * (1 - wake) + wake) * Math.min(b * 3, 1);
        const sc = Math.min(1 - (1 - g) ** 3, b < 1 ? backOut(b) : 1);
        const turn = b < 1 && o.kind === 'leaf' ? (1 - b) ** 2 * 0.7 * Math.sign(o.hx - o.ax || 1) : 0;
        if (sc < 1 || turn) {
          ctx.save();
          ctx.translate(o.ax, o.ay);
          ctx.rotate(turn);
          ctx.scale(Math.max(sc, 0.001), Math.max(sc, 0.001));
          ctx.translate(-o.ax, -o.ay);
          ctx.lineWidth = lw / zk / Math.max(sc, 0.05);
        }
        ctx.fillStyle = bg;
        ctx.fill(o.pens.fill);
        ctx.fillStyle = ink;
        ctx.stroke(o.pens.line);
        ctx.fill(o.pens.ink);
        if (sc < 1 || turn) ctx.restore();
      }
      if (f.hovered >= 0 && S.cellOf[f.hovered] === c.m) {
        // From afar a single flower is a few pixels, so the whole bunch answers; close up,
        // the hovered day is re-inked a touch heavier.
        ctx.globalAlpha = clamp((2.5 - zk) / 1.2, 0, 1) * 0.9;
        if (ctx.globalAlpha > 0) {
          ctx.lineWidth = (lw * 1.6) / zk;
          ctx.stroke(c.sprig.stems);
          for (const q of c.sprig.organs) if (s[q.i] > 0.5) ctx.stroke(q.pens.line);
        }
        const o = c.sprig.organs.find((q) => q.i === f.hovered);
        if (o) {
          ctx.globalAlpha = 1;
          ctx.lineWidth = (lw * 1.9) / zk;
          ctx.stroke(o.pens.line);
          ctx.fill(o.pens.ink);
        }
      }
      // The tag ties the bunch together, so it sits over the leaves and flowers, never under.
      const jobs = (f.landmarks[c.key] ?? []).filter((x) => x.k === 'job');
      ctx.lineWidth = lw / zk;
      if (jobs.length) ribbon(ctx, c, jobs[0].t, f.now, f.reduced, bg, ink, zk, cellLit * clamp((T - STEM_FOR * 0.7) / 500, 0, 1));
      ctx.restore();
    }

    // Leaves in the air, and lying on the rows.
    for (const L of S.falling as Leaf[]) {
      const q = cam.toScreen(L.c.bx + L.x * S.k, L.c.by + L.y * S.k);
      if (q.x < -60 || q.x > W + 60 || q.y < -60 || q.y > H + 60) continue;
      ctx.save();
      ctx.globalAlpha = L.landed ? clamp(1 - (f.now - L.landed) / 2600, 0, 1) : 1;
      ctx.translate(q.x, q.y);
      ctx.scale(zk, zk);
      ctx.rotate(L.rot);
      ctx.translate(-L.o.hx, -L.o.hy);
      ctx.lineWidth = lw / zk;
      ctx.fillStyle = bg;
      ctx.fill(L.o.pens.fill);
      ctx.strokeStyle = ink;
      ctx.stroke(L.o.pens.line);
      ctx.fillStyle = ink;
      ctx.fill(L.o.pens.ink);
      ctx.restore();
    }

    // Today's bud breathes.
    const t = f.n - 1;
    const budIn = born ? clamp((f.now - born[S.cellOf[t]] - GROWN_BY * 0.6) / 600, 0, 1) : 1;
    if (s[t] * budIn > 0.02) {
      const phase = f.reduced ? 0.5 : (f.now % 2600) / 2600;
      ctx.globalAlpha = (1 - phase) * 0.45 * s[t] * budIn;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(f.x[t], f.y[t], Math.max(6, S.cw * 0.03 * z) * (1.4 + phase * 2.4), 0, TAU);
      ctx.stroke();
    }

    // Close up: month names under sprigs and essay titles beside their blooms.
    const sprigPx = S.ch * z;
    if (sprigPx > 200) {
      const a = clamp((sprigPx - 200) / 120, 0, 1);
      ctx.font = font(11);
      for (const c of cells) {
        const base = cam.toScreen(c.bx, c.by);
        if (base.x < -300 || base.x > W + 300 || base.y < -40 || base.y - c.H * z > H + 40) continue;
        ctx.globalAlpha = a * 0.85 * lit(base.x, base.y - c.H * z * 0.5);
        ctx.fillStyle = faint;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`${MONTHS[f.cal.m[c.first]]} ${f.cal.y[c.first]}`, base.x, base.y + 10);
        for (const b of c.sprig.blooms) {
          const q = project(f, c, b.x, b.y), d = f.days[b.i];
          const text = d.e ? d.e.map((e) => e.t).join(', ') : (d.ev ?? []).map((m) => m.t).join(', ');
          const side = b.x >= 0 ? 1 : -1;
          ctx.globalAlpha = a * s[b.i] * lit(q.x, q.y);
          ctx.textAlign = side > 0 ? 'left' : 'right';
          ctx.textBaseline = 'middle';
          // A halo in the page colour keeps titles legible where they cross petals.
          ctx.lineWidth = 4;
          ctx.strokeStyle = bg;
          ctx.strokeText(text, q.x + side * (b.r * z * S.k + 8), q.y);
          ctx.fillStyle = ink;
          ctx.fillText(text, q.x + side * (b.r * z * S.k + 8), q.y);
        }
      }
    }

    ctx.globalAlpha = 1;

    // While zooming, the finished frame goes through the lens (the hover ring, drawn by the
    // engine afterwards, sits it out).
    (S.lens as Fisheye | null)?.render(S.bulge, cam.anchor.x, cam.anchor.y);
  },
};
