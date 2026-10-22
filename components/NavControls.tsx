"use client";

import { useEffect, useRef, useState } from "react";
import { THEMES, type ThemeId, getPrefs, setPrefs, usePrefs } from "@/lib/prefs";
import { chime, click, unlock } from "@/lib/sound";

export function changeTheme(id: ThemeId) {
  const html = document.documentElement;
  html.classList.add("theme-anim");
  setPrefs({ theme: id });
  window.setTimeout(() => html.classList.remove("theme-anim"), 500);
}

export function toggleSound(on?: boolean) {
  const next = on ?? !getPrefs().sound;
  setPrefs({ sound: next });
  if (next) {
    unlock();
    chime();
  }
}

export function openTerminal() {
  window.dispatchEvent(new Event("solostack:terminal"));
}

export default function NavControls() {
  const prefs = usePrefs();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const current = THEMES.find((t) => t.id === prefs.theme) ?? THEMES[0];

  return (
    <div className="nav-tools">
      <div className="theme-pick" ref={wrap}>
        <button
          className="tool-btn"
          aria-haspopup="true"
          aria-expanded={open}
          aria-label={`Theme: ${current.name}. Change theme`}
          title="Theme"
          onClick={() => {
            click();
            setOpen((o) => !o);
          }}
        >
          <span className="swatch" style={{ background: current.swatch }} />
        </button>
        {open && (
          <div className="theme-menu" role="menu">
            <p className="theme-menu-label">ONE CODEBASE. ANY BRAND.</p>
            {THEMES.map((t) => (
              <button
                key={t.id}
                role="menuitemradio"
                aria-checked={t.id === prefs.theme}
                className="theme-opt"
                onClick={() => {
                  click(1.2);
                  changeTheme(t.id);
                  setOpen(false);
                }}
              >
                <span className="swatch" style={{ background: t.swatch }} />
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        className="tool-btn"
        aria-pressed={prefs.sound}
        aria-label={prefs.sound ? "Sound on. Turn sound off" : "Sound off. Turn sound on"}
        title="Sound"
        onClick={() => toggleSound(!prefs.sound)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 9h4l5-4v14l-5-4H4z" strokeLinejoin="round" />
          {prefs.sound ? (
            <>
              <path d="M16.5 9.5a3.5 3.5 0 0 1 0 5" strokeLinecap="round" />
              <path d="M19 7a7 7 0 0 1 0 10" strokeLinecap="round" />
            </>
          ) : (
            <path d="M17 10l4 4m0-4l-4 4" strokeLinecap="round" />
          )}
        </svg>
      </button>

      <button
        className="tool-btn xray-btn"
        aria-pressed={prefs.xray}
        aria-label={prefs.xray ? "X-ray on. Turn off" : "X-ray: see how this page is built"}
        title="X-ray"
        onClick={() => {
          click(0.8);
          setPrefs({ xray: !prefs.xray });
        }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3.5" y="3.5" width="17" height="17" strokeDasharray="3 2.4" />
          <path d="M8 9h8M8 12h5M8 15h7" strokeLinecap="round" />
        </svg>
      </button>

      <button
        className="tool-btn mono"
        aria-label="Open terminal (press ~)"
        title="Terminal (~)"
        onClick={() => {
          click();
          openTerminal();
        }}
      >
        &gt;_
      </button>
    </div>
  );
}
