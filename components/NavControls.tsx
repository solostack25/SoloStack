"use client";

import { useEffect, useRef, useState } from "react";
import { getPrefs, setPrefs, usePrefs } from "@/lib/prefs";
import { STYLES } from "@/lib/styles";
import { switchStyle, originOf } from "@/lib/switchStyle";
import { chime, click, unlock } from "@/lib/sound";

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
  const trigger = useRef<HTMLButtonElement>(null);

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

  const current = STYLES.find((s) => s.id === prefs.style) ?? STYLES[0];

  return (
    <div className="nav-tools">
      <div className="theme-pick" ref={wrap}>
        <button
          ref={trigger}
          className="tool-btn"
          data-tour="style"
          aria-haspopup="true"
          aria-expanded={open}
          aria-label={`Site style: ${current.name}. Change style`}
          title="Switch style"
          onClick={() => {
            click();
            setOpen((o) => !o);
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 3.5a8.5 8.5 0 0 0 0 17z" fill="currentColor" stroke="none" />
          </svg>
        </button>
        {open && (
          <div className="theme-menu style-menu" role="menu" aria-label="Site styles">
            <p className="theme-menu-label">ONE CODEBASE · FIVE DESIGN LANGUAGES</p>
            {STYLES.map((s) => (
              <button
                key={s.id}
                role="menuitemradio"
                aria-checked={s.id === prefs.style}
                className="theme-opt style-opt"
                onClick={(e) => {
                  click(1.2);
                  setOpen(false);
                  void switchStyle(s.id, originOf(e.currentTarget) ?? originOf(trigger.current));
                }}
              >
                {/* each preview chip renders in its own style's tokens */}
                <span className="style-chip" data-style={s.id} aria-hidden="true">
                  Aa
                </span>
                <span className="style-opt-text">
                  <b>{s.name}</b>
                  <small>{s.tagline}</small>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        className="tool-btn"
        data-tour="sound"
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
        data-tour="xray"
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
        data-tour="terminal"
        aria-label="Open terminal (press ~)"
        title="Terminal (~)"
        onClick={() => {
          click();
          openTerminal();
        }}
      >
        &gt;_
      </button>

      <button
        className="tool-btn help-btn"
        data-tour="help"
        aria-label="Take the guided tour"
        title="Tour"
        onClick={() => {
          click(1.1);
          window.dispatchEvent(new Event("solostack:tour"));
        }}
      >
        ?
      </button>
    </div>
  );
}
