"use client";

import { useSyncExternalStore } from "react";
import { PREFS_KEY } from "./themeBoot";

// Site-wide visitor preferences: theme, sound, x-ray. Persisted per browser,
// shared across components (nav controls, terminal, stack builder) via a tiny store.

export const THEMES = [
  { id: "teal", name: "Teal", swatch: "#19e3c4" },
  { id: "navy", name: "Navy & Gold", swatch: "#f2b33a" },
  { id: "emerald", name: "Emerald", swatch: "#34d399" },
  { id: "ember", name: "Ember", swatch: "#ff7a45" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export type Prefs = { theme: ThemeId; sound: boolean; xray: boolean };

const DEFAULTS: Prefs = { theme: "teal", sound: false, xray: false };
const KEY = PREFS_KEY;

let state: Prefs = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Prefs>;
      state = {
        theme: THEMES.some((t) => t.id === p.theme) ? (p.theme as ThemeId) : DEFAULTS.theme,
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
  html.dataset.theme = state.theme;
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
    window.localStorage.setItem(KEY, JSON.stringify({ theme: state.theme, sound: state.sound }));
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
