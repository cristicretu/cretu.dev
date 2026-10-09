/* Shared contract between the days-field engine and its variants.

   The engine owns one dot per day (oldest first, today last) with spring physics, a pointer
   lens, hover hit-testing, the chronological intro and the "info" hole. A variant decides where
   the days go and, optionally, takes over simulation and drawing entirely. */

export type Day = {
  /** GitHub contribution level 0–4 */
  l: number;
  /** contribution count */
  c?: number;
  /** essays published that day */
  e?: { t: string; s: string }[];
  /** other moments that day: launches, tweets, achievements… (see src/data/timeline.ts) */
  ev?: Moment[];
};

export type Moment = { k: 'tweet' | 'launch' | 'achievement' | 'job' | 'talk' | 'life'; t: string; h?: string };

export type Frame = { left: number; top: number; w: number; h: number };

export type Pointer = {
  x: number;
  y: number;
  /** pointer is pressed */
  down: boolean;
  /** movement since the last frame */
  dx: number;
  dy: number;
};

export type Field = {
  n: number;
  days: Day[];
  /** Calendar parts per day (UTC). mi = month index since the first month. */
  cal: { y: Uint16Array; m: Uint8Array; dom: Uint8Array; doy: Uint16Array; mi: Uint16Array };
  /** Live positions; the engine springs these toward tx/ty unless the variant sets `physics`. */
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  /** Layout targets. */
  tx: Float32Array;
  ty: Float32Array;
  /** Animated visibility 0–1 (intro + info hole), and its target. */
  s: Float32Array;
  ts: Float32Array;
  /** Pointer-lens amount 0–1 per day. */
  lens: Float32Array;
  ctx: CanvasRenderingContext2D;
  colors: { ink: string; dim: string; bg: string; faint: string };
  /** The area between the nav and the readout line, in CSS px. */
  frame: Frame;
  /** Dot spacing returned by layout(); used for sizes, lens radius and hover. */
  cell: number;
  /** performance.now() of this frame, and seconds since the last one. */
  now: number;
  dt: number;
  width: number;
  height: number;
  pointer: Pointer | null;
  hovered: number;
  reduced: boolean;
  infoOpen: boolean;
  /** Scratch space for the active variant; reset whenever the variant changes. */
  state: Record<string, any>;
  /** A short note per month ("2025-06"), from src/data/months.ts. */
  notes: Record<string, string>;
  /** Moments known only to their month ("2025-06") or year ("2023"). */
  landmarks: Record<string, Moment[]>;
  /** "8 oct 2026" */
  dateOf(i: number): string;
  /** Ask the engine to lay out again (e.g. after the variant changes its own mode). */
  relayout(): void;
};

export type Variant = {
  label: string;
  /** Force a theme while this variant is shown. */
  theme?: 'light' | 'dark';
  /** Write tx/ty for every day; return the dot spacing used for sizing, lens and hover. */
  layout(f: Field): number;
  /** Called when the variant becomes active (after the first layout). */
  enter?(f: Field): void;
  exit?(f: Field): void;
  /** Called every frame before integration. May move targets, or positions when `physics`. */
  tick?(f: Field): void;
  /** The variant integrates x/y itself in tick(); the engine skips its springs. */
  physics?: boolean;
  /** Replace the default dot drawing (essay rings, today and dots). Hover ring still draws. */
  draw?(f: Field): void;
  under?(f: Field): void;
  over?(f: Field): void;
  /** Hide the per-day dots (essays, today and hover still draw). */
  hideDots?: boolean;
  /** Per-day alpha multiplier, called every frame. */
  alpha?(f: Field, i: number): number;
  /** Pointer lens strength multiplier; 0 disables the swell. */
  lens?: number;
  /** The variant brings its days in itself; the engine skips its chronological fade-in. */
  ownIntro?: boolean;
  /** The variant shows hover itself; the engine skips its ring. */
  hideHover?: boolean;
  /** Custom hover hit test; return a day index or -1. */
  hit?(f: Field, px: number, py: number): number;
  pointerDown?(f: Field): void;
  pointerUp?(f: Field): void;
  /** Return true to swallow the event (and prevent page scroll). */
  wheel?(f: Field, e: WheelEvent): boolean;
  /** The variant uses the arrow keys itself (the switcher then answers to [ and ] only). */
  keys?: boolean;
  /** Return true to stop the default click (open the essay on that day). */
  click?(f: Field, i: number): boolean;
};

export const TAU = Math.PI * 2;
export const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** Deterministic 0–1 noise per integer. */
export const hash = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

export const center = (f: Field) => ({ cx: f.frame.left + f.frame.w / 2, cy: f.frame.top + f.frame.h / 2 });

/** Largest square cell that fits n items in the frame, row-major. */
export function fitGrid(f: Field) {
  const { w, h } = f.frame;
  let cell = 0, cols = 1;
  for (let c = 1; c <= f.n; c++) {
    const size = Math.min(w / c, h / Math.ceil(f.n / c));
    if (size > cell) { cell = size; cols = c; }
  }
  return { cell, cols, rows: Math.ceil(f.n / cols) };
}

/** Writes the default grid into tx/ty and returns the cell. */
export function gridLayout(f: Field) {
  const { cell, cols, rows } = fitGrid(f);
  const ox = f.frame.left + (f.frame.w - cols * cell) / 2 + cell / 2;
  const oy = f.frame.top + (f.frame.h - rows * cell) / 2 + cell / 2;
  for (let i = 0; i < f.n; i++) {
    f.tx[i] = ox + (i % cols) * cell;
    f.ty[i] = oy + Math.floor(i / cols) * cell;
  }
  return cell;
}

/** Months as columns, days of month as rows, a blank column between years. Transposed on tall screens. */
export function monthGrid(f: Field) {
  const { cal, frame: fr, n } = f;
  const y0 = cal.y[0];
  const months = cal.mi[n - 1] + 1, years = cal.y[n - 1] - y0 + 1;
  const tall = fr.h > fr.w;
  const major = months + years - 1, minor = 31;
  const cell = tall ? Math.min(fr.w / minor, fr.h / major) : Math.min(fr.w / major, fr.h / minor);
  const ox = fr.left + (fr.w - (tall ? minor : major) * cell) / 2 + cell / 2;
  const oy = fr.top + (fr.h - (tall ? major : minor) * cell) / 2 + cell / 2;
  const place = (i: number, col: number, row: number) => {
    f.tx[i] = ox + (tall ? row : col) * cell;
    f.ty[i] = oy + (tall ? col : row) * cell;
  };
  const colOf = (i: number) => cal.mi[i] + (cal.y[i] - y0);
  return { cell, tall, ox, oy, place, colOf };
}

/** Ink alpha for a contribution level, matching the default field. */
export const levelAlpha = (l: number) => [0, 0.22, 0.38, 0.6, 1][l] ?? 1;

/** Default dot radius for a day at a given cell size. */
export const dotRadius = (d: Day, cell: number) => (d.l ? cell * 0.07 + cell * 0.04 * d.l : cell * 0.07);

/** Draws the field the way the default variant does (dots, essay rings, today pulse). */
export function drawDefault(f: Field) {
  const { ctx, n, days, x, y, s, lens, cell, colors } = f;
  for (let i = 0; i < n; i++) {
    const scale = s[i];
    if (scale < 0.01) continue;
    const d = days[i];
    const grow = 1 + lens[i] * 1.4;
    ctx.globalAlpha = d.l ? levelAlpha(d.l) : 1;
    ctx.fillStyle = d.l ? colors.ink : colors.dim;
    ctx.beginPath();
    ctx.arc(x[i], y[i], dotRadius(d, cell) * grow * scale, 0, TAU);
    ctx.fill();
    if (d.e) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = Math.max(1, cell * 0.06);
      ctx.beginPath();
      ctx.arc(x[i], y[i], cell * 0.38 * grow * scale, 0, TAU);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}
