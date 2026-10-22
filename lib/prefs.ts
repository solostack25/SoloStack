"use client";

import { useSyncExternalStore } from "react";
import { PREFS_KEY } from "./themeBoot";
import { STYLE_IDS, type StyleId } from "./styles";

// Site-wide visitor preferences: style, sound, x-ray. Persisted per browser,
// shared across components (nav controls, terminal, stack builder) via a tiny store.

export type Prefs = { style: StyleId; sound: boolean; xray: boolean };

const DEFAULTS: Prefs = { style: "stack", sound: false, xray: false };

let state: Prefs = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Prefs>;
      state = {
        style: STYLE_IDS.includes(p.style as StyleId) ? (p.style as StyleId) : DEFAULTS.style,
        sound: !!p.sound,
        xray: false, // x-ray never survives a reload; it's a party trick, not a setting
      };
    }
  } catch {
    /* storage blocked — defaults are fine */
  }
}

function apply() {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.dataset.style = state.style;
  html.classList.toggle("xray", state.xray);
}

export function getPrefs(): Prefs {
  load();
  return state;
}

export function setPrefs(patch: Partial<Prefs>) {
  load();
  state = { ...state, ...patch };
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify({ style: state.style, sound: state.sound }));
  } catch {
    /* ignore */
  }
  apply();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, getPrefs, () => DEFAULTS);
}
