"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { setPrefs, usePrefs } from "@/lib/prefs";

type Vitals = { ttfb?: number; fcp?: number; lcp?: number; cls: number };

const RENDER_MODE: Record<string, string> = {
  "/": "Static · prerendered at build",
  "/contact": "Static · prerendered at build",
  "/stack": "Dynamic · rendered per request (share cards)",
  "/demo/helpdesk": "Static · prerendered at build",
};

const ms = (n?: number) => (n == null ? "…" : `${Math.round(n)} ms`);
const kb = (n: number) => `${(n / 1024).toFixed(0)} KB`;

function grade(metric: "fcp" | "lcp" | "cls" | "ttfb", v?: number) {
  if (v == null) return "";
  const t = { fcp: [1800, 3000], lcp: [2500, 4000], cls: [0.1, 0.25], ttfb: [800, 1800] }[metric];
  return v <= t[0] ? "good" : v <= t[1] ? "meh" : "poor";
}

export default function XrayHud() {
  const { xray } = usePrefs();
  const path = usePathname();
  const [vitals, setVitals] = useState<Vitals>({ cls: 0 });
  const [stats, setStats] = useState({ nodes: 0, js: 0, css: 0, reqs: 0, parts: 0 });
  const [fps, setFps] = useState(0);
  const frames = useRef(0);

  // Collect real Web Vitals from the browser's Performance APIs (buffered, so values from load are included)
  useEffect(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav) setVitals((v) => ({ ...v, ttfb: nav.responseStart }));
    const obs: PerformanceObserver[] = [];
    const watch = (type: string, cb: (e: PerformanceEntry) => void) => {
      try {
        const o = new PerformanceObserver((list) => list.getEntries().forEach(cb));
        o.observe({ type, buffered: true });
        obs.push(o);
      } catch {
        /* unsupported in this browser */
      }
    };
    watch("paint", (e) => e.name === "first-contentful-paint" && setVitals((v) => ({ ...v, fcp: e.startTime })));
    watch("largest-contentful-paint", (e) => setVitals((v) => ({ ...v, lcp: e.startTime })));
    watch("layout-shift", (e) => {
      const ls = e as PerformanceEntry & { value: number; hadRecentInput: boolean };
      if (!ls.hadRecentInput) setVitals((v) => ({ ...v, cls: v.cls + ls.value }));
    });
    return () => obs.forEach((o) => o.disconnect());
  }, []);

  // Page stats + FPS meter only while x-ray is on
  useEffect(() => {
    if (!xray) return;
    const measure = () => {
      const res = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const size = (r: PerformanceResourceTiming) => r.encodedBodySize || r.transferSize || 0;
      setStats({
        nodes: document.getElementsByTagName("*").length,
        js: res.filter((r) => r.initiatorType === "script" || r.name.endsWith(".js")).reduce((a, r) => a + size(r), 0),
        css: res.filter((r) => r.name.includes(".css")).reduce((a, r) => a + size(r), 0),
        reqs: res.length + 1,
        parts: document.querySelectorAll("[data-x]").length,
      });
    };
    measure();
    const iv = window.setInterval(measure, 1500);

    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      frames.current++;
      if (t - last >= 1000) {
        setFps(Math.round((frames.current * 1000) / (t - last)));
        frames.current = 0;
        last = t;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      clearInterval(iv);
      cancelAnimationFrame(raf);
    };
  }, [xray, path]);

  if (!xray) return null;

  const rows: [string, string, string?][] = [
    ["TTFB", ms(vitals.ttfb), grade("ttfb", vitals.ttfb)],
    ["First paint", ms(vitals.fcp), grade("fcp", vitals.fcp)],
    ["Largest paint", ms(vitals.lcp), grade("lcp", vitals.lcp)],
    ["Layout shift", vitals.cls.toFixed(3), grade("cls", vitals.cls)],
    ["Frame rate", `${fps} fps`, fps >= 55 ? "good" : fps >= 30 ? "meh" : fps ? "poor" : ""],
    ["JS shipped", kb(stats.js)],
    ["CSS shipped", kb(stats.css)],
    ["Requests", String(stats.reqs)],
    ["DOM nodes", stats.nodes.toLocaleString()],
    ["Components", String(stats.parts)],
  ];

  return (
    <aside className="xray-hud" aria-label="X-ray: how this page is built">
      <div className="xray-head">
        <span>X-RAY · {path}</span>
        <button className="block-x" aria-label="Close X-ray" onClick={() => setPrefs({ xray: false })}>
          ×
        </button>
      </div>
      <p className="xray-mode">{RENDER_MODE[path] ?? "Next.js route"}</p>
      <dl>
        {rows.map(([k, v, g]) => (
          <div key={k} className="xray-row">
            <dt>{k}</dt>
            <dd className={g ? `g-${g}` : undefined}>{v}</dd>
          </div>
        ))}
      </dl>
      <p className="xray-foot">Next.js 16 · React 19 · Vercel · measured live in your browser</p>
    </aside>
  );
}
