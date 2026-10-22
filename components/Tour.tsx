"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { getPrefs, setPrefs } from "@/lib/prefs";
import { STYLES } from "@/lib/styles";
import { switchStyle, originOf } from "@/lib/switchStyle";
import { click, whoosh } from "@/lib/sound";

// ─────────────────────────────────────────────────────────────────────────────
// Guided tour: spotlight + arrow callouts that walk a first-time visitor through
// what they can play with. One tour per page, auto-starts once per page per
// browser, replayable from the "?" button in the nav or `tour` in the terminal.
// ─────────────────────────────────────────────────────────────────────────────

type Step = {
  /** CSS selector of the thing to point at. Omit for a centered card. */
  target?: string;
  title: string;
  body: string;
  /** Optional "Show me" button that performs the feature. */
  action?: { label: string; run: () => void };
};

const stackEvent = (action: string, ids?: string[]) =>
  window.dispatchEvent(new CustomEvent("solostack:stack", { detail: { action, ids } }));

const nextStyle = () => {
  const i = STYLES.findIndex((s) => s.id === getPrefs().style);
  return STYLES[(i + 1) % STYLES.length];
};

/** Press the arrow key on a helpdesk card a few times (uses the board's own keyboard controls). */
const nudgeTicket = (times: number) => {
  const card = document.querySelector<HTMLElement>('[data-col="new"] [data-card]') ??
    document.querySelector<HTMLElement>('[data-col="doing"] [data-card]');
  if (!card) return;
  const id = card.dataset.card;
  let n = 0;
  const step = () => {
    const el = document.querySelector<HTMLElement>(`[data-card="${id}"]`);
    if (!el || n++ >= times) return;
    el.focus({ preventScroll: true });
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    setTimeout(step, 420);
  };
  step();
};

const TOURS: Record<string, Step[]> = {
  "/": [
    {
      title: "This site is the demo.",
      body: "Everything here is something we can build for you — and most of it is playable. Want a 60-second tour of the fun parts?",
    },
    {
      target: '[data-tour="style"]',
      title: "Switch the whole design",
      body: "One codebase, five complete design languages — type, shapes, color, motion. Tap here any time to switch.",
      action: {
        label: "Show me",
        run: () => {
          const s = nextStyle();
          void switchStyle(s.id, originOf(document.querySelector('[data-tour="style"]')));
        },
      },
    },
    {
      target: ".showcase-grid",
      title: "…or pick from live previews",
      body: "Each card is drawn in its own style. Click one and the entire site rebuilds itself around it.",
    },
    {
      target: ".story-stage",
      title: "Scroll to fix the mess",
      body: "Keep scrolling through this section: spreadsheets, SharePoint lists and reply-all threads reassemble into one clean portal.",
    },
    {
      target: '[data-tour="stack-link"]',
      title: "Build your stack",
      body: "Our nonprofit staff portal, split into 18 modules you stack like blocks — with real physics. Pull one out and watch what topples.",
    },
    {
      target: '[data-tour="helpdesk-link"]',
      title: "Play with a real module",
      body: "Drag tickets around the actual helpdesk board from the portal. Close them to score points and level up.",
    },
    {
      target: '[data-tour="terminal"]',
      title: "There's a terminal",
      body: "Press ~ anywhere (or tap here). Try help, style brutal, or stack preset masjid.",
      action: { label: "Open it", run: () => window.dispatchEvent(new Event("solostack:terminal")) },
    },
    {
      target: '[data-tour="xray"]',
      title: "X-ray the page",
      body: "See how the page is built: every component outlined, plus live speed numbers measured in your browser.",
      action: { label: "Turn it on", run: () => setPrefs({ xray: !getPrefs().xray }) },
    },
    {
      target: '[data-tour="sound"]',
      title: "Sound, if you like",
      body: "Clicks, thuds and whooshes — all synthesized in the browser, no audio files. Off by default.",
    },
    {
      target: '[data-tour="help"]',
      title: "That's the tour",
      body: "Replay it any time from here. When you're ready, a free 30-minute consult is one click away.",
    },
  ],
  "/stack": [
    {
      title: "Build your stack",
      body: "This is our nonprofit staff portal broken into modules. Stack what your organization needs on a foundation you own. Quick tour?",
    },
    {
      target: ".presets",
      title: "Start from a preset",
      body: "Food pantry, masjid, fundraising, back office — each drops a ready-made stack onto the tower.",
      action: { label: "Drop one in", run: () => stackEvent("set", ["crm", "campaigns", "fundraisers", "intake", "exec"]) },
    },
    {
      target: ".lib .lib-card",
      title: "Or add modules one by one",
      body: "Tap + Add or drag a card onto the tower. If a module needs another one, we stack that first automatically.",
      action: { label: "Add Donor Calling", run: () => stackEvent("add", ["calling"]) },
    },
    {
      target: ".phys-zone, .tower-zone",
      title: "Pull a block, Jenga-style",
      body: "Hit × on any block to slide it out. Everything above drops into place — and anything that depended on it topples off.",
    },
    {
      target: ".bands",
      title: "Pick your size",
      body: "Pricing scales by staff count. Monthly per module, or buy it outright — your code, your database.",
    },
    {
      target: ".share-row",
      title: "Share your stack",
      body: "Save a picture of your tower or copy a link. Shared links even show your stack in the preview card.",
    },
  ],
  "/demo/helpdesk": [
    {
      title: "Go on, close a ticket",
      body: "This is the real helpdesk board from our staff portal, running on demo data in your browser. Here's how to play.",
    },
    {
      target: '[data-col="new"] [data-card]',
      title: "Drag tickets between columns",
      body: "Grab a card and drop it in another column — or focus it and use the ← → keys. The → button works too.",
      action: { label: "Move it for me", run: () => nudgeTicket(1) },
    },
    {
      target: '[data-col="done"]',
      title: "Close tickets to score",
      body: "Every ticket you drop in Done earns points by priority. Urgent ones are worth the most.",
      action: { label: "Close one", run: () => nudgeTicket(3) },
    },
    {
      target: ".hd-quest",
      title: "Level up",
      body: "Quest mode keeps score and ranks you against the team. Turn it off for the plain, all-business board.",
    },
    {
      target: ".hd-new",
      title: "Make your own",
      body: "Create a ticket and watch it land live. A few more will trickle in on their own while you play.",
    },
  ],
};

const SEEN_KEY = "solostack:tour-seen";
const seenList = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || "[]");
  } catch {
    return [];
  }
};
const markSeen = (path: string) => {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...new Set([...seenList(), path])]));
  } catch {
    /* ignore */
  }
};

const visible = (sel?: string) => {
  if (!sel) return true;
  const el = document.querySelector(sel);
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
};

type Box = { x: number; y: number; w: number; h: number };
type Tip = { left: number; top: number; arrowX: number; side: "below" | "above" | "none" };

const PAD = 8;
const GAP = 16;

export default function Tour() {
  const path = usePathname();
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [i, setI] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  const start = useCallback(() => {
    const all = TOURS[path];
    if (!all) return;
    setSteps(all.filter((s) => visible(s.target)));
    setI(0);
  }, [path]);

  const close = useCallback(() => {
    markSeen(path);
    setSteps(null);
    setBox(null);
    setTip(null);
  }, [path]);

  // first visit to a page with a tour → start after the page settles
  useEffect(() => {
    setSteps(null);
    if (!TOURS[path] || seenList().includes(path)) return;
    const t = setTimeout(() => {
      // don't interrupt someone already using the terminal or x-ray
      if (document.querySelector(".term") || getPrefs().xray) return;
      start();
    }, 1400);
    return () => clearTimeout(t);
  }, [path, start]);

  // replay from the "?" button / terminal
  useEffect(() => {
    const on = () => start();
    window.addEventListener("solostack:tour", on);
    return () => window.removeEventListener("solostack:tour", on);
  }, [start]);

  const step = steps?.[i];

  // bring each target into view (nav items are sticky, so leave the page where it is)
  useEffect(() => {
    if (!step?.target) return;
    const el = document.querySelector(step.target);
    if (!el || el.closest(".nav")) return;
    const r = el.getBoundingClientRect();
    const tall = r.height > window.innerHeight * 0.6;
    el.scrollIntoView({ behavior: "smooth", block: tall ? "start" : "center" });
  }, [step]);

  // track the target every frame while open, so the spotlight follows scrolling/layout changes
  useLayoutEffect(() => {
    if (!step) return;
    let raf = 0;
    const tick = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const tw = Math.min(360, vw - 24);
      const th = tipRef.current?.offsetHeight ?? 200;
      const el = step.target ? document.querySelector(step.target) : null;

      if (!el) {
        setBox(null);
        setTip({ left: (vw - tw) / 2, top: Math.max(16, (vh - th) / 2), arrowX: 0, side: "none" });
      } else {
        const r = el.getBoundingClientRect();
        // clamp tall targets to the visible part of the screen
        const top = Math.max(r.top, 8);
        const bottom = Math.min(r.bottom, vh - 8);
        const b = { x: r.left - PAD, y: top - PAD, w: r.width + PAD * 2, h: Math.max(0, bottom - top) + PAD * 2 };
        setBox((prev) =>
          prev && Math.abs(prev.x - b.x) < 0.5 && Math.abs(prev.y - b.y) < 0.5 && Math.abs(prev.w - b.w) < 0.5 && Math.abs(prev.h - b.h) < 0.5
            ? prev
            : b,
        );
        const cx = r.left + r.width / 2;
        const left = Math.min(Math.max(cx - tw / 2, 12), vw - tw - 12);
        const arrowX = Math.min(Math.max(cx - left, 22), tw - 22);
        let t: Tip;
        if (b.y + b.h + GAP + th <= vh - 12) t = { left, top: b.y + b.h + GAP, arrowX, side: "below" };
        else if (b.y - GAP - th >= 12) t = { left, top: b.y - GAP - th, arrowX, side: "above" };
        else t = { left, top: Math.max(12, vh - th - 16), arrowX, side: "none" };
        setTip((prev) =>
          prev && Math.abs(prev.left - t.left) < 0.5 && Math.abs(prev.top - t.top) < 0.5 && prev.side === t.side ? prev : t,
        );
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [step]);

  // keyboard: → / Enter next, ← back, Esc close (but never while typing)
  useEffect(() => {
    if (!steps) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (!e.isTrusted) return; // keys the tour itself sends (e.g. "Move it for me")
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      if (t?.closest?.("[data-card]")) return; // arrow keys on a ticket move the ticket, not the tour
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    primaryRef.current?.focus({ preventScroll: true });
  }, [i, steps]);

  const go = (d: number) => {
    if (!steps) return;
    const n = i + d;
    if (n >= steps.length) {
      whoosh(true);
      close();
      return;
    }
    if (n < 0) return;
    click(d > 0 ? 1.2 : 0.9);
    setI(n);
  };

  if (!steps || !step) return null;
  const isFirst = i === 0;
  const isLast = i === steps.length - 1;
  const intro = isFirst && !step.target;

  return (
    <div className="tour" role="dialog" aria-modal="false" aria-labelledby="tour-title" aria-describedby="tour-body">
      {box ? (
        <>
          {/* four panels dim everything around the target; the ring highlights it */}
          <div className="tour-shade" style={{ left: 0, top: 0, right: 0, height: Math.max(0, box.y) }} aria-hidden="true" />
          <div className="tour-shade" style={{ left: 0, top: box.y + box.h, right: 0, bottom: 0 }} aria-hidden="true" />
          <div className="tour-shade" style={{ left: 0, top: box.y, width: Math.max(0, box.x), height: box.h }} aria-hidden="true" />
          <div className="tour-shade" style={{ left: box.x + box.w, top: box.y, right: 0, height: box.h }} aria-hidden="true" />
          <div className="tour-spot" style={{ left: box.x, top: box.y, width: box.w, height: box.h }} aria-hidden="true" />
        </>
      ) : (
        <div className="tour-dim" aria-hidden="true" />
      )}

      <div
        ref={tipRef}
        key={i}
        className={`tour-tip tour-${tip?.side ?? "none"}`}
        style={{ left: tip?.left ?? -9999, top: tip?.top ?? -9999 }}
      >
        {tip && tip.side !== "none" && <span className="tour-arrow" style={{ left: tip.arrowX }} aria-hidden="true" />}
        <div className="tour-head">
          <span className="tour-count">
            {intro ? "Quick tour" : `${i} of ${steps.length - 1}`}
          </span>
          <button className="tour-x" onClick={close} aria-label="Close the tour">
            ×
          </button>
        </div>
        <h2 id="tour-title" className="tour-title">
          {step.title}
        </h2>
        <p id="tour-body" className="tour-body">
          {step.body}
        </p>
        {step.action && (
          <button
            className="tour-try"
            onClick={() => {
              click(1.3);
              step.action!.run();
            }}
          >
            ▶ {step.action.label}
          </button>
        )}
        <div className="tour-foot">
          {!intro && (
            <div className="tour-dots" aria-hidden="true">
              {steps.slice(1).map((_, k) => (
                <i key={k} className={k + 1 <= i ? "on" : undefined} />
              ))}
            </div>
          )}
          <div className="tour-btns">
            {intro ? (
              <button className="btn btn-ghost btn-sm" onClick={close}>
                No thanks
              </button>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => go(-1)} disabled={isFirst}>
                Back
              </button>
            )}
            <button ref={primaryRef} className="btn btn-primary btn-sm" onClick={() => go(1)}>
              {intro ? "Show me around" : isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
