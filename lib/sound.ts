"use client";

import { getPrefs } from "./prefs";

// All sounds are synthesized with Web Audio — no audio files to download.

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!getPrefs().sound) return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function noiseBuffer(c: AudioContext) {
  if (noise) return noise;
  noise = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noise;
}

function env(c: AudioContext, peak: number, attack: number, decay: number) {
  const g = c.createGain();
  const t = c.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  g.connect(c.destination);
  return g;
}

/** UI tick — buttons, toggles. */
export function click(pitch = 1) {
  const c = audio();
  if (!c) return;
  const o = c.createOscillator();
  o.type = "square";
  o.frequency.setValueAtTime(1400 * pitch, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(700 * pitch, c.currentTime + 0.04);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 3000;
  o.connect(f).connect(env(c, 0.05, 0.002, 0.05));
  o.start();
  o.stop(c.currentTime + 0.08);
}

/** A block landing. `strength` 0..1 scales the weight of the hit. */
export function thud(strength = 0.6) {
  const c = audio();
  if (!c) return;
  const s = Math.min(1, Math.max(0.15, strength));
  // body: a falling sine
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(150 + 40 * s, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(48, c.currentTime + 0.16);
  o.connect(env(c, 0.32 * s, 0.003, 0.2));
  o.start();
  o.stop(c.currentTime + 0.25);
  // knock: a filtered noise burst
  const n = c.createBufferSource();
  n.buffer = noiseBuffer(c);
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 900;
  f.Q.value = 1.2;
  n.connect(f).connect(env(c, 0.12 * s, 0.001, 0.06));
  n.start();
  n.stop(c.currentTime + 0.1);
}

/** Something sliding out or flying away. */
export function whoosh(up = false) {
  const c = audio();
  if (!c) return;
  const n = c.createBufferSource();
  n.buffer = noiseBuffer(c);
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 2;
  const t = c.currentTime;
  f.frequency.setValueAtTime(up ? 400 : 1800, t);
  f.frequency.exponentialRampToValueAtTime(up ? 2400 : 300, t + 0.28);
  n.connect(f).connect(env(c, 0.16, 0.04, 0.26));
  n.start();
  n.stop(t + 0.34);
}

/** Little reward arpeggio — closing a ticket, finishing a stack. */
export function chime() {
  const c = audio();
  if (!c) return;
  [660, 880, 1320].forEach((freq, i) => {
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.value = freq;
    const g = c.createGain();
    const t = c.currentTime + i * 0.07;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.32);
  });
}

/** Terminal keystroke. */
export function key() {
  const c = audio();
  if (!c) return;
  const n = c.createBufferSource();
  n.buffer = noiseBuffer(c);
  const f = c.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = 2500 + Math.random() * 1500;
  n.connect(f).connect(env(c, 0.03, 0.001, 0.025));
  n.start();
  n.stop(c.currentTime + 0.04);
}

/** Call after enabling sound so the context is unlocked inside the user gesture. */
export function unlock() {
  audio();
}
