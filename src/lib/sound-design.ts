/* ================================================================
   SOUND DESIGN — Textile-inspired audio feedback

   Optional, off by default. Three levels: off, subtle, full.
   Uses Web Audio API with synthesized sounds that feel textile,
   not digital.
   ================================================================ */

export type SoundLevel = "off" | "subtle" | "full";

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/* ----------------------------------------------------------------
   FABRIC SNIP — Marking a step complete
   A soft, high-frequency click like scissors closing on fabric.
   ---------------------------------------------------------------- */

export function playSnip(level: SoundLevel = "subtle") {
  if (level === "off") return;
  const ctx = getContext();
  if (!ctx) return;

  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  // White noise burst (scissors snip)
  const bufferSize = ctx.sampleRate * 0.06;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    // Shaped noise — sharp attack, fast decay
    const env = Math.exp(-i / (bufferSize * 0.15));
    data[i] = (Math.random() * 2 - 1) * env;
  }

  // Filter to make it sound like fabric, not static
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 3000;
  filter.Q.value = 1.5;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);

  const vol = level === "full" ? 0.15 : 0.08;
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  source.start(ctx.currentTime);
  source.stop(ctx.currentTime + 0.08);
}

/* ----------------------------------------------------------------
   FABRIC RUSTLE — Step transitions
   A soft whooshing sound like turning fabric pages.
   ---------------------------------------------------------------- */

export function playRustle(level: SoundLevel = "subtle") {
  if (level === "off") return;
  const ctx = getContext();
  if (!ctx) return;

  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  // Filtered noise with slow envelope
  const duration = level === "full" ? 0.25 : 0.15;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    // Bell curve envelope
    const env = Math.sin(t * Math.PI) * 0.7;
    data[i] = (Math.random() * 2 - 1) * env;
  }

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1200;
  filter.Q.value = 0.5;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);

  const vol = level === "full" ? 0.1 : 0.05;
  gain.gain.setValueAtTime(vol, ctx.currentTime);

  source.start(ctx.currentTime);
  source.stop(ctx.currentTime + duration);
}

/* ----------------------------------------------------------------
   WARM CHIME — Section completion
   A gentle bell tone like a wind chime, warm and resonant.
   ---------------------------------------------------------------- */

export function playChime(level: SoundLevel = "subtle") {
  if (level === "off") return;
  const ctx = getContext();
  if (!ctx) return;

  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  // Two harmonious tones
  const frequencies = [523.25, 659.25]; // C5 + E5 = warm major third
  const duration = level === "full" ? 1.2 : 0.6;

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.connect(oscGain);
    oscGain.connect(gain);

    osc.frequency.value = freq;
    osc.type = "sine";

    const vol = level === "full" ? 0.08 : 0.04;
    oscGain.gain.setValueAtTime(vol * (i === 0 ? 1 : 0.6), ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.start(ctx.currentTime + i * 0.05);
    osc.stop(ctx.currentTime + duration);
  });
}

/* ----------------------------------------------------------------
   CELEBRATION SOUND — Pattern completion
   A cascade of gentle chimes ascending in pitch.
   ---------------------------------------------------------------- */

export function playCelebration(level: SoundLevel = "subtle") {
  if (level === "off") return;
  const ctx = getContext();
  if (!ctx) return;

  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  // Ascending pentatonic scale — feels joyful without being harsh
  const notes = [523.25, 587.33, 659.25, 783.99, 880]; // C5, D5, E5, G5, A5
  const duration = level === "full" ? 0.8 : 0.5;

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.connect(oscGain);
    oscGain.connect(gain);

    osc.frequency.value = freq;
    osc.type = "sine";

    const vol = level === "full" ? 0.06 : 0.03;
    const delay = i * 0.12;
    oscGain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
    oscGain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.02);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  });
}
