/* A thermal receipt for every day shipped. It prints out of a slot at the bottom of the page,
   one line per week (seven day dots and that week's commits), essays as line items, then the
   totals. It lands on the punchline (today, the total); scroll or drag to read back in time. */

import { type Field, type Variant, MONTHS, TAU } from '../field-kit';
import { clamp, easeInOut } from './c-util';

type Line =
  | { kind: 'title' | 'center' | 'faint'; text: string; h: number }
  | { kind: 'kv'; left: string; right: string; strong?: boolean; h: number }
  | { kind: 'rule' | 'double' | 'gap' | 'tear'; h: number }
  | { kind: 'week'; label: string; days: number[]; first: number; right: string; h: number }
  | { kind: 'essay'; text: string; h: number }
  | { kind: 'barcode'; h: number };

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
const PAPER = '#fcfcfa';
const INK = '#232325';
const PRINT_MS = 3600;

function build(f: Field) {
  const { n, days, cal } = f;
  const lines: Line[] = [];
  const add = (l: Line) => lines.push(l);
  const commits = days.reduce((a, d) => a + (d.c ?? 0), 0);
  const active = days.filter((d) => d.l).length;
  const essays = days.reduce((a, d) => a + (d.e?.length ?? 0), 0);

  add({ kind: 'gap', h: 18 });
  add({ kind: 'title', text: 'cretu.dev', h: 26 });
  add({ kind: 'faint', text: 'days shipped · itemized', h: 16 });
  add({ kind: 'gap', h: 10 });
  add({ kind: 'kv', left: 'opened', right: f.dateOf(0), h: 16 });
  add({ kind: 'kv', left: 'printed', right: f.dateOf(n - 1), h: 16 });
  add({ kind: 'rule', h: 18 });

  let month = -1;
  // Weeks start on monday; the first is partial.
  let i = 0;
  while (i < n) {
    const dow = (new Date(Date.UTC(cal.y[i], cal.m[i], cal.dom[i])).getUTCDay() + 6) % 7;
    const start = i - dow;
    const week: number[] = [];
    for (let k = 0; k < 7; k++) week.push(start + k);
    const inWeek = week.filter((d) => d >= 0 && d < n);
    if (cal.mi[inWeek[0]] !== month) {
      month = cal.mi[inWeek[0]];
      add({ kind: 'gap', h: 6 });
      add({ kind: 'faint', text: `— ${MONTHS[cal.m[inWeek[0]]]} ${cal.y[inWeek[0]]} —`, h: 18 });
    }
    const c = inWeek.reduce((a, d) => a + (days[d].c ?? 0), 0);
    const first = inWeek[0];
    add({
      kind: 'week',
      label: `${String(cal.dom[first]).padStart(2, '0')} ${MONTHS[cal.m[first]]}`,
      days: week,
      first,
      right: c ? String(c) : '·',
      h: 16,
    });
    for (const d of inWeek) for (const e of days[d].e ?? []) add({ kind: 'essay', text: e.t, h: 16 });
    i = start + 7;
  }

  add({ kind: 'rule', h: 18 });
  add({ kind: 'kv', left: 'days', right: n.toLocaleString('en-US'), h: 16 });
  add({ kind: 'kv', left: 'days with commits', right: active.toLocaleString('en-US'), h: 16 });
  add({ kind: 'kv', left: 'commits', right: commits.toLocaleString('en-US'), h: 16 });
  add({ kind: 'kv', left: 'essays', right: String(essays), h: 16 });
  add({ kind: 'double', h: 20 });
  add({ kind: 'kv', left: 'total', right: `${n.toLocaleString('en-US')} days`, strong: true, h: 22 });
  add({ kind: 'gap', h: 12 });
  add({ kind: 'center', text: `today · ${f.dateOf(n - 1)}`, h: 16 });
  add({ kind: 'gap', h: 10 });
  add({ kind: 'barcode', h: 44 });
  add({ kind: 'gap', h: 10 });
  add({ kind: 'center', text: 'thank you for visiting', h: 16 });
  add({ kind: 'faint', text: 'no refunds on time spent', h: 16 });
  add({ kind: 'gap', h: 26 });
  return lines;
}

export const receipt: Variant = {
  label: 'receipt',
  physics: true,
  lens: 0,
  layout(f) {
    const fr = f.frame;
    const lines: Line[] = f.state.lines ?? (f.state.lines = build(f));
    const total = lines.reduce((a, l) => a + l.h, 0);
    f.state.total = total;
    f.state.pw = Math.min(340, fr.w - 8);
    f.state.px = fr.left + (fr.w - f.state.pw) / 2;
    f.state.slot = fr.top + fr.h + 8;
    f.state.scroll ??= 0;
    f.state.scrollT ??= 0;
    f.state.start ??= performance.now();
    // Targets (only used for the first frame); positions are written every tick.
    for (let i = 0; i < f.n; i++) { f.tx[i] = f.state.px; f.ty[i] = f.state.slot + 2000; }
    return 10;
  },
  enter(f) {
    f.state.start = performance.now();
  },
  wheel(f, e) {
    f.state.scrollT -= e.deltaY;
    return true;
  },
  tick(f) {
    const st = f.state;
    if (!st.lines) return;
    const p = f.pointer;
    if (p?.down) st.scrollT += p.dy;
    const printed = f.reduced ? st.total : st.total * easeInOut(clamp((f.now - st.start) / PRINT_MS, 0, 1));
    st.printed = printed;
    const visible = st.slot - (f.frame.top + 16);
    st.scrollT = clamp(st.scrollT, 0, Math.max(0, printed - visible));
    st.scroll += (st.scrollT - st.scroll) * Math.min(f.dt * 12, 1);

    // Lay out lines from the slot upward: the newest line sits at the slot.
    const lines: Line[] = st.lines;
    const jitter = !f.reduced && printed < st.total ? Math.sin(f.now / 9) * 0.6 : 0;
    st.jitter = jitter;
    let top = st.slot - printed + st.scroll;
    st.paperTop = top;
    for (const l of lines) {
      if (l.kind === 'week') {
        const dx = 12, x0 = st.px + 18 + 54 + jitter;
        l.days.forEach((d, k) => {
          if (d < 0 || d >= f.n) return;
          f.x[d] = x0 + k * dx;
          f.y[d] = top + l.h / 2;
        });
      }
      top += l.h;
    }
  },
  hit(f, px, py) {
    const st = f.state;
    if (!st.lines || py > st.slot) return -1;
    let best = -1, bd = 36;
    for (let i = 0; i < f.n; i++) {
      const d = (f.x[i] - px) ** 2 + (f.y[i] - py) ** 2;
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  },
  draw(f) {
    const st = f.state;
    if (!st.lines) return;
    const { ctx, days, n } = f;
    const lines: Line[] = st.lines;
    const px = st.px + st.jitter, pw = st.pw, slot = st.slot;
    const top = st.paperTop as number;
    const bottom = slot;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, f.width, slot);
    ctx.clip();

    // Paper with a soft shadow and a torn top edge.
    const tooth = 6;
    const paper = new Path2D();
    paper.moveTo(px, bottom);
    paper.lineTo(px, top + tooth);
    for (let xx = px; xx < px + pw; xx += tooth * 2) {
      paper.lineTo(Math.min(xx + tooth, px + pw), top);
      paper.lineTo(Math.min(xx + tooth * 2, px + pw), top + tooth);
    }
    paper.lineTo(px + pw, bottom);
    paper.closePath();
    ctx.shadowColor = 'rgba(0,0,0,0.18)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = PAPER;
    ctx.fill(paper);
    ctx.shadowColor = 'transparent';
    // A faint curl: darker at the edges, like a strip that wants to roll back up.
    const curl = ctx.createLinearGradient(px, 0, px + pw, 0);
    curl.addColorStop(0, 'rgba(0,0,0,0.06)');
    curl.addColorStop(0.08, 'rgba(0,0,0,0)');
    curl.addColorStop(0.92, 'rgba(0,0,0,0)');
    curl.addColorStop(1, 'rgba(0,0,0,0.07)');
    ctx.fillStyle = curl;
    ctx.fill(paper);
    // Paper is darker where it comes out of the slot.
    const shade = ctx.createLinearGradient(0, bottom - 40, 0, bottom);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = shade;
    ctx.fillRect(px, bottom - 40, pw, 40);

    ctx.fillStyle = INK;
    ctx.strokeStyle = INK;
    ctx.textBaseline = 'middle';
    const L = px + 18, R = px + pw - 18;
    let y = top;
    for (const l of lines) {
      const mid = y + l.h / 2;
      if (mid > -20 && mid < bottom + 20) {
        switch (l.kind) {
          case 'title':
            ctx.font = `700 17px ${MONO}`;
            ctx.textAlign = 'center';
            ctx.fillText(l.text, px + pw / 2, mid);
            break;
          case 'center':
            ctx.font = `500 11px ${MONO}`;
            ctx.textAlign = 'center';
            ctx.fillText(l.text, px + pw / 2, mid);
            break;
          case 'faint':
            ctx.font = `400 11px ${MONO}`;
            ctx.textAlign = 'center';
            ctx.globalAlpha = 0.55;
            ctx.fillText(l.text, px + pw / 2, mid);
            ctx.globalAlpha = 1;
            break;
          case 'kv':
            ctx.font = `${l.strong ? 700 : 400} ${l.strong ? 14 : 11}px ${MONO}`;
            ctx.textAlign = 'left';
            ctx.fillText(l.left, L, mid);
            ctx.textAlign = 'right';
            ctx.fillText(l.right, R, mid);
            break;
          case 'rule':
          case 'double':
            ctx.globalAlpha = 0.6;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(L, Math.round(mid) + 0.5);
            ctx.lineTo(R, Math.round(mid) + 0.5);
            if (l.kind === 'double') {
              ctx.moveTo(L, Math.round(mid) + 3.5);
              ctx.lineTo(R, Math.round(mid) + 3.5);
            }
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
            break;
          case 'week': {
            ctx.font = `400 11px ${MONO}`;
            ctx.textAlign = 'left';
            ctx.globalAlpha = 0.7;
            ctx.fillText(l.label, L, mid);
            ctx.globalAlpha = 1;
            for (const d of l.days) {
              if (d < 0 || d >= n) continue;
              const dd = days[d], cx = f.x[d], cy = f.y[d];
              if (d === n - 1) {
                const ph = f.reduced ? 0.5 : (f.now % 2400) / 2400;
                ctx.beginPath();
                ctx.arc(cx, cy, 4, 0, TAU);
                ctx.fill();
                ctx.globalAlpha = (1 - ph) * 0.6;
                ctx.beginPath();
                ctx.arc(cx, cy, 4 + ph * 8, 0, TAU);
                ctx.stroke();
                ctx.globalAlpha = 1;
              } else if (dd.l) {
                ctx.globalAlpha = 0.3 + 0.175 * dd.l;
                ctx.beginPath();
                ctx.arc(cx, cy, 2.2 + 0.45 * dd.l, 0, TAU);
                ctx.fill();
                ctx.globalAlpha = 1;
              } else {
                ctx.globalAlpha = 0.35;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(cx, cy, 2.2, 0, TAU);
                ctx.stroke();
                ctx.globalAlpha = 1;
              }
              if (dd.e) {
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(cx, cy, 5.2, 0, TAU);
                ctx.stroke();
              }
              if (d === f.hovered) {
                // Same ring the engine draws, but in paper ink so it shows in dark mode too.
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(cx, cy, 6.2, 0, TAU);
                ctx.stroke();
              }
            }
            ctx.textAlign = 'right';
            ctx.fillText(l.right, R, mid);
            break;
          }
          case 'essay':
            ctx.font = `500 11px ${MONO}`;
            ctx.textAlign = 'left';
            {
              const text = `  ✎ ${l.text}`;
              const max = R - L - 46;
              let t = text;
              while (ctx.measureText(t).width > max && t.length > 4) t = t.slice(0, -2);
              ctx.fillText(t === text ? t : `${t.trimEnd()}…`, L, mid);
            }
            ctx.textAlign = 'right';
            ctx.fillText('essay', R, mid);
            break;
          case 'barcode': {
            let bx = L;
            let k = 0;
            while (bx < R) {
              const d = days[Math.floor((k * 7919) % n)];
              const w = 1 + (d.l % 3);
              if (k % 2 === 0) ctx.fillRect(bx, y + 4, w, l.h - 8);
              bx += w + 1;
              k++;
            }
            break;
          }
        }
      }
      y += l.h;
    }
    ctx.restore();

    // The printer's mouth.
    const sw = pw + 56, sx = px - 28;
    ctx.fillStyle = f.colors.ink;
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.roundRect(sx, slot - 2, sw, 9, 4.5);
    ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = f.colors.faint;
    ctx.font = `500 10px ${MONO}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.2em';
    ctx.fillText(st.printed < st.total ? 'printing…' : 'scroll to read back', sx + sw / 2, slot + 14);
    if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0px';
    ctx.globalAlpha = 1;
  },
};
