/* Pressed bunches on ordinary pages: beside an essay, and beside each title in the writing
   index. Each [data-specimen] element holds one month's data and a canvas; the bunch grows in
   when it first comes into view (unless the meadow just handed it over mid-flight), then sways
   a little, more when the pointer passes. */

import { type SpecimenData, drawSpecimen, growSpecimen } from './variants/specimen';
import type { Sprig } from './variants/sprigs';

type Live = {
  el: HTMLElement;
  canvas: HTMLCanvasElement;
  data: SpecimenData;
  sprig: Sprig;
  born: number;
  seen: boolean;
  gust: number;
  gv: number;
  phase: number;
};

const GROW_FOR = 1500;

export function mountSpecimens(root: ParentNode = document) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const handed = consumeHandoff();
  const live: Live[] = [];
  for (const el of root.querySelectorAll<HTMLElement>('[data-specimen]')) {
    const canvas = el.querySelector('canvas');
    if (!canvas) continue;
    const data = JSON.parse(el.dataset.specimen!) as SpecimenData;
    const big = el.classList.contains('specimen');
    live.push({
      el, canvas, data, sprig: growSpecimen(data),
      // The essay's own bunch arrives already grown when the meadow flew it here.
      born: reduced || (big && handed === data.key) ? -Infinity : Infinity,
      seen: false, gust: 0, gv: 0, phase: data.first * 0.37,
    });
  }
  if (!live.length) return () => {};

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const s = live.find((x) => x.el === e.target);
      if (!s) continue;
      s.seen = e.isIntersecting;
      if (s.seen && s.born === Infinity) s.born = performance.now() + Math.random() * 120;
    }
    wake();
  }, { rootMargin: '40px' });
  for (const s of live) io.observe(s.el);

  // The pointer brushing past a bunch sets it swaying.
  const onMove = (e: PointerEvent) => {
    for (const s of live) {
      if (!s.seen) continue;
      const r = s.el.getBoundingClientRect();
      if (e.clientX > r.left - 8 && e.clientX < r.right + 8 && e.clientY > r.top && e.clientY < r.bottom) s.gv += e.movementX * 0.004;
    }
    wake();
  };
  addEventListener('pointermove', onMove, { passive: true });

  let raf = 0, last = performance.now(), colors = read();
  const onTheme = new MutationObserver(() => { colors = read(); wake(); });
  onTheme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  function wake() {
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function frame(now: number) {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    let busy = false;
    for (const s of live) {
      if (!s.seen) continue;
      s.gv += (-26 * s.gust - 3.4 * s.gv) * dt;
      s.gust += s.gv * dt;
      const g = s.born === Infinity ? 0 : Math.min(Math.max((now - s.born) / GROW_FOR, 0), 1);
      const breeze = reduced ? 0 : 0.012 * Math.sin(now / 1400 + s.phase);
      paint(s, g, breeze + s.gust);
      if (g < 1 || Math.abs(s.gv) > 0.0005 || Math.abs(s.gust) > 0.0005 || (!reduced && s.el.classList.contains('specimen'))) busy = true;
    }
    if (busy) wake();
  }
  function paint(s: Live, g: number, sway: number) {
    const { canvas } = s, dpr = Math.min(devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    drawSpecimen(ctx, s.sprig, s.data.h, { x: 0, y: 0, w, h }, {
      ink: colors.ink, bg: colors.bg, lw: s.el.classList.contains('specimen') ? 1.1 : 0.8,
      pick: s.data.pick, sway, grow: g,
    });
  }
  // A bunch handed over by the meadow is drawn at once, before the page is shown.
  for (const s of live) {
    if (s.born !== -Infinity) continue;
    const r = s.el.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight) {
      s.seen = true;
      paint(s, 1, 0);
    }
  }
  wake();
  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    onTheme.disconnect();
    removeEventListener('pointermove', onMove);
  };
}

function read() {
  const cs = getComputedStyle(document.documentElement);
  return { ink: cs.getPropertyValue('--notion-ink').trim() || '#18181b', bg: cs.getPropertyValue('--notion-bg').trim() || '#fafafa' };
}

/** The meadow leaves a note when it hands a bunch over to an essay. */
const HANDOFF = 'meadow-handoff';
export function handOff(key: string) {
  try { sessionStorage.setItem(HANDOFF, key); } catch {}
}
function consumeHandoff() {
  try {
    const k = sessionStorage.getItem(HANDOFF);
    sessionStorage.removeItem(HANDOFF);
    return k;
  } catch {
    return null;
  }
}
