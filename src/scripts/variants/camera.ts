/* A canvas camera with the conventions of Figma and Maps.

   - Trackpad two-finger scroll pans; pinch (ctrl+wheel) zooms around the pointer.
   - A mouse wheel zooms in smooth animated steps around the pointer.
   - Drag pans, and a flick keeps gliding with friction.
   - Touch: one finger pans, two fingers pinch-zoom and pan together.
   - Double-click dives in around the point. Escape goes back to where the dive started (or
     fits everything when there's nothing to go back to); 0 always fits everything.
   - WASD / arrow keys glide around (shift for faster), Q / E zoom out and in while held.
   - Past the edges and below the fit scale, the view stretches a little, then springs back.

   World coordinates are the variant's; at z = 1 the whole world fits the frame. */

import type { Field } from '../field-kit';

export type Bounds = { x0: number; y0: number; x1: number; y1: number };

type Fly = { t0: number; dur: number; delay: number; z0: number; z1: number; x0: number; y0: number; x1: number; y1: number; arc: number };

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export class Camera {
  /** zoom; world point at the screen centre */
  z = 1;
  cx = 0;
  cy = 0;
  zMin = 1;
  zMax = 40;
  bounds: Bounds = { x0: 0, y0: 0, x1: 0, y1: 0 };
  /** Extra room (screen px) the view may roam past each edge, e.g. so a bunch at the edge of
      the sheet can still sit beside an open card. */
  slack = { l: 0, r: 0, t: 0, b: 0 };
  /** true while the last press moved enough to count as a drag (swallows the click) */
  dragged = false;
  /** screen point the most recent zoom was anchored on */
  anchor = { x: 0, y: 0 };
  /** the view to return to on Escape, taken when a deliberate dive starts */
  saved: { cx: number; cy: number; z: number } | null = null;

  private vx = 0;
  private vy = 0;
  private zoomTo: { z: number; ax: number; ay: number } | null = null;
  private fly: Fly | null = null;
  private pointers = new Map<number, { x: number; y: number }>();
  private pinch: { d: number; mx: number; my: number } | null = null;
  private press: { x: number; y: number } | null = null;
  private lastMove = 0;
  /** keys held for gliding, and the glide's current velocity (screen px/s, log-zoom/s) */
  private keys = new Set<string>();
  private fast = false;
  private kvx = 0;
  private kvy = 0;
  private kvz = 0;
  private detach: (() => void) | null = null;

  constructor(private f: Field) {}

  get screenCenter() {
    const fr = this.f.frame;
    return { x: fr.left + fr.w / 2, y: fr.top + fr.h / 2 };
  }

  toScreen(wx: number, wy: number) {
    const c = this.screenCenter;
    return { x: c.x + (wx - this.cx) * this.z, y: c.y + (wy - this.cy) * this.z };
  }

  toWorld(sx: number, sy: number) {
    const c = this.screenCenter;
    return { x: this.cx + (sx - c.x) / this.z, y: this.cy + (sy - c.y) / this.z };
  }

  get flying() {
    return !!this.fly;
  }

  /** How far the current flight has got, eased exactly as the camera moves (0–1); -1 when not flying. */
  get progress() {
    const fl = this.fly;
    if (!fl) return -1;
    return ease(clamp((performance.now() - fl.t0 - fl.delay) / fl.dur, 0, 1));
  }

  get busy() {
    return !!this.fly || this.pointers.size > 0;
  }

  /** Zoom by a factor keeping the world point under (sx, sy) fixed. */
  zoomAt(factor: number, sx: number, sy: number) {
    this.anchor = { x: sx, y: sy };
    const w = this.toWorld(sx, sy);
    this.z = clamp(this.z * factor, this.zMin * 0.55, this.zMax * 1.25);
    const c = this.screenCenter;
    this.cx = w.x - (sx - c.x) / this.z;
    this.cy = w.y - (sy - c.y) / this.z;
  }

  panBy(dx: number, dy: number) {
    this.cx -= dx / this.z;
    this.cy -= dy / this.z;
  }

  /** Glide to a world point and zoom, pulling back mid-flight when the trip is long. */
  flyTo(x1: number, y1: number, z1: number, dur = 1200, delay = 0) {
    // Aim where the view is allowed to settle, so the flight never overshoots and springs back.
    const lim = this.limits(clamp(z1, this.zMin, this.zMax));
    x1 = clamp(x1, lim.x0, lim.x1);
    y1 = clamp(y1, lim.y0, lim.y1);
    const c = this.screenCenter;
    const dist = Math.hypot(x1 - this.cx, y1 - this.cy) * Math.min(this.z, z1);
    const arc = clamp(Math.log(1 + dist / (c.x * 2)), 0, 1.6);
    this.fly = {
      t0: performance.now(), dur, delay,
      z0: Math.log(this.z), z1: Math.log(clamp(z1, this.zMin, this.zMax)),
      x0: this.cx, y0: this.cy, x1, y1, arc,
    };
    this.vx = this.vy = 0;
    this.zoomTo = null;
    this.anchor = this.screenCenter;
  }

  /** Where the view's centre may be at zoom z: as far as keeps the world filling the view (or
      centred if it's smaller), plus any slack. */
  limits(z: number) {
    const b = this.bounds, fr = this.f.frame, sl = this.slack;
    const halfW = fr.w / 2 / z, halfH = fr.h / 2 / z;
    const minX = b.x0 + Math.min(halfW, (b.x1 - b.x0) / 2) - sl.l / z;
    const maxX = b.x1 - Math.min(halfW, (b.x1 - b.x0) / 2) + sl.r / z;
    const minY = b.y0 + Math.min(halfH, (b.y1 - b.y0) / 2) - sl.t / z;
    const maxY = b.y1 - Math.min(halfH, (b.y1 - b.y0) / 2) + sl.b / z;
    return { x0: Math.min(minX, maxX), x1: Math.max(minX, maxX), y0: Math.min(minY, maxY), y1: Math.max(minY, maxY) };
  }

  /** Note the current view as the one to come back to, unless a dive is already under way. */
  remember() {
    if (!this.saved) this.saved = { cx: this.cx, cy: this.cy, z: this.z };
  }

  /** Return to the remembered view; false when there's none. */
  back(dur = 800) {
    const s = this.saved;
    if (!s) return false;
    this.saved = null;
    this.keys.clear();
    this.flyTo(s.cx, s.cy, s.z, dur);
    return true;
  }

  fit(dur = 900) {
    this.saved = null;
    const b = this.bounds;
    this.flyTo((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, 1, dur);
  }

  attach(canvas: HTMLCanvasElement) {
    const prevTouch = canvas.style.touchAction;
    canvas.style.touchAction = 'none';
    const local = (e: PointerEvent | MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const pinchState = () => {
      const [a, b] = [...this.pointers.values()];
      return { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      // Keep receiving moves outside the canvas; capture can refuse inactive pointers.
      try { canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      const p = local(e);
      this.pointers.set(e.pointerId, p);
      this.fly = null;
      this.zoomTo = null;
      this.vx = this.vy = 0;
      if (this.pointers.size === 1) {
        this.press = p;
        this.dragged = false;
      } else if (this.pointers.size === 2) {
        this.pinch = pinchState();
        this.dragged = true;
      }
      this.lastMove = performance.now();
    };
    const move = (e: PointerEvent) => {
      const prev = this.pointers.get(e.pointerId);
      if (!prev) return;
      const p = local(e);
      this.pointers.set(e.pointerId, p);
      const now = performance.now(), dt = Math.max(1, now - this.lastMove) / 1000;
      this.lastMove = now;
      if (this.pointers.size >= 2 && this.pinch) {
        const s = pinchState();
        this.zoomAt(s.d / Math.max(this.pinch.d, 1), s.mx, s.my);
        this.panBy(s.mx - this.pinch.mx, s.my - this.pinch.my);
        this.pinch = s;
        return;
      }
      const dx = p.x - prev.x, dy = p.y - prev.y;
      if (this.press && Math.hypot(p.x - this.press.x, p.y - this.press.y) > 4) this.dragged = true;
      if (!this.dragged) return;
      this.panBy(dx, dy);
      // Velocity for the flick, smoothed so one jittery frame doesn't decide it.
      this.vx = this.vx * 0.6 + (dx / dt) * 0.4;
      this.vy = this.vy * 0.6 + (dy / dt) * 0.4;
    };
    const up = (e: PointerEvent) => {
      if (!this.pointers.has(e.pointerId)) return;
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) this.pinch = null;
      if (this.pointers.size === 1) {
        // Continuing with one finger after a pinch: re-anchor so it doesn't jump.
        this.press = [...this.pointers.values()][0];
      }
      // A pause before letting go means no flick.
      if (performance.now() - this.lastMove > 80) this.vx = this.vy = 0;
    };
    const dbl = (e: MouseEvent) => {
      const p = local(e), w = this.toWorld(p.x, p.y);
      const z1 = e.shiftKey || e.altKey ? this.z / 2.5 : this.z * 2.5;
      // Keep the clicked point under the pointer while diving.
      const c = this.screenCenter;
      const nz = clamp(z1, this.zMin, this.zMax);
      if (nz > this.z) this.remember();
      this.flyTo(w.x - (p.x - c.x) / nz, w.y - (p.y - c.y) / nz, nz, 520);
      this.fly!.arc = 0;
    };
    const MOVE = new Set(['w', 'a', 's', 'd', 'q', 'e', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
    const name = (e: KeyboardEvent) => (e.key.length === 1 ? e.key.toLowerCase() : e.key);
    const key = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      // Leave typing and browser/OS shortcuts (⌘W, ctrl+D…) alone.
      if ((e.target as HTMLElement)?.closest?.('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
      this.fast = e.shiftKey;
      if (MOVE.has(name(e))) {
        e.preventDefault();
        this.keys.add(name(e));
        this.fly = null;
        return;
      }
      const c = this.screenCenter;
      if (e.key === 'Escape') this.back() || this.fit();
      else if (e.key === '0') this.fit();
      else if (e.key === '=' || e.key === '+') this.zoomTo = { z: this.z * 1.8, ax: c.x, ay: c.y };
      else if (e.key === '-' || e.key === '_') this.zoomTo = { z: this.z / 1.8, ax: c.x, ay: c.y };
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('dblclick', dbl);
    const keyUp = (e: KeyboardEvent) => {
      this.fast = e.shiftKey;
      this.keys.delete(name(e));
    };
    // Letting go of the window mid-glide shouldn't leave it gliding.
    const blur = () => this.keys.clear();
    document.addEventListener('keydown', key);
    document.addEventListener('keyup', keyUp);
    window.addEventListener('blur', blur);
    this.detach = () => {
      canvas.style.touchAction = prevTouch;
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('dblclick', dbl);
      document.removeEventListener('keydown', key);
      document.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', blur);
      this.keys.clear();
    };
  }

  release() {
    this.detach?.();
    this.detach = null;
  }

  /** Wheel/trackpad input. Returns true (always handled). */
  wheel(e: WheelEvent, sx: number, sy: number) {
    this.fly = null;
    const lines = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
    const dx = e.deltaX * lines, dy = e.deltaY * lines;
    if (e.ctrlKey || e.metaKey) {
      // Trackpad pinch (and ⌘/ctrl + wheel): zoom directly, it's already smooth.
      this.zoomTo = null;
      this.zoomAt(Math.exp(-dy * 0.0105), sx, sy);
      return true;
    }
    // A notched mouse wheel: big, integer, vertical-only steps. Animate a zoom step.
    const notched = e.deltaMode !== 0 || (dx === 0 && Math.abs(dy) >= 50 && Number.isInteger(dy));
    if (notched) {
      const base = this.zoomTo?.z ?? this.z;
      this.zoomTo = { z: clamp(base * Math.exp(-Math.sign(dy) * 0.32), this.zMin, this.zMax), ax: sx, ay: sy };
      return true;
    }
    // Two-finger scroll pans; shift turns vertical wheel into horizontal.
    this.zoomTo = null;
    this.vx = this.vy = 0;
    if (e.shiftKey && dx === 0) this.panBy(-dy, 0);
    else this.panBy(-dx, -dy);
    return true;
  }

  /** Advance animations, inertia and the soft edges. Call once per frame. */
  update(dt: number) {
    const fl = this.fly;
    if (fl) {
      const u = clamp((performance.now() - fl.t0 - fl.delay) / fl.dur, 0, 1), e = ease(u);
      this.z = Math.exp(fl.z0 + (fl.z1 - fl.z0) * e - fl.arc * Math.sin(Math.PI * e));
      this.cx = fl.x0 + (fl.x1 - fl.x0) * e;
      this.cy = fl.y0 + (fl.y1 - fl.y0) * e;
      if (u >= 1) this.fly = null;
      return;
    }
    // Back out at the whole sheet by hand: there's nothing left to return to.
    if (this.saved && this.z <= this.zMin * 1.02) this.saved = null;
    if (this.zoomTo) {
      const k = 1 - Math.exp(-dt * 14);
      const nz = Math.exp(Math.log(this.z) + (Math.log(this.zoomTo.z) - Math.log(this.z)) * k);
      this.zoomAt(nz / this.z, this.zoomTo.ax, this.zoomTo.ay);
      if (Math.abs(Math.log(this.zoomTo.z / this.z)) < 0.002) this.zoomTo = null;
    }
    // Keyboard glide: ease toward the held direction, coast to a stop on release.
    const K = this.keys, on = (...k: string[]) => (k.some((x) => K.has(x)) ? 1 : 0);
    let dx = on('d', 'ArrowRight') - on('a', 'ArrowLeft'), dy = on('s', 'ArrowDown') - on('w', 'ArrowUp');
    const len = Math.hypot(dx, dy) || 1;
    const speed = (this.fast ? 1900 : 820);
    dx = (dx / len) * speed;
    dy = (dy / len) * speed;
    const dz = (on('e') - on('q')) * (this.fast ? 2.6 : 1.5);
    const glide = 1 - Math.exp(-dt * 8);
    this.kvx += (dx - this.kvx) * glide;
    this.kvy += (dy - this.kvy) * glide;
    this.kvz += (dz - this.kvz) * glide;
    if (Math.abs(this.kvx) + Math.abs(this.kvy) > 0.5) this.panBy(-this.kvx * dt, -this.kvy * dt);
    else this.kvx = this.kvy = 0;
    if (Math.abs(this.kvz) > 0.002) {
      const c = this.screenCenter;
      this.zoomAt(Math.exp(this.kvz * dt), c.x, c.y);
      this.z = clamp(this.z, this.zMin * 0.55, this.zMax);
    } else this.kvz = 0;

    const held = this.pointers.size > 0;
    if (!held && (this.vx || this.vy)) {
      this.panBy(this.vx * dt, this.vy * dt);
      const fr = Math.exp(-dt * 4.2);
      this.vx *= fr;
      this.vy *= fr;
      if (Math.hypot(this.vx, this.vy) < 4) this.vx = this.vy = 0;
    }
    if (held) return;
    // Rubber band: below the fit scale, or with the world dragged out of view, ease back.
    const k = 1 - Math.exp(-dt * 7);
    if (this.z < this.zMin && !this.zoomTo) {
      const c = this.screenCenter;
      this.zoomAt(Math.exp((Math.log(this.zMin) - Math.log(this.z)) * k), c.x, c.y);
    }
    const lim = this.limits(this.z);
    const tx = clamp(this.cx, lim.x0, lim.x1);
    const ty = clamp(this.cy, lim.y0, lim.y1);
    if (tx !== this.cx || ty !== this.cy) {
      this.cx += (tx - this.cx) * k;
      this.cy += (ty - this.cy) * k;
      this.vx *= 0.8;
      this.vy *= 0.8;
    }
  }
}
