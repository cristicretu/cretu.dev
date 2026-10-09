/* Meadow sound: tiny procedural sound effects for the meadow, synthesized with Web Audio.

   Nothing is sampled. Every sound is a few sine or triangle partials or a slice of a shared
   noise buffer, shaped by a soft envelope and a filter, panned by screen position, and sent a
   little into a shared synthetic "room" for air. Everything runs through a gentle EQ (no sub
   rumble, a dip where the ear is harshest), a compressor and a low master level, so bursts
   blend together instead of piling up. Tonal sounds use one A major pentatonic scale, so any
   overlap harmonizes, and every play jitters pitch, level, timbre and timing a touch so a
   hundred repetitions never sound like the same sample.

   Usage:

     const sound = createMeadowSound();
     sound.hover(pan, 'flower', day);   // pan is -1..1, from screen x
     sound.zoom(rate);                  // every frame; rate = d(ln z)/dt, > 0 zooming in
     sound.dispose();                   // on teardown

   API (all play calls are no-ops until audio is unlocked, while muted or disabled, and while
   the tab is hidden; all are safe to call at any rate, as each sound throttles itself):

   - leafFall(pan, size = 1)   a leaf snaps loose: a dry tick, then a soft fluttering whoosh.
   - leafLand(pan)             a barely-there papery tap as a leaf settles on the row.
   - brush(pan, speed, n = 3)  the pointer brushing through a bunch; speed in px/s, n stems.
   - hover(pan, kind, degree)  a new flower under the pointer; kind is 'flower' | 'hero' |
                               'leaf' | 'bud'; degree (e.g. the day of the month) picks the note.
   - zoom(rate)                continuous air tone that follows |rate|; silent at rest.
   - open() / close()          a month card opening (page flick + rising two-note chime) or
                               closing (softer flick, falling chime).
   - grow(pan, t)              intro sprout pop, pitch rising with t in 0..1.
   - unlock()                  create/resume the AudioContext; call from a user gesture. One-time
                               pointerdown / keydown / touchend / wheel listeners do this too.
   - muted (get/set), toggle() mute, persisted in localStorage; returns the new muted state.
   - setEnabled(on)            a non-persisted kill switch, e.g. while the meadow isn't shown.
   - dispose()                 remove listeners and close the context.

   Browsers only unlock audio on a real activation (click, tap, key), not on hover or wheel,
   so the meadow stays silent until the first click or key press. */

export type HoverKind = 'flower' | 'hero' | 'leaf' | 'bud';

export type MeadowSound = {
  leafFall(pan: number, size?: number): void;
  leafLand(pan: number): void;
  brush(pan: number, speed: number, n?: number): void;
  hover(pan: number, kind?: HoverKind, degree?: number): void;
  zoom(rate: number): void;
  open(): void;
  close(): void;
  grow(pan: number, t: number): void;
  unlock(): void;
  muted: boolean;
  toggle(): boolean;
  setEnabled(on: boolean): void;
  readonly enabled: boolean;
  dispose(): void;
};

const STORAGE_KEY = 'meadow-sound-muted';
/** Master level. Per-voice peaks are 0.01–0.05, so even a dozen overlaps stay well below 0 dBFS. */
const MASTER = 0.45;
/** A major pentatonic from A4, in semitones; every pair of notes in it is consonant. */
const SCALE = [0, 2, 4, 7, 9];
const ROOT = 440;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
/** Multiplies by a random amount within ±amt (0.1 is ±10%). */
const vary = (v: number, amt: number) => v * (1 + rnd(-amt, amt));
/** The frequency of scale step i (any integer; it wraps into octaves), with a few cents of drift. */
const note = (i: number, cents = 6) => {
  const oct = Math.floor(i / SCALE.length), deg = i - oct * SCALE.length;
  return ROOT * 2 ** ((12 * oct + SCALE[deg] + rnd(-cents, cents) / 100) / 12);
};

const readMuted = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};
const writeMuted = (m: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, m ? '1' : '0');
  } catch {
    /* Storage can be unavailable (private mode, blocked); muting still works for the visit. */
  }
};

/** Per-sound throttle: a cap on overlapping voices and a jittered minimum gap between starts. */
type Limit = { max: number; gap: number; next: number; ends: number[] };
const limit = (max: number, gap: number): Limit => ({ max, gap, next: 0, ends: [] });

/** One second-ish of air: a stereo decaying noise tail that darkens as it fades, like a small
    wooden room. Generated once. */
const roomImpulse = (ctx: BaseAudioContext) => {
  const sr = ctx.sampleRate, len = Math.floor(sr * 1.6), pre = Math.floor(sr * 0.012);
  const buf = ctx.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let lp = 0;
    for (let i = pre; i < len; i++) {
      const t = (i - pre) / sr;
      // A one-pole lowpass whose cutoff falls over the tail, so the air never hisses.
      const k = 0.55 * Math.exp(-t * 2.2) + 0.06;
      lp += k * (Math.random() * 2 - 1 - lp);
      d[i] = lp * Math.exp(-t / 0.38);
    }
  }
  return buf;
};

const noiseBuffer = (ctx: BaseAudioContext) => {
  const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
};

export function createMeadowSound(): MeadowSound {
  let ctx: AudioContext | null = null;
  let master: GainNode, bus: GainNode, roomIn: GainNode, noise: AudioBuffer;
  let windGain: GainNode, windBand: BiquadFilterNode, windTone: BiquadFilterNode;
  let muted = readMuted();
  let enabled = true;
  let hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
  let disposed = false;
  let windOn = false;
  let rateSmooth = 0;

  const L = {
    hover: limit(6, 0.03),
    leafFall: limit(4, 0.07),
    leafLand: limit(3, 0.09),
    brush: limit(3, 0.075),
    card: limit(2, 0.12),
    grow: limit(4, 0.075),
  };
  /** A global cap on simultaneous voices, on top of the per-sound ones. */
  const all = limit(20, 0);

  /** Claims a slot for a voice lasting dur seconds, or returns false if it should be skipped. */
  const take = (l: Limit, now: number, dur: number) => {
    l.ends = l.ends.filter((e) => e > now);
    all.ends = all.ends.filter((e) => e > now);
    if (now < l.next || l.ends.length >= l.max || all.ends.length >= all.max) return false;
    // A jittered gap keeps a steady stream of calls from turning into a steady rhythm.
    l.next = now + l.gap * rnd(0.8, 1.35);
    l.ends.push(now + dur);
    all.ends.push(now + dur);
    return true;
  };

  const build = () => {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const c = new AC({ latencyHint: 'interactive' });
    ctx = c;
    noise = noiseBuffer(c);

    // Voices sum into the bus, then: highpass (no rumble) → presence dip (no glare) →
    // compressor (overlaps glue instead of spiking) → master → out.
    bus = c.createGain();
    const hp = c.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 110;
    hp.Q.value = 0.6;
    const dip = c.createBiquadFilter();
    dip.type = 'peaking';
    dip.frequency.value = 3200;
    dip.Q.value = 0.8;
    dip.gain.value = -5;
    const shelf = c.createBiquadFilter();
    shelf.type = 'highshelf';
    shelf.frequency.value = 7000;
    shelf.gain.value = -6;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -26;
    comp.knee.value = 14;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.25;
    master = c.createGain();
    master.gain.value = muted || !enabled ? 0 : MASTER;
    bus.connect(hp).connect(dip).connect(shelf).connect(comp).connect(master).connect(c.destination);

    // The room: a short synthetic tail fed by per-voice sends, filtered so only body goes in.
    roomIn = c.createGain();
    const roomHp = c.createBiquadFilter();
    roomHp.type = 'highpass';
    roomHp.frequency.value = 260;
    const verb = c.createConvolver();
    verb.buffer = roomImpulse(c);
    const roomOut = c.createGain();
    roomOut.gain.value = 0.55;
    roomIn.connect(roomHp).connect(verb).connect(roomOut).connect(bus);

    // The wind for zooming: one looping noise source, built once and kept running at zero
    // level; zoom() only moves its filters and gain. A broad band gives the breath and a narrow
    // band an octave up gives it a faint pitch that can rise and fall.
    const src = c.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    windBand = c.createBiquadFilter();
    windBand.type = 'bandpass';
    windBand.frequency.value = 500;
    windBand.Q.value = 0.9;
    windTone = c.createBiquadFilter();
    windTone.type = 'bandpass';
    windTone.frequency.value = 1000;
    windTone.Q.value = 9;
    // Make-up gains, as for noiseIn below: the broad band to ~0.4 RMS, the whistle to ~0.15.
    const bandGain = c.createGain();
    bandGain.gain.value = 5;
    const toneGain = c.createGain();
    toneGain.gain.value = 4;
    windGain = c.createGain();
    windGain.gain.value = 0;
    src.connect(windBand).connect(bandGain).connect(windGain);
    src.connect(windTone).connect(toneGain).connect(windGain);
    const windSend = c.createGain();
    windSend.gain.value = 0.3;
    windGain.connect(bus);
    windGain.connect(windSend).connect(roomIn);
    src.start();
  };

  /** The context, if it's running and we're allowed to make sound; otherwise null. */
  const live = () => (ctx && ctx.state === 'running' && !muted && enabled && !hidden && !disposed ? ctx : null);

  /** A voice's output stage: a gain into a panner into the bus, plus a send to the room. The
      nodes disconnect themselves once the last source ends. */
  const voice = (c: AudioContext, pan: number, send: number) => {
    const out = c.createGain();
    const p = c.createStereoPanner();
    // Keep panning gentle; hard-left clicks are fatiguing on headphones.
    p.pan.value = clamp(pan, -1, 1) * 0.6;
    out.connect(p).connect(bus);
    const s = c.createGain();
    s.gain.value = send;
    out.connect(s).connect(roomIn);
    const nodes: AudioNode[] = [out, p, s];
    let pending = 0;
    const own = <T extends AudioScheduledSourceNode>(src: T, start: number, stop: number) => {
      nodes.push(src);
      pending++;
      src.onended = () => {
        if (--pending === 0) for (const n of nodes) n.disconnect();
      };
      // Buffer sources start at a random point in the noise, so no two slices are the same.
      if (src instanceof AudioBufferSourceNode) src.start(start, rnd(0, 0.7));
      else src.start(start);
      src.stop(stop);
      return src;
    };
    return { out, nodes, own };
  };
  type Voice = ReturnType<typeof voice>;

  /** A plucked envelope: a few-millisecond rise, then an exponential fall with time constant tau. */
  const pluck = (g: AudioParam, t: number, peak: number, attack: number, tau: number) => {
    g.setValueAtTime(0, t);
    g.linearRampToValueAtTime(peak, t + attack);
    g.setTargetAtTime(0, t + attack, tau);
  };

  /** A sine (or other) partial with a pluck envelope; returns when it's inaudible. */
  const partial = (c: AudioContext, v: Voice, freq: number, t: number, peak: number, tau: number, type: OscillatorType = 'sine', attack = 0.003) => {
    const o = c.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = c.createGain();
    pluck(g.gain, t, peak, attack, tau);
    o.connect(g).connect(v.out);
    v.nodes.push(g);
    const end = t + attack + tau * 7;
    v.own(o, t, end);
    return { o, g, end };
  };

  /** A slice of filtered noise from a random point in the shared buffer, through one filter
      into a gain (starting silent) that the caller shapes. A narrow band of white noise is far
      quieter than the full band, so a fixed make-up gain brings every filtered slice to roughly
      0.5 RMS; that way a noise voice's envelope peak means about what a sine's does. */
  const noiseIn = (c: AudioContext, v: Voice, t: number, dur: number, type: BiquadFilterType, freq: number, q: number) => {
    const src = c.createBufferSource();
    src.buffer = noise;
    src.playbackRate.value = rnd(0.9, 1.1);
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const bw = type === 'bandpass' ? freq / q : freq;
    const makeup = c.createGain();
    makeup.gain.value = clamp(0.5 / (0.577 * Math.sqrt(bw / (c.sampleRate / 2))), 1, 10);
    const g = c.createGain();
    g.gain.value = 0;
    src.connect(f).connect(makeup).connect(g).connect(v.out);
    v.nodes.push(f, makeup, g);
    v.own(src, t, t + dur);
    return { src, f, g };
  };

  /* ---------- Sounds ---------- */

  const hover = (pan: number, kind: HoverKind = 'flower', degree = 0) => {
    const c = live();
    if (!c) return;
    const now = c.currentTime;
    if (!take(L.hover, now, kind === 'hero' ? 1.4 : 0.6)) return;
    const t = now + rnd(0, 0.006);
    // Neighbouring days are neighbouring scale steps, so sweeping along a bunch plays a
    // little run. Ten steps span A4–F#6.
    const i = ((Math.round(degree) % 10) + 10) % 10;
    const f = note(i);

    if (kind === 'leaf') {
      // Wooden and papery: a dark triangle "tock" an octave down, through a lowpass that
      // closes as it rings, with a dry tap of noise on top.
      const v = voice(c, pan, 0.12);
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 2.5;
      lp.frequency.setValueAtTime(vary(1900, 0.15), t);
      lp.frequency.setTargetAtTime(500, t, 0.03);
      lp.connect(v.out);
      v.nodes.push(lp);
      const o = c.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(f * 0.5 * 1.04, t);
      o.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.02);
      const g = c.createGain();
      pluck(g.gain, t, vary(0.03, 0.15), 0.002, vary(0.045, 0.2));
      o.connect(g).connect(lp);
      v.nodes.push(g);
      v.own(o, t, t + 0.4);
      const n = noiseIn(c, v, t, 0.06, 'bandpass', vary(1300, 0.2), 1.4);
      pluck(n.g.gain, t, vary(0.012, 0.25), 0.001, 0.008);
      return;
    }

    if (kind === 'bud') {
      // A closed bud: a short, soft "tip" with barely any ring.
      const v = voice(c, pan, 0.18);
      partial(c, v, f, t, vary(0.022, 0.15), vary(0.06, 0.15));
      partial(c, v, f * 2.005, t, vary(0.004, 0.2), 0.025);
      return;
    }

    // Flower and hero: a small glass/kalimba tink. A pure fundamental that rings, an octave
    // that fades sooner, a quiet inharmonic glint that's gone in a few tens of milliseconds,
    // and a whisper of mallet noise for the strike.
    const hero = kind === 'hero';
    const v = voice(c, pan, hero ? 0.38 : 0.22);
    const ring = hero ? vary(0.42, 0.1) : vary(0.2, 0.15);
    partial(c, v, f, t, vary(hero ? 0.04 : 0.032, 0.12), ring);
    partial(c, v, f * 2.002, t, vary(0.008, 0.25), ring * 0.4);
    partial(c, v, f * rnd(2.72, 2.8), t, vary(0.003, 0.3), 0.03);
    const m = noiseIn(c, v, t, 0.03, 'lowpass', 2400, 0.5);
    pluck(m.g.gain, t, vary(0.006, 0.3), 0.001, 0.004);
    if (hero) {
      // Essays bloom a little richer: a soft octave below for warmth and a second note two
      // scale steps up, struck just after, like a tiny arpeggio.
      partial(c, v, f * 0.5, t, 0.012, ring * 1.2, 'sine', 0.012);
      const t2 = t + rnd(0.065, 0.085);
      partial(c, v, note(i + 2), t2, vary(0.022, 0.12), ring * 0.9);
      partial(c, v, note(i + 2) * 2.002, t2, 0.004, ring * 0.35);
    }
  };

  const leafFall = (pan: number, size = 1) => {
    const c = live();
    if (!c) return;
    const now = c.currentTime;
    const s = clamp(size, 0.3, 1.6);
    const dur = vary(0.8, 0.2) * (0.7 + 0.3 * s);
    if (!take(L.leafFall, now, dur)) return;
    const t = now + rnd(0, 0.01);
    const v = voice(c, pan, 0.25);

    // The snap: a pinch of bandpassed noise plus a tiny falling blip, both a few ms long.
    const tick = noiseIn(c, v, t, 0.04, 'bandpass', vary(1500, 0.15), 3.5);
    pluck(tick.g.gain, t, vary(0.022, 0.2), 0.0008, 0.006);
    const o = c.createOscillator();
    o.frequency.setValueAtTime(vary(1300, 0.1) / Math.sqrt(s), t);
    o.frequency.exponentialRampToValueAtTime(500, t + 0.02);
    const og = c.createGain();
    pluck(og.gain, t, vary(0.012, 0.2), 0.001, 0.007);
    o.connect(og).connect(v.out);
    v.nodes.push(og);
    v.own(o, t, t + 0.06);

    // The flutter: airy noise through a bandpass that drifts down as the leaf falls, with a
    // slow wobble on both its centre and its level, like a leaf side-slipping through air.
    const w0 = t + rnd(0.02, 0.05);
    const w = noiseIn(c, v, w0, dur + 0.1, 'bandpass', 900, 1.1);
    w.f.frequency.setValueAtTime(vary(950, 0.15) / Math.sqrt(s), w0);
    w.f.frequency.exponentialRampToValueAtTime(vary(420, 0.15), w0 + dur);
    const peak = vary(0.02, 0.2) * Math.sqrt(s);
    w.g.gain.setValueAtTime(0, w0);
    w.g.gain.linearRampToValueAtTime(peak, w0 + dur * 0.25);
    w.g.gain.setTargetAtTime(0, w0 + dur * 0.45, dur * 0.18);
    const lfo = c.createOscillator();
    lfo.frequency.value = rnd(5, 9);
    const fDepth = c.createGain();
    fDepth.gain.value = rnd(120, 220);
    lfo.connect(fDepth).connect(w.f.frequency);
    // Amplitude flutter: a second gain stage whose level swings around 0.65 ± 0.35.
    const trem = c.createGain();
    trem.gain.value = 0.65;
    const aDepth = c.createGain();
    aDepth.gain.value = 0.35;
    lfo.connect(aDepth).connect(trem.gain);
    w.g.disconnect();
    w.g.connect(trem).connect(v.out);
    v.nodes.push(fDepth, trem, aDepth);
    v.own(lfo, w0, w0 + dur + 0.1);
  };

  const leafLand = (pan: number) => {
    const c = live();
    if (!c) return;
    const now = c.currentTime;
    if (!take(L.leafLand, now, 0.15)) return;
    const t = now + rnd(0, 0.012);
    const v = voice(c, pan, 0.1);
    // Paper on paper: a short, soft band of noise with a slightly duller second contact.
    const a = noiseIn(c, v, t, 0.12, 'bandpass', vary(950, 0.2), 0.9);
    pluck(a.g.gain, t, vary(0.012, 0.25), 0.002, vary(0.012, 0.2));
    const t2 = t + rnd(0.018, 0.04);
    const b = noiseIn(c, v, t2, 0.1, 'bandpass', vary(650, 0.2), 1.2);
    pluck(b.g.gain, t2, vary(0.006, 0.3), 0.002, 0.01);
  };

  const brush = (pan: number, speed: number, n = 3) => {
    const c = live();
    if (!c) return;
    // Slow drifts across a bunch stay silent; the rustle grows with speed and eases off.
    const k = clamp((speed - 60) / 1400, 0, 1) ** 0.7;
    if (k <= 0) return;
    const now = c.currentTime;
    const dur = vary(0.16 + 0.08 * k, 0.2);
    if (!take(L.brush, now, dur + 0.05)) return;
    const t = now + rnd(0, 0.015);
    const v = voice(c, pan, 0.15);

    // Dry grass and paper: one slice of noise through a band that brightens with speed, with
    // a crackly envelope of tiny random contacts, one or two per stem, over a soft swell.
    const r = noiseIn(c, v, t, dur + 0.2, 'bandpass', vary(900 + 900 * k, 0.15), 0.9 + 0.6 * k);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2600;
    r.g.disconnect();
    r.g.connect(lp).connect(v.out);
    v.nodes.push(lp);
    const peak = 0.006 + 0.026 * k;
    const g = r.g.gain;
    g.setValueAtTime(0, t);
    const hits = clamp(Math.round(n * rnd(1, 1.8)), 2, 9);
    let at = t;
    for (let h = 0; h < hits; h++) {
      at = Math.max(at + 0.02, t + (dur * (h + rnd(0.1, 0.9))) / hits);
      // Each contact is a 4 ms rise and a 14 ms fall over a soft sine-shaped swell, which
      // keeps it crisp but airy.
      const env = 0.3 + 0.7 * Math.sin(Math.PI * clamp((at - t) / dur, 0, 1));
      const base = peak * env * 0.25;
      g.linearRampToValueAtTime(base, at - 0.004);
      g.linearRampToValueAtTime(peak * env * rnd(0.6, 1), at);
      g.linearRampToValueAtTime(base, at + 0.014);
    }
    g.setTargetAtTime(0, at + 0.014, 0.025);
  };

  /** Two struck notes; shared by open and close. */
  const chime = (c: AudioContext, v: Voice, a: number, b: number, t: number, peak: number) => {
    partial(c, v, note(a), t, vary(peak, 0.1), 0.32);
    partial(c, v, note(a) * 2.002, t, peak * 0.18, 0.12);
    const t2 = t + rnd(0.085, 0.1);
    partial(c, v, note(b), t2, vary(peak * 0.85, 0.1), 0.42);
    partial(c, v, note(b) * 2.002, t2, peak * 0.15, 0.14);
  };

  /** A page flick: a short noise sweep with two quick humps, like a sheet's edge catching. */
  const flick = (c: AudioContext, v: Voice, t: number, from: number, to: number, peak: number) => {
    const p = noiseIn(c, v, t, 0.3, 'bandpass', from, 1.3);
    p.f.frequency.setValueAtTime(from, t);
    p.f.frequency.exponentialRampToValueAtTime(to, t + 0.17);
    const g = p.g.gain;
    g.setValueAtTime(0, t);
    g.linearRampToValueAtTime(peak * 0.6, t + 0.03);
    g.linearRampToValueAtTime(peak * 0.3, t + 0.07);
    g.linearRampToValueAtTime(peak, t + 0.11);
    g.setTargetAtTime(0, t + 0.12, 0.035);
  };

  // Rising pairs of scale steps for opening; close plays one of them back down.
  const PAIRS: [number, number][] = [[3, 5], [2, 5], [5, 7], [4, 6]];

  const open = () => {
    const c = live();
    if (!c) return;
    const now = c.currentTime;
    if (!take(L.card, now, 1.6)) return;
    const v = voice(c, 0, 0.4);
    flick(c, v, now, vary(650, 0.1), vary(1500, 0.1), 0.03);
    const [a, b] = PAIRS[Math.floor(Math.random() * PAIRS.length)];
    chime(c, v, a, b, now + 0.08, 0.026);
  };

  const close = () => {
    const c = live();
    if (!c) return;
    const now = c.currentTime;
    if (!take(L.card, now, 1.4)) return;
    const v = voice(c, 0, 0.35);
    flick(c, v, now, vary(1300, 0.1), vary(600, 0.1), 0.02);
    const [a, b] = PAIRS[Math.floor(Math.random() * PAIRS.length)];
    chime(c, v, b, a, now + 0.05, 0.016);
  };

  const grow = (pan: number, t: number) => {
    const c = live();
    if (!c) return;
    const now = c.currentTime;
    if (!take(L.grow, now, 0.35)) return;
    const at = now + rnd(0, 0.01);
    // Eight steps from A3 up to E5 across the intro, with a little wander.
    const i = clamp(Math.round(clamp(t, 0, 1) * 7 + rnd(-0.6, 0.6)), 0, 8) - 5;
    const f = note(i);
    const v = voice(c, pan, 0.2);
    // A sprout pop: a sine that drops a fifth into its note in 30 ms, dulled by a lowpass.
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1800;
    lp.connect(v.out);
    v.nodes.push(lp);
    const o = c.createOscillator();
    o.frequency.setValueAtTime(f * 1.5, at);
    o.frequency.exponentialRampToValueAtTime(f, at + 0.03);
    const g = c.createGain();
    pluck(g.gain, at, vary(0.018, 0.15), 0.004, vary(0.07, 0.15));
    o.connect(g).connect(lp);
    v.nodes.push(g);
    v.own(o, at, at + 0.6);
  };

  const zoom = (rate: number) => {
    if (!ctx || (!windOn && rate === 0)) return;
    const c = live();
    const now = ctx.currentTime;
    // A light smoothing on top of the audio-rate ramps, so a jittery wheel doesn't flutter.
    rateSmooth += (clamp(rate, -8, 8) - rateSmooth) * 0.35;
    const a = Math.abs(rateSmooth);
    const k = c ? clamp((a - 0.05) / 3, 0, 1) : 0;
    const level = 0.03 * k ** 1.3;
    const g = windGain.gain;
    g.cancelScheduledValues(now);
    g.setTargetAtTime(level, now, level > g.value ? 0.06 : 0.12);
    // If the calls stop (the loop idles), the wind fades out on its own rather than hanging.
    g.setTargetAtTime(0, now + 0.15, 0.2);
    // Brighter and a touch higher when diving in; darker and lower when pulling out.
    const dir = clamp(rateSmooth / 3, -1, 1);
    const centre = 520 * 2 ** (0.5 * dir) * (1 + 0.6 * k);
    windBand.frequency.setTargetAtTime(centre, now, 0.08);
    windTone.frequency.setTargetAtTime(centre * 2, now, 0.08);
    windOn = k > 0 || g.value > 0.0005;
    if (!windOn) rateSmooth = 0;
  };

  /* ---------- Lifecycle ---------- */

  const applyLevel = () => {
    if (!ctx) return;
    const on = !muted && enabled;
    master.gain.setTargetAtTime(on ? MASTER : 0, ctx.currentTime, 0.04);
  };

  const gestures = ['pointerdown', 'keydown', 'touchend', 'wheel'] as const;
  const onGesture = () => unlock();
  const listen = (on: boolean) => {
    if (typeof window === 'undefined') return;
    for (const e of gestures) {
      if (on) window.addEventListener(e, onGesture, { capture: true, passive: true });
      else window.removeEventListener(e, onGesture, { capture: true });
    }
  };

  function unlock() {
    if (disposed || typeof window === 'undefined') return;
    if (!ctx) build();
    const c = ctx;
    if (!c) return;
    if (c.state === 'running') return listen(false);
    if (hidden) return;
    // Resume only succeeds on a real activation; on wheel it may stay pending, and the next
    // click or key press tries again. Listeners come off once it's actually running.
    c.resume().then(
      () => {
        if (c.state === 'running') listen(false);
      },
      () => {},
    );
  }

  const onVisibility = () => {
    hidden = document.visibilityState === 'hidden';
    if (!ctx || ctx.state === 'closed') return;
    if (hidden) {
      windGain.gain.cancelScheduledValues(ctx.currentTime);
      windGain.gain.setValueAtTime(0, ctx.currentTime);
      windOn = false;
      rateSmooth = 0;
      void ctx.suspend();
    } else {
      void ctx.resume().catch(() => {});
    }
  };

  listen(true);
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility);

  return {
    leafFall,
    leafLand,
    brush,
    hover,
    zoom,
    open,
    close,
    grow,
    unlock,
    get muted() {
      return muted;
    },
    set muted(m: boolean) {
      muted = m;
      writeMuted(m);
      applyLevel();
    },
    toggle() {
      this.muted = !muted;
      return muted;
    },
    setEnabled(on: boolean) {
      enabled = on;
      applyLevel();
    },
    get enabled() {
      return enabled;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      listen(false);
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility);
      if (ctx && ctx.state !== 'closed') void ctx.close().catch(() => {});
      ctx = null;
    },
  };
}
