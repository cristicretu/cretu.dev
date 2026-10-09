/* The homepage canvas: every day since the first essay, drawn by the meadow. This engine owns
   the per-day state (positions, appearance), pointer and wheel input, hover, the info panel
   and the frame loop; the meadow decides where each day is and how it all looks. */

import { type Day, type Field, type Variant, MONTHS, TAU, drawDefault } from './field-kit';
import { meadow } from './variants/meadow';

const DAY_MS = 86400000;

export function mountDaysField(root: HTMLElement) {
  // .page-content carries a transform (cascade + zoom transitions), which would trap a fixed
  // element inside it; the field lives directly under <body> instead.
  document.body.prepend(root);
  const canvas = root.querySelector('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const readout = root.querySelector<HTMLElement>('[data-readout]')!;
  const infoButton = document.querySelector<HTMLButtonElement>('[data-info]');
  const panel = document.querySelector<HTMLElement>('[data-info-panel]');
  const days: Day[] = JSON.parse(root.dataset.days!);
  const landmarks = JSON.parse(root.dataset.landmarks || '{}');
  const notes = JSON.parse(root.dataset.notes || '{}');
  const start = Date.parse(`${root.dataset.start}T00:00:00Z`);
  const n = days.length;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const defaultReadout = readout.innerHTML;
  const variant: Variant = meadow;

  // Per-dot spring state: position, velocity, and an animated scale (0 = hidden).
  const x = new Float32Array(n), y = new Float32Array(n);
  const vx = new Float32Array(n), vy = new Float32Array(n);
  const tx = new Float32Array(n), ty = new Float32Array(n);
  const s = new Float32Array(n), ts = new Float32Array(n);
  const lens = new Float32Array(n);

  // Calendar parts per day, shared with the variants.
  const cal = {
    y: new Uint16Array(n), m: new Uint8Array(n), dom: new Uint8Array(n),
    doy: new Uint16Array(n), mi: new Uint16Array(n),
  };
  for (let i = 0; i < n; i++) {
    const d = new Date(start + i * DAY_MS), year = d.getUTCFullYear();
    cal.y[i] = year;
    cal.m[i] = d.getUTCMonth();
    cal.dom[i] = d.getUTCDate();
    cal.doy[i] = Math.floor((d.getTime() - Date.UTC(year, 0, 1)) / DAY_MS);
    cal.mi[i] = (year - cal.y[0]) * 12 + cal.m[i] - cal.m[0];
  }

  let width = 0, height = 0, ratio = 1, placed = false;
  let raf = 0, last = 0, introStart = 0, entered = false;
  let savedTheme: string | null = null;

  function dateOf(i: number) {
    const d = new Date(start + i * DAY_MS);
    return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  }

  const field: Field = {
    n, days, cal, x, y, vx, vy, tx, ty, s, ts, lens, ctx,
    colors: readColors(),
    frame: { left: 0, top: 0, w: 0, h: 0 },
    cell: 0, now: 0, dt: 0, width: 0, height: 0,
    pointer: null, hovered: -1, reduced, infoOpen: false, state: {}, landmarks, notes,
    dateOf,
    relayout: () => { layout(); wake(); },
  };

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    return {
      ink: cs.getPropertyValue('--notion-ink').trim() || '#18181b',
      dim: cs.getPropertyValue('--notion-dim').trim() || '#c8c8cd',
      bg: cs.getPropertyValue('--notion-bg').trim() || '#fafafa',
      faint: cs.getPropertyValue('--notion-faint').trim() || '#67676d',
    };
  }

  // The field sits between the corner nav and the readout line.
  function frame() {
    const mobile = width < 640;
    const nav = document.querySelector('.page-nav')?.getBoundingClientRect().bottom ?? 0;
    const top = Math.max(mobile ? 104 : 120, nav + 24);
    const bottom = mobile ? 72 : 88, side = mobile ? 20 : 96;
    return { left: side, top, w: width - side * 2, h: height - top - bottom };
  }

  function layout() {
    field.frame = frame();
    field.width = width; field.height = height;
    field.cell = variant.layout(field);
    const clear = field.infoOpen && panel ? clearRect() : null;
    for (let i = 0; i < n; i++) {
      ts[i] = clear && tx[i] > clear.l && tx[i] < clear.r && ty[i] > clear.t && ty[i] < clear.b ? 0 : 1;
      if (!placed) { x[i] = tx[i]; y[i] = ty[i]; }
    }
    placed = true;
  }

  function clearRect() {
    const r = panel!.getBoundingClientRect(), pad = Math.max(field.cell * 1.5, 16);
    return { l: r.left - pad, r: r.right + pad, t: r.top - pad, b: r.bottom + pad };
  }

  function resize() {
    const rect = root.getBoundingClientRect();
    width = rect.width; height = rect.height;
    ratio = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(width * ratio), h = Math.round(height * ratio);
    // Resizing the backing store clears it; only touch it when the size really changed.
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    layout();
    // Repaint right now, inside the resize, rather than on the next frame: otherwise the
    // cleared canvas is shown blank for a frame and the page flickers while dragging.
    // (Before the variant has entered, the first frame just waits for the loop.)
    if (!entered) return wake();
    cancelAnimationFrame(raf);
    raf = 0;
    if (!last) last = performance.now();
    tick(performance.now());
  }

  function nearest(px: number, py: number) {
    if (variant.hit) return variant.hit(field, px, py);
    let best = -1, bestD = (Math.max(field.cell, 6) * 0.75) ** 2;
    for (let i = 0; i < n; i++) {
      if (s[i] < 0.5) continue;
      const d = (x[i] - px) ** 2 + (y[i] - py) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  function describe(i: number) {
    const d = days[i];
    const parts: string[] = [];
    if (d.e) parts.push(d.e.map((e) => `wrote “${e.t}”`).join(', '));
    if (d.ev) {
      const verb = { tweet: 'tweeted', launch: 'launched', achievement: '', job: '', talk: 'spoke:', life: '' };
      parts.push(d.ev.map((m) => `${verb[m.k] ? verb[m.k] + ' ' : ''}${m.t}`).join(', '));
    }
    if (d.c) parts.push(`${d.c} contribution${d.c === 1 ? '' : 's'}`);
    if (i === n - 1) parts.unshift('today');
    return `<span>${dateOf(i)}</span>${parts.length ? ` · ${parts.join(' · ')}` : ''}`;
  }

  function setHovered(i: number) {
    if (i === field.hovered) return;
    field.hovered = i;
    readout.innerHTML = i < 0 ? defaultReadout : describe(i);
    // Variants that answer clicks themselves make everything they hit pressable.
    canvas.style.cursor = i >= 0 && (days[i].e || (variant.hit && variant.click)) ? 'pointer' : '';
    document.querySelector('.cursor')?.classList.toggle('grow', i >= 0 && !!days[i].e);
  }

  function wake() {
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }

  function frameStep(now: number) {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    field.now = now; field.dt = dt;
    let moving = false;

    variant.tick?.(field);
    if (field.pointer) { field.pointer.dx = 0; field.pointer.dy = 0; }

    // Intro: dots arrive in chronological order, oldest first. Each fades over a window of
    // `ramp` days; run past the end so the newest finish too.
    const intro = reduced || variant.ownIntro ? 1 : Math.min((now - introStart) / 1400, 1);
    const ramp = n * 0.04;
    const shown = intro * (n + ramp);

    const lensR = field.cell * 4.5, lensK = variant.lens ?? 1, pointer = field.pointer;
    for (let i = 0; i < n; i++) {
      if (!variant.physics) {
        // Stiff, slightly underdamped spring toward the layout target.
        const k = 170, damp = 22;
        vx[i] += ((tx[i] - x[i]) * k - vx[i] * damp) * dt;
        vy[i] += ((ty[i] - y[i]) * k - vy[i] * damp) * dt;
        x[i] += vx[i] * dt; y[i] += vy[i] * dt;
      }

      const arrive = Math.min(Math.max(shown - i, 0) / ramp, 1);
      const target = ts[i] * arrive;
      s[i] += (target - s[i]) * Math.min(dt * 14, 1);

      let l = 0;
      if (pointer && lensK) {
        const d = Math.hypot(x[i] - pointer.x, y[i] - pointer.y);
        if (d < lensR) l = (1 - d / lensR) ** 2 * lensK;
      }
      lens[i] += (l - lens[i]) * Math.min(dt * 16, 1);

      if (
        Math.abs(tx[i] - x[i]) > 0.05 || Math.abs(vx[i]) + Math.abs(vy[i]) > 0.05 ||
        Math.abs(target - s[i]) > 0.002 || Math.abs(l - lens[i]) > 0.002
      ) moving = true;
    }

    draw(now);
    // Today breathes forever; everything else sleeps once settled.
    if (moving || intro < 1 || !reduced || variant.tick) raf = requestAnimationFrame(tick);
  }

  // A throwing variant must not stop the loop for good; log once per variant and keep going.
  let failed: Variant | null = null;
  // At rest the meadow only sways in the breeze, so it draws every other frame: half the work,
  // and the breeze is slow enough not to show it. Any input brings back every frame.
  let lastInput = 0, skip = false;
  const poke = () => { lastInput = performance.now(); };
  function tick(now: number) {
    if (now - lastInput > 2500 && !variant.busy?.(field) && (skip = !skip)) {
      raf = requestAnimationFrame(tick);
      return;
    }
    try {
      frameStep(now);
    } catch (err) {
      if (failed !== variant) { failed = variant; console.error(`[field] ${variant.label}:`, err); }
      raf = requestAnimationFrame(tick);
    }
  }

  function draw(now: number) {
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 1;
    field.colors = colors;
    const { cell } = field;

    // Drawings that aren't dots stay out of the info hole.
    const clear = field.infoOpen && panel ? clearRect() : null;
    const clipHole = (fn: () => void) => {
      ctx.save();
      if (clear) {
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.rect(clear.l, clear.t, clear.r - clear.l, clear.b - clear.t);
        ctx.clip('evenodd');
      }
      fn();
      ctx.restore();
    };

    if (variant.under) clipHole(() => variant.under!(field));

    if (variant.draw) {
      clipHole(() => variant.draw!(field));
    } else {
      if (variant.hideDots) {
        // Essays still mark their days.
        for (let i = 0; i < n; i++) {
          if (!days[i].e || s[i] < 0.01) continue;
          ctx.strokeStyle = colors.ink;
          ctx.lineWidth = Math.max(1, cell * 0.06);
          ctx.beginPath();
          ctx.arc(x[i], y[i], cell * 0.38 * (1 + lens[i] * 1.4) * s[i], 0, TAU);
          ctx.stroke();
        }
      } else if (variant.alpha) {
        for (let i = 0; i < n; i++) {
          const scale = s[i];
          if (scale < 0.01) continue;
          const d = days[i], grow = 1 + lens[i] * 1.4;
          ctx.globalAlpha = (d.l ? [0, 0.22, 0.38, 0.6, 1][d.l] : 1) * variant.alpha(field, i);
          ctx.fillStyle = d.l ? colors.ink : colors.dim;
          ctx.beginPath();
          ctx.arc(x[i], y[i], (d.l ? cell * 0.07 + cell * 0.04 * d.l : cell * 0.07) * grow * scale, 0, TAU);
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
      } else {
        drawDefault(field);
      }

      // Today: a solid dot with a slow pulse ring.
      const t = n - 1;
      if (s[t] > 0.01) {
        const phase = reduced ? 0.5 : (now % 2400) / 2400;
        ctx.fillStyle = colors.ink;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(x[t], y[t], cell * 0.3 * s[t] * (1 + lens[t] * 1.4), 0, TAU);
        ctx.fill();
        ctx.globalAlpha = (1 - phase) * 0.5;
        ctx.strokeStyle = colors.ink;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x[t], y[t], cell * (0.3 + phase * 0.9) * s[t], 0, TAU);
        ctx.stroke();
      }
    }

    if (variant.over) clipHole(() => variant.over!(field));

    const h = field.hovered;
    if (h >= 0 && s[h] > 0.5 && !variant.hideHover) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = colors.ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x[h], y[h], Math.max(cell, 8) * 0.62 * (1 + lens[h] * 1.4), 0, TAU);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  let colors = field.colors;

  function setInfo(open: boolean) {
    field.infoOpen = open;
    document.documentElement.classList.toggle('info-open', open);
    infoButton?.setAttribute('aria-expanded', String(open));
    if (infoButton) infoButton.textContent = open ? 'close' : 'info';
    if (panel) panel.inert = !open;
    // The document inks in as the meadow parts for it.
    if (open && panel) (window as any).inkIn?.(panel, { delay: 160 });
    layout();
    wake();
  }

  function applyTheme() {
    const html = document.documentElement;
    if (variant.theme) {
      if (savedTheme === null) savedTheme = html.dataset.theme ?? 'light';
      html.dataset.theme = variant.theme;
    } else if (savedTheme !== null) {
      html.dataset.theme = savedTheme;
      savedTheme = null;
    }
  }

  function pointerAt(e: PointerEvent | MouseEvent) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch' && e.type === 'pointermove' && !e.pressure) return;
    const p = pointerAt(e), prev = field.pointer;
    field.pointer = {
      x: p.x, y: p.y, down: prev?.down ?? false,
      dx: (prev?.dx ?? 0) + (prev ? p.x - prev.x : 0),
      dy: (prev?.dy ?? 0) + (prev ? p.y - prev.y : 0),
    };
    setHovered(nearest(p.x, p.y));
    wake();
  };
  const onDown = (e: PointerEvent) => {
    onMove(e);
    field.pointer!.down = true;
    variant.pointerDown?.(field);
  };
  const onUp = () => {
    if (field.pointer) field.pointer.down = false;
    variant.pointerUp?.(field);
  };
  const onLeave = () => {
    if (field.pointer?.down) variant.pointerUp?.(field);
    field.pointer = null;
    setHovered(-1);
    wake();
  };
  const onClick = (e: MouseEvent) => {
    const p = pointerAt(e);
    const i = nearest(p.x, p.y);
    // A touch has already "left" by the time its click arrives; the click still happened here.
    const lifted = !field.pointer;
    if (lifted) field.pointer = { x: p.x, y: p.y, down: false, dx: 0, dy: 0 };
    const handled = variant.click?.(field, i);
    if (lifted) field.pointer = null;
    if (handled) return;
    if (i >= 0 && days[i].e) window.location.href = `/writing/${days[i].e![0].s}`;
  };
  const onWheel = (e: WheelEvent) => {
    if (variant.wheel?.(field, e)) { e.preventDefault(); wake(); }
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && field.infoOpen) setInfo(false);
  };
  const onInfo = () => setInfo(!field.infoOpen);


  for (const type of ['pointermove', 'pointerdown', 'wheel', 'keydown', 'resize'] as const) addEventListener(type, poke, { passive: true });
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  infoButton?.addEventListener('click', onInfo);
  document.addEventListener('keydown', onKey);
  const ro = new ResizeObserver(resize);
  ro.observe(root);
  // Folding outliner nodes changes the panel's size; keep the hole around it.
  const panelObserver = new ResizeObserver(() => { if (field.infoOpen) { layout(); wake(); } });
  if (panel) panelObserver.observe(panel);
  const themeObserver = new MutationObserver(() => { colors = field.colors = readColors(); wake(); });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  document.documentElement.classList.add('has-field');
  introStart = performance.now();
  if (panel) panel.inert = true;
  applyTheme();
  colors = field.colors = readColors();
  resize();
  variant.enter?.(field);
  entered = true;
  // Variants that rasterize text need Inter; lay out again once fonts are in.
  document.fonts?.ready.then(() => { layout(); wake(); });

  return () => {
    cancelAnimationFrame(raf);
    variant.exit?.(field);
    ro.disconnect();
    panelObserver.disconnect();
    themeObserver.disconnect();
    window.removeEventListener('pointerup', onUp);
    document.removeEventListener('keydown', onKey);
    for (const type of ['pointermove', 'pointerdown', 'wheel', 'keydown', 'resize'] as const) removeEventListener(type, poke);
    infoButton?.removeEventListener('click', onInfo);
    if (savedTheme !== null) document.documentElement.dataset.theme = savedTheme;
    document.documentElement.classList.remove('info-open', 'has-field');
    root.remove();
  };
}
