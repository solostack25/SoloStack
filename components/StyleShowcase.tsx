"use client";

import { usePrefs } from "@/lib/prefs";
import { STYLES } from "@/lib/styles";
import { switchStyle, originOf } from "@/lib/switchStyle";
import { click } from "@/lib/sound";

// Five live preview cards. Each card carries data-style, so it renders in that style's own
// tokens (fonts, corners, borders, shadows, buttons) regardless of the page's current style.
export default function StyleShowcase() {
  const { style } = usePrefs();

  return (
    <section id="styles" className="container section" aria-labelledby="styles-title" data-x="StyleShowcase · scoped design tokens">
      <div className="section-head">
        <div>
          <p className="eyebrow">Design range</p>
          <h2 id="styles-title" className="h2">
            One site.
            <br />
            Five looks.
          </h2>
        </div>
        <p>
          Same pages, same content, same code — five complete design languages. Pick one and the whole site rebuilds
          itself around it. This is how we fit your brand instead of a template.
        </p>
      </div>

      <div className="showcase-grid">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            className="style-card"
            data-style={s.id}
            aria-pressed={style === s.id}
            aria-label={`Switch the site to the ${s.name} style — ${s.tagline}`}
            onClick={(e) => {
              click(1.1);
              void switchStyle(s.id, originOf(e.currentTarget));
            }}
          >
            <span className="sc-eyebrow">{s.kind}</span>
            <span className="sc-title">
              Your mission, <em>front and center.</em>
            </span>
            <span className="sc-body">{s.tagline}</span>
            <span className="sc-btn">{style === s.id ? "You’re here" : "Try this style"}</span>
            <span className="sc-dots" aria-hidden="true">
              {s.swatches.map((c) => (
                <i key={c} style={{ background: c }} />
              ))}
            </span>
            <span className="sc-label">
              <b>{s.name}</b>
              <small>{s.forWho}</small>
            </span>
          </button>
        ))}
      </div>
      <p className="showcase-note">Tip: you can also switch from the half-moon icon in the menu, or type <code>style glass</code> in the terminal (~).</p>
    </section>
  );
}
