"use client";

import { flushSync } from "react-dom";
import { getPrefs, setPrefs } from "./prefs";
import { STYLES, type StyleId } from "./styles";

type VTDocument = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
};

/** Make sure a style's fonts are downloaded (max ~600ms) so the reveal never shows fallback type. */
async function preloadFonts(id: StyleId) {
  const style = STYLES.find((s) => s.id === id);
  if (!style || !document.fonts) return;
  const load = Promise.all(style.fonts.map((f) => document.fonts.load(f).catch(() => null)));
  await Promise.race([load, new Promise((r) => setTimeout(r, 600))]);
}

/**
 * Switch the whole site to another style.
 * With View Transitions support: a circular reveal grows from `origin` (the click point).
 * Without it (or with reduced motion): a quick colour cross-fade.
 */
export async function switchStyle(id: StyleId, origin?: { x: number; y: number }) {
  if (getPrefs().style === id) return;
  await preloadFonts(id);

  const doc = document as VTDocument;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const apply = () => flushSync(() => setPrefs({ style: id }));

  if (!doc.startViewTransition || reduce) {
    const html = document.documentElement;
    html.classList.add("theme-anim");
    apply();
    window.setTimeout(() => html.classList.remove("theme-anim"), 500);
    window.dispatchEvent(new CustomEvent("solostack:style", { detail: id }));
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const vt = doc.startViewTransition(apply);
  try {
    await vt.ready;
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 700, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  } catch {
    /* transition skipped — the style is applied either way */
  }
  window.dispatchEvent(new CustomEvent("solostack:style", { detail: id }));
}

/** Center of an element, for starting the reveal there. */
export function originOf(el: Element | null) {
  if (!el) return undefined;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
