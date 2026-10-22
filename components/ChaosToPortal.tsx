"use client";

import { useEffect, useRef, useState } from "react";

// Scroll-driven story: six messy tools fly into place and become one portal.
// All motion is computed from scroll position (no library); positions are % of the stage.

type Box = { x: number; y: number; w: number; h: number; r: number };

const ITEMS: {
  id: string;
  start: Box; // messy position (desktop)
  startM: Box; // messy position (phone)
  mess: React.ReactNode;
  messClass: string;
  module: string;
  color: string;
  clean: React.ReactNode;
}[] = [
  {
    id: "excel",
    start: { x: 2, y: 6, w: 30, h: 34, r: -7 },
    startM: { x: 2, y: 4, w: 58, h: 22, r: -6 },
    messClass: "mess-excel",
    mess: (
      <>
        <div className="mx-title">Q3_FINAL_v7(2).xlsx</div>
        <div className="mx-grid">
          {["Office", "Served", "Total", "Houston", "#REF!", "=SUM(", "Orlando", "??", "#N/A"].map((c, i) => (
            <span key={i} className={c.startsWith("#") ? "bad" : undefined}>
              {c}
            </span>
          ))}
        </div>
      </>
    ),
    module: "Reports",
    color: "#B98CFF",
    clean: (
      <div className="cl-bars" aria-hidden="true">
        {[40, 65, 52, 80, 70, 92].map((h, i) => (
          <span key={i} style={{ height: `${h}%` }} />
        ))}
      </div>
    ),
  },
  {
    id: "sharepoint",
    start: { x: 64, y: 3, w: 33, h: 30, r: 5 },
    startM: { x: 40, y: 20, w: 58, h: 20, r: 5 },
    messClass: "mess-sp",
    mess: (
      <>
        <div className="mx-title">SharePoint · IT Requests</div>
        {["printer again", "new hire laptop???", "RE: password", "printer AGAIN"].map((r) => (
          <div key={r} className="mx-row">
            <span className="dot" /> {r}
          </div>
        ))}
      </>
    ),
    module: "IT Helpdesk",
    color: "#19E3C4",
    clean: (
      <div className="cl-kanban" aria-hidden="true">
        {[3, 2, 4].map((n, c) => (
          <div key={c}>
            {Array.from({ length: n }).map((_, i) => (
              <span key={i} />
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "sticky",
    start: { x: 38, y: 14, w: 20, h: 26, r: 9 },
    startM: { x: 8, y: 40, w: 40, h: 18, r: 8 },
    messClass: "mess-sticky",
    mess: <div className="mx-hand">call donors back!!! (which ones??)</div>,
    module: "Donor Calling",
    color: "#F2B33A",
    clean: (
      <div className="cl-list" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <span className="av" />
            <span className="ln" />
            <span className="ph">☎</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "email",
    start: { x: 6, y: 52, w: 34, h: 30, r: 4 },
    startM: { x: 46, y: 46, w: 52, h: 18, r: -4 },
    messClass: "mess-email",
    mess: (
      <>
        <div className="mx-title">Fwd: Fwd: RE: approval??</div>
        <div className="mx-row">Can someone approve this check before Friday…</div>
        <div className="mx-row dim">7 people on this thread</div>
      </>
    ),
    module: "Finance Approvals",
    color: "#19E3C4",
    clean: (
      <div className="cl-chain" aria-hidden="true">
        {["Requested", "Manager", "Finance", "Paid"].map((s, i) => (
          <div key={s} className={i < 3 ? "done" : undefined}>
            <span>{i < 3 ? "✓" : "○"}</span>
            {s}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "paper",
    start: { x: 46, y: 50, w: 24, h: 40, r: -10 },
    startM: { x: 2, y: 64, w: 44, h: 24, r: -9 },
    messClass: "mess-paper",
    mess: (
      <>
        <div className="mx-title">intake_scan_0043.pdf</div>
        {[80, 60, 90, 45, 70].map((w, i) => (
          <div key={i} className="mx-scribble" style={{ width: `${w}%` }} />
        ))}
      </>
    ),
    module: "Client Intake",
    color: "#3FA9F5",
    clean: (
      <div className="cl-search" aria-hidden="true">
        <div className="bar">⌕ search every program</div>
        <span />
        <span />
        <span />
      </div>
    ),
  },
  {
    id: "powerapp",
    start: { x: 74, y: 44, w: 24, h: 30, r: 6 },
    startM: { x: 50, y: 70, w: 48, h: 20, r: 6 },
    messClass: "mess-app",
    mess: (
      <>
        <div className="mx-warn">⚠</div>
        <div className="mx-row">This app stopped working.</div>
        <div className="mx-row dim">Contact your administrator.</div>
      </>
    ),
    module: "Executive Dashboard",
    color: "#B98CFF",
    clean: (
      <div className="cl-kpi" aria-hidden="true">
        <div>
          <span />
          <b />
        </div>
        <div>
          <span />
          <b />
        </div>
        <svg viewBox="0 0 100 30" preserveAspectRatio="none">
          <polyline points="0,24 15,20 30,22 45,14 60,16 75,8 100,4" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    ),
  },
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function endBox(i: number, narrow: boolean): Box {
  if (narrow) {
    // 2 cols × 3 rows under a top bar (no sidebar on phones)
    const col = i % 2;
    const row = Math.floor(i / 2);
    return { x: 2 + col * 49, y: 13 + row * 29, w: 47, h: 27, r: 0 };
  }
  // 3 cols × 2 rows beside a sidebar
  const col = i % 3;
  const row = Math.floor(i / 3);
  return { x: 21 + col * 26.5, y: 14 + row * 43.5, w: 25, h: 41.5, r: 0 };
}

const CAPTIONS = [
  { at: 0, text: "Spreadsheets. SharePoint. Sticky notes. Reply-all." },
  { at: 0.38, text: "Same work. Fewer places for it to get lost." },
  { at: 0.72, text: "One portal. Every team. Data entered once." },
];

export default function ChaosToPortal() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const render = () => {
      raf = 0;
      const sec = section.current;
      const st = stage.current;
      if (!sec || !st) return;
      const rect = sec.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const p = reduce ? 1 : clamp(-rect.top / (span || 1));
      const narrow = st.clientWidth < 640;

      ITEMS.forEach((it, i) => {
        const el = cards.current[i];
        if (!el) return;
        const t = ease(clamp((p - 0.12 - i * 0.035) / 0.5));
        const a = narrow ? it.startM : it.start;
        const b = endBox(i, narrow);
        el.style.left = `${lerp(a.x, b.x, t)}%`;
        el.style.top = `${lerp(a.y, b.y, t)}%`;
        el.style.width = `${lerp(a.w, b.w, t)}%`;
        el.style.height = `${lerp(a.h, b.h, t)}%`;
        el.style.transform = `rotate(${lerp(a.r, 0, t)}deg)`;
        el.style.setProperty("--clean", String(clamp((t - 0.45) / 0.4)));
      });
      st.style.setProperty("--chrome", String(clamp((p - 0.5) / 0.25)));
      st.dataset.narrow = narrow ? "1" : "0";
      const s = CAPTIONS.reduce((acc, c, idx) => (p >= c.at ? idx : acc), 0);
      setStep(s);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };
    render();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={section} className="story" aria-labelledby="story-title" data-x="ChaosToPortal · scroll-driven">
      <div className="story-sticky">
        <div className="container story-inner">
          <div className="story-copy">
            <p className="eyebrow">// Scroll to fix it</p>
            <h2 id="story-title" className="h2" aria-live="polite">
              {CAPTIONS[step].text}
            </h2>
            <div className="story-steps" aria-hidden="true">
              {CAPTIONS.map((c, i) => (
                <span key={i} className={i <= step ? "on" : undefined} />
              ))}
            </div>
          </div>

          <div ref={stage} className="story-stage" role="img" aria-label="Messy tools — a spreadsheet, a SharePoint list, a sticky note, an email thread, a scanned form and a broken app — reassemble into one portal with Reports, IT Helpdesk, Donor Calling, Finance Approvals, Client Intake and an Executive Dashboard.">
            {/* portal chrome fades in as the pieces land */}
            <div className="pc-side" aria-hidden="true">
              <b>your-org</b>
              {["Home", "Helpdesk", "Finance", "Programs", "Donors", "Reports"].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
            <div className="pc-top" aria-hidden="true">
              <span className="pc-search">⌕ Search the portal</span>
              <span className="pc-avatar" />
            </div>

            {ITEMS.map((it, i) => (
              <div
                key={it.id}
                ref={(el) => {
                  cards.current[i] = el;
                }}
                className="sc"
                style={{ ["--c" as string]: it.color }}
                aria-hidden="true"
              >
                <div className={`sc-mess ${it.messClass}`}>{it.mess}</div>
                <div className="sc-clean">
                  <div className="sc-name">{it.module}</div>
                  {it.clean}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
