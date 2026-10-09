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
  const back = readReturn();
  const live: Live[] = [];
  for (const el of root.querySelectorAll<HTMLElement>('[data-specimen]')) {
    const canvas = el.querySelector('canvas');
    if (!canvas) continue;
    const data = JSON.parse(el.dataset.specimen!) as SpecimenData;
    const big = el.classList.contains('specimen');
    live.push({
      el, canvas, data, sprig: growSpecimen(data),
      // The essay's own bunch arrives already grown when the meadow flew it here.
      born: reduced || (big && handed?.key === data.key) || (!big && back?.pick === data.pick) ? -Infinity : Infinity,
      seen: false, gust: 0, gv: 0, phase: data.first * 0.37,
    });
  }
  if (!live.length) return () => {};

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const s = live.find((x) => x.el === e.target);
      if (!s) continue;
      s.seen = e.isIntersecting;
      if (s.seen && s.born === Infinity) s.born = performance.now() + live.indexOf(s) * 60;
    }
    wake();
  }, { rootMargin: '40px' });
  for (const s of live) io.observe(s.el);

  // The pointer brushing past a bunch sets it swaying.
  const onMove = (e: PointerEvent) => {
    for (const s of live) {
      if (!s.seen) continue;
      const r = (s.el.closest('[data-press]') ?? s.el).getBoundingClientRect();
      if (e.clientX > r.left - 8 && e.clientX < r.right + 8 && e.clientY > r.top && e.clientY < r.bottom) s.gv += e.movementX * 0.004;
    }
    wake();
  };
  addEventListener('pointermove', onMove, { passive: true });
  // Opening an essay from a list carries its little bunch to the page (it grows there).
  const onPress = (e: MouseEvent) => {
    const a = (e.target as HTMLElement)?.closest?.('a[data-press]');
    const sp = a?.querySelector<HTMLElement>('[data-specimen]');
    if (!sp || e.metaKey || e.ctrlKey || e.shiftKey) return;
    sp.style.viewTransitionName = 'specimen';
    handOff((JSON.parse(sp.dataset.specimen!) as SpecimenData).key);
  };
  document.addEventListener('click', onPress);

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
  // Arrived from the meadow or the index: the way back is the way we came, and the bunch
  // flies home with it.
  const essay = live.find((s) => s.el.classList.contains('specimen'));
  const backLink = document.querySelector<HTMLAnchorElement>('.page-back');
  if (essay && handed?.from && backLink) {
    backLink.href = handed.from;
    backLink.lastChild!.textContent = handed.from === '/' ? 'Meadow' : 'Writing';
    backLink.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      history.back();
    });
  }
  const onLeave = (e: Event) => {
    const to: URL | undefined = (e as any).to;
    if (!essay || !to || (to.pathname !== '/' && to.pathname.replace(/\/$/, '') !== '/writing')) return;
    try { sessionStorage.setItem(RETURN, JSON.stringify({ key: essay.data.key, pick: essay.data.pick })); } catch {}
  };
  document.addEventListener('astro:before-preparation', onLeave);
  // Back on the index, the essay's own little bunch is the one it lands in.
  if (back && !essay) {
    const home = live.find((s) => s.data.pick === back.pick);
    if (home) {
      home.el.style.viewTransitionName = 'specimen';
      afterTransition(() => { home.el.style.viewTransitionName = ''; });
    }
    try { sessionStorage.removeItem(RETURN); } catch {}
  }

  // A bunch handed over is drawn at once, before the page is shown.
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
    document.removeEventListener('astro:before-preparation', onLeave);
    document.removeEventListener('click', onPress);
  };
}

function read() {
  const cs = getComputedStyle(document.documentElement);
  return { ink: cs.getPropertyValue('--notion-ink').trim() || '#18181b', bg: cs.getPropertyValue('--notion-bg').trim() || '#fafafa' };
}

/** Whoever hands a bunch to an essay (the meadow, the index) leaves a note: which bunch, and
    where the essay should lead back to. */
const HANDOFF = 'meadow-handoff';
export function handOff(key: string) {
  try { sessionStorage.setItem(HANDOFF, JSON.stringify({ key, from: location.pathname })); } catch {}
}
function consumeHandoff(): { key: string; from: string } | null {
  try {
    const k = sessionStorage.getItem(HANDOFF);
    sessionStorage.removeItem(HANDOFF);
    return k ? JSON.parse(k) : null;
  } catch {
    return null;
  }
}

/** Leaving an essay for the meadow or the index: the bunch to fly back into. */
export const RETURN = 'meadow-return';
export function readReturn(): { key: string; pick?: number } | null {
  try {
    return JSON.parse(sessionStorage.getItem(RETURN) ?? 'null');
  } catch {
    return null;
  }
}

/** Run once the page transition in flight (if any) has finished. astro:page-load can fire
    before the new page is captured, which would whisk a shared element away too early. */
export function afterTransition(fn: () => void) {
  const busy = () => document.getAnimations().some((a) => (a.effect as KeyframeEffect | null)?.pseudoElement?.startsWith('::view-transition'));
  let frames = 0;
  const check = () => {
    // Give the transition a couple of frames to start before deciding it's over.
    if (++frames < 3 || busy()) requestAnimationFrame(check);
    else fn();
  };
  requestAnimationFrame(check);
}
