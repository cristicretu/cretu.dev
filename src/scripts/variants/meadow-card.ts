/* The month card: opening a flower in the meadow pops a herbarium label up in the corner.
   The month's bunch is sketched onto it and strapped down; the label names the flower (and
   its latin), why it grew that way, a row of the month's days (press one to go there), what
   happened, and what the opened day was. Moving to another month slides the label over in
   the direction you travelled and re-sketches the bunch. */

import type { Field, Moment } from '../field-kit';
import { MONTHS } from '../field-kit';
import type { Organ, Sprig } from './sprigs';

/** What each species is called, and what it says about a month. */
const SPECIES: Record<string, { name: string; latin: string; flower: string; why: string }> = {
  lavender: { name: 'lavender', latin: 'lavandula angustifolia', flower: 'lavender floret', why: 'dense spikes, for a month that barely paused' },
  gyp: { name: "baby's breath", latin: 'gypsophila paniculata', flower: "spray of baby's breath", why: 'a cloud of tiny flowers, one for nearly every day' },
  yarrow: { name: 'yarrow', latin: 'achillea millefolium', flower: 'yarrow head', why: 'flat clusters, steady and many' },
  forget: { name: 'forget-me-not', latin: 'myosotis sylvatica', flower: 'forget-me-not', why: 'small, many and stubborn' },
  daisy: { name: 'oxeye daisy', latin: 'leucanthemum vulgare', flower: 'daisy', why: 'open faces, a good working rhythm' },
  cosmos: { name: 'cosmos', latin: 'cosmos bipinnatus', flower: 'cosmos', why: 'loose and bright, busy in bursts' },
  bell: { name: 'harebell', latin: 'campanula rotundifolia', flower: 'bell', why: 'a few bells, rung now and then' },
  tulip: { name: 'wild tulip', latin: 'tulipa sylvestris', flower: 'tulip', why: 'a handful of big days' },
  eucalyptus: { name: 'eucalyptus', latin: 'eucalyptus cinerea', flower: 'berry', why: 'mostly leaves: a month for resting or thinking' },
  fern: { name: 'fern', latin: 'polypodium vulgare', flower: 'berry', why: 'all leaf and little flower, a quiet one' },
};

const MONTH_NAMES = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

/** A soft spring with one small overshoot. */
const SPRING =
  'linear(0, 0.009, 0.035 2.1%, 0.141, 0.281 6.7%, 0.723 12.9%, 0.938 16.7%, 1.017, 1.077, 1.121, 1.149 24.3%, 1.159, 1.163, 1.161, 1.154 29.9%, 1.129 32.8%, 1.051 39.6%, 1.017 43.1%, 0.991, 0.977 51%, 0.974 53.8%, 0.975 57.1%, 0.997 69.8%, 1.003 76.9%, 1)';
const OUT = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

export type CardMonth = {
  key: string;
  /** the month's index on the sheet, counting from the first */
  m: number;
  first: number;
  len: number;
  h: number;
  sprig: Sprig;
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export class MonthCard {
  readonly el: HTMLElement;
  private sketch: HTMLCanvasElement;
  private body: HTMLElement;
  private raf = 0;
  private countRaf = 0;
  private current: { key: string; day: number; m: CardMonth } | null = null;
  /** a gust of wind through the sketch, set by hovering it */
  private gust = 0;
  private onKey: (e: KeyboardEvent) => void;

  constructor(private f: Field, private onPick: (day: number) => void) {
    const el = document.createElement('aside');
    el.className = 'month-card';
    el.setAttribute('role', 'dialog');
    el.hidden = true;
    el.innerHTML = `<button type="button" class="mc-close" aria-label="Close">×</button>
<canvas class="mc-sketch" aria-hidden="true"></canvas><div class="mc-body"></div>`;
    document.body.append(el);
    this.el = el;
    this.sketch = el.querySelector('canvas')!;
    this.body = el.querySelector('.mc-body')!;
    el.querySelector('.mc-close')!.addEventListener('click', () => this.close());
    this.sketch.addEventListener('pointerenter', () => { this.gust = 1; });
    // A day in the strip takes you to that flower.
    this.body.addEventListener('click', (e) => {
      const dot = (e.target as HTMLElement).closest<HTMLElement>('.mc-dot');
      if (dot) this.onPick(Number(dot.dataset.i));
    });
    // Escape closes the card and lets the camera carry on, flying back to where the dive began.
    this.onKey = (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    };
    document.addEventListener('keydown', this.onKey, true);
  }

  get isOpen() {
    return !this.el.hidden;
  }

  get openDay() {
    return this.current?.day ?? -1;
  }

  get openKey() {
    return this.current?.key ?? null;
  }

  open(m: CardMonth, day: number) {
    const { f } = this;
    const reduced = f.reduced;
    if (this.current?.key === m.key && this.current.day === day && this.isOpen) return;
    const prev = this.isOpen ? this.current : null;
    this.current = { key: m.key, day, m };
    const html = this.render(m, day);
    this.el.setAttribute('aria-label', `${MONTH_NAMES[f.cal.m[m.first]]} ${f.cal.y[m.first]}`);

    if (!prev) {
      // Pops up from the corner on a spring, tilted, and settles straight.
      this.el.getAnimations().forEach((a) => a.cancel());
      this.body.innerHTML = html;
      this.el.hidden = false;
      if (!reduced) {
        this.el.animate(
          [
            { opacity: 0, transform: 'translateY(28px) scale(0.92) rotate(-3deg)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 680, easing: SPRING },
        );
        this.rise(90);
      }
      this.count(null);
      this.draw(m, day, reduced ? 1 : 0, 900);
      return;
    }

    if (prev.key === m.key) {
      // Another flower on the same bunch: only the day line changes, and the strip and sketch
      // move their marks.
      const next = document.createElement('div');
      next.innerHTML = html;
      const oldDay = this.body.querySelector('.mc-day'), newDay = next.querySelector('.mc-day');
      if (oldDay && newDay) {
        oldDay.replaceWith(newDay);
        if (!reduced) newDay.animate([{ opacity: 0, transform: 'translateX(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: OUT });
      } else if (newDay) {
        this.body.querySelector('.mc-stats')?.after(newDay);
      }
      this.body.querySelectorAll<HTMLElement>('.mc-dot').forEach((d) => {
        const on = Number(d.dataset.i) === day;
        if (on && !d.classList.contains('on') && !reduced) d.animate([{ transform: 'scale(2.2)' }, { transform: 'none' }], { duration: 520, easing: SPRING });
        d.classList.toggle('on', on);
      });
      this.draw(m, day, 1, 0);
      return;
    }

    // A different month: the label slides over in the direction travelled across the sheet
    // (sideways for months, up or down for years) with a little wobble, and the bunch is
    // re-sketched quickly.
    const before = this.el.offsetHeight;
    const dy = f.cal.y[m.first] - f.cal.y[prev.m.first];
    const dx = f.cal.m[m.first] - f.cal.m[prev.m.first];
    const sx = dy ? 0 : Math.sign(dx) * 22, sy = dy ? Math.sign(dy) * 16 : 0;
    const old = this.counts();
    this.body.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    this.el.getAnimations().forEach((a) => a.cancel());
    this.body.innerHTML = html;
    this.body.scrollTop = 0;
    this.count(old);
    this.draw(m, day, reduced ? 1 : 0, 520);
    if (reduced) return;
    const after = this.el.offsetHeight;
    if (before !== after) this.el.animate([{ height: `${before}px` }, { height: `${after}px` }], { duration: 300, easing: OUT });
    this.el.animate([{ transform: `rotate(${sx + sy > 0 ? 0.9 : -0.9}deg)` }, { transform: 'none' }], { duration: 560, easing: SPRING });
    this.body.querySelectorAll<HTMLElement>(':scope > *').forEach((n, k) => {
      n.animate([{ opacity: 0, transform: `translate(${sx}px, ${sy}px)` }, { opacity: 1, transform: 'none' }], {
        duration: 420, delay: k * 22, easing: SPRING, fill: 'backwards',
      });
    });
  }

  close() {
    if (!this.isOpen) return;
    cancelAnimationFrame(this.raf);
    cancelAnimationFrame(this.countRaf);
    this.current = null;
    const done = () => { this.el.hidden = true; };
    if (this.f.reduced) return done();
    this.el.getAnimations().forEach((a) => a.cancel());
    // Drops away with a little tilt, like a label let go of.
    this.el.animate(
      [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(18px) rotate(2.5deg) scale(0.96)' }],
      { duration: 220, easing: 'cubic-bezier(0.5, 0, 0.75, 0)' },
    ).onfinish = () => { if (!this.current) done(); };
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    cancelAnimationFrame(this.countRaf);
    document.removeEventListener('keydown', this.onKey, true);
    this.el.remove();
  }

  /** Lines rise in one after another, and the day strip pops in dot by dot. */
  private rise(delay: number) {
    this.body.querySelectorAll<HTMLElement>(':scope > *').forEach((n, i) => {
      n.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], {
        duration: 560, delay: delay + i * 45, easing: SPRING, fill: 'backwards',
      });
    });
    this.body.querySelectorAll<HTMLElement>('.mc-dot').forEach((d, i) => {
      d.animate([{ transform: 'scale(0)' }, { transform: 'none' }], {
        duration: 480, delay: delay + 140 + i * 14, easing: SPRING, fill: 'backwards',
      });
    });
  }

  private counts() {
    return [...this.body.querySelectorAll<HTMLElement>('.mc-n')].map((n) => Number(n.dataset.n));
  }

  /** Numbers tick up to their value (from the previous card's, when switching). */
  private count(from: number[] | null) {
    cancelAnimationFrame(this.countRaf);
    if (this.f.reduced) return;
    const nodes = [...this.body.querySelectorAll<HTMLElement>('.mc-n')];
    const to = nodes.map((n) => Number(n.dataset.n));
    const start = to.map((_, k) => from?.[k] ?? 0);
    const t0 = performance.now(), DUR = from ? 420 : 760;
    const step = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / DUR)), e = 1 - (1 - p) ** 3;
      nodes.forEach((n, k) => { n.textContent = Math.round(start[k] + (to[k] - start[k]) * e).toLocaleString('en-US'); });
      if (p < 1) this.countRaf = requestAnimationFrame(step);
    };
    step(t0);
  }

  private render(m: CardMonth, day: number) {
    const { f } = this;
    const { days, cal } = f;
    const sp = SPECIES[m.sprig.species] ?? SPECIES.daisy;
    let active = 0, total = 0;
    const essays: { t: string; s: string; i: number }[] = [];
    const moments: { m: Moment; i: number }[] = [];
    const dots: string[] = [];
    for (let i = m.first; i < m.first + m.len; i++) {
      const d = days[i];
      if (d.l) active++;
      total += d.c ?? 0;
      d.e?.forEach((e) => essays.push({ ...e, i }));
      d.ev?.forEach((ev) => moments.push({ m: ev, i }));
      const cls = ['mc-dot', d.e || d.ev ? 'mark' : '', i === day ? 'on' : ''].filter(Boolean).join(' ');
      dots.push(`<button type="button" class="${cls}" style="--l:${d.l}" data-i="${i}" aria-label="${cal.dom[i]} ${MONTHS[cal.m[i]]}"></button>`);
    }
    const monthOnly = f.landmarks[m.key] ?? [];
    const note = f.notes[m.key];
    const isNow = m.first + m.len - 1 === f.n - 1;
    const label = `${MONTH_NAMES[cal.m[m.first]]} ${cal.y[m.first]}`;
    const dayShort = (i: number) => `${cal.dom[i]} ${MONTHS[cal.m[i]]}`;

    const items: string[] = [];
    for (const x of monthOnly) items.push(`<li>${x.h ? `<a href="${esc(x.h)}" target="_blank" rel="noopener">${esc(x.t)}</a>` : esc(x.t)}</li>`);
    for (const e of essays) items.push(`<li><a href="/writing/${esc(e.s)}">${esc(e.t)}</a><span>${dayShort(e.i)}</span></li>`);
    for (const x of moments) items.push(`<li>${x.m.h ? `<a href="${esc(x.m.h)}" target="_blank" rel="noopener">${esc(x.m.t)}</a>` : esc(x.m.t)}<span>${dayShort(x.i)}</span></li>`);

    const n = (v: number) => `<span class="mc-n" data-n="${v}">${v.toLocaleString('en-US')}</span>`;
    return `<p class="mc-kicker"><span class="mc-no">no. ${String(m.m + 1).padStart(2, '0')}</span>${label}${isNow ? ' · still growing' : ''}</p>
<h2 class="mc-title">${esc(sp.name)} <i>${esc(sp.latin)}</i></h2>
<p class="mc-why">${esc(sp.why)}</p>
<div class="mc-days" style="--n:${m.len}">${dots.join('')}</div>
<p class="mc-stats">${n(active)} of ${m.len} days in flower${total ? ` · ${n(total)} contributions` : ''}</p>
${day >= 0 ? `<p class="mc-day">${this.dayLine(m, day, sp)}</p>` : ''}
${note ? `<p class="mc-note">${esc(note)}</p>` : ''}
${items.length ? `<ul class="mc-list">${items.join('')}</ul>` : ''}`;
  }

  /** "a bell in full bloom · 15 aug: 3 contributions" */
  private dayLine(m: CardMonth, i: number, sp: { flower: string }) {
    const { f } = this, d = f.days[i];
    const o = m.sprig.organs.find((q) => q.i === i);
    const stage = Math.min(3, Math.max(0, d.l - 1));
    const what =
      o?.kind === 'bud' ? "today's bud, still closed"
      : o?.kind === 'hero' ? `the crowning ${sp.flower}`
      : o?.kind === 'leaf' ? 'a leaf'
      : stage === 0 ? 'a bud'
      : stage === 1 ? `an opening ${sp.flower}`
      : stage === 3 ? `a ${sp.flower} in full bloom`
      : `a ${sp.flower}`;
    const parts: string[] = [];
    if (d.e) parts.push(d.e.map((e) => `wrote “${esc(e.t)}”`).join(', '));
    if (d.ev) parts.push(d.ev.map((e) => esc(e.t)).join(', '));
    if (d.c) parts.push(`${d.c.toLocaleString('en-US')} contribution${d.c === 1 ? '' : 's'}`);
    if (!parts.length) parts.push('a quiet day');
    return `<span>${what}</span> · ${f.cal.dom[i]} ${MONTHS[f.cal.m[i]]}: ${parts.join(' · ')}`;
  }

  /** Sketch the bunch onto the label: every stroke grows from its start at once, fills and
      ink settle in, then a paper strap is pressed over the stems. Afterwards the bunch keeps
      swaying a little (more when hovered), and the opened day breathes. */
  private draw(m: CardMonth, day: number, from: number, DUR: number) {
    cancelAnimationFrame(this.raf);
    const c = this.sketch, ctx = c.getContext('2d')!;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const W = c.clientWidth || 120, H = c.clientHeight || 150;
    if (c.width !== Math.round(W * ratio)) { c.width = Math.round(W * ratio); c.height = Math.round(H * ratio); }
    const cs = getComputedStyle(document.documentElement);
    const ink = cs.getPropertyValue('--notion-ink').trim() || '#18181b';
    const bg = cs.getPropertyValue('--notion-surface').trim() || '#fff';
    const scale = Math.min((W * 0.86) / 140, (H * 0.86) / (m.h * 1.12));
    const organ: Organ | undefined = m.sprig.organs.find((q) => q.i === day);
    const reduced = this.f.reduced;
    const t0 = performance.now();
    const L = 260; // longer than any single stroke, in sprig units
    const strapY = -Math.min(m.h * 0.16, 22);
    let last = t0;
    const frame = (now: number) => {
      const dt = Math.min(Math.max(now - last, 0) / 1000, 0.05);
      last = now;
      const p = DUR ? Math.min(1, from + Math.max(0, now - t0) / DUR) : 1;
      const e = 1 - (1 - p) ** 3;
      this.gust = Math.max(0, this.gust - dt * 0.9);
      const sway = reduced ? 0 : Math.sin(now / 1300) * 0.018 + Math.sin(now / 170) * 0.05 * this.gust ** 2;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.translate(W / 2, H - 8);
      ctx.scale(scale, scale);
      ctx.save();
      ctx.rotate(sway);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 0.8 / scale;
      ctx.strokeStyle = ink;
      const stems = Math.min(1, e * 1.7), parts = Math.max(0, Math.min(1, e * 1.7 - 0.55));
      ctx.setLineDash(stems < 1 ? [stems * L, L] : []);
      ctx.stroke(m.sprig.stems);
      ctx.globalAlpha = Math.min(1, parts * 1.6);
      ctx.fillStyle = bg;
      ctx.fill(m.sprig.pens.fill);
      ctx.globalAlpha = 1;
      ctx.setLineDash(parts < 1 ? [parts * L * 0.5, L] : []);
      ctx.stroke(m.sprig.pens.line);
      ctx.globalAlpha = parts;
      ctx.fillStyle = ink;
      ctx.fill(m.sprig.pens.ink);
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
      if (organ && p >= 1) {
        // The opened day, inked heavier, with a slow breathing ring.
        ctx.lineWidth = 2 / scale;
        ctx.stroke(organ.pens.line);
        ctx.fill(organ.pens.ink);
        const phase = reduced ? 0.5 : ((now - t0) % 2200) / 2200;
        ctx.globalAlpha = (1 - phase) * 0.5;
        ctx.lineWidth = 1 / scale;
        ctx.beginPath();
        ctx.arc(organ.hx, organ.hy, (6 + phase * 14) / scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      // The paper strap, pressed down over the stems once they're drawn (it doesn't sway).
      const s = Math.max(0, Math.min(1, (e - 0.72) / 0.28));
      if (s > 0) {
        const pop = 1 + Math.sin(s * Math.PI) * 0.18;
        ctx.save();
        ctx.translate(0, strapY);
        ctx.rotate(-0.07);
        ctx.scale(pop * s, pop);
        ctx.globalAlpha = 0.9 * s;
        ctx.fillStyle = bg;
        ctx.fillRect(-15, -4, 30, 8);
        ctx.globalAlpha = 0.55 * s;
        ctx.lineWidth = 0.7 / scale;
        ctx.strokeStyle = ink;
        ctx.strokeRect(-15, -4, 30, 8);
        ctx.restore();
      }
      if (this.isOpen && (p < 1 || !reduced)) this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }
}
