"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BANDS,
  CATEGORIES,
  FOUNDATION,
  MODULES,
  PRESETS,
  type Band,
  type CategoryId,
  categoryById,
  moduleById,
} from "@/lib/modules";

type Filter = CategoryId | "all";

/** Everything `id` depends on (deepest first), followed by `id` itself. */
function withDeps(id: string, seen = new Set<string>()): string[] {
  if (seen.has(id)) return [];
  seen.add(id);
  const mod = moduleById(id);
  if (!mod) return [];
  const deps = (mod.requires ?? []).flatMap((d) => withDeps(d, seen));
  return [...deps, id];
}

/** Modules in `stack` that (directly or indirectly) sit on `id`. */
function dependentsOf(id: string, stack: string[]): string[] {
  const out = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const s of stack) {
      if (out.has(s)) continue;
      const req = moduleById(s)?.requires ?? [];
      if (req.includes(id) || req.some((r) => out.has(r))) {
        out.add(s);
        changed = true;
      }
    }
  }
  return [...out];
}

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export default function StackBuilder() {
  const [stack, setStack] = useState<string[]>([]);
  const [band, setBand] = useState<Band>("M");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState("");
  const [batch, setBatch] = useState(0); // bumps on preset so blocks re-animate in sequence
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const hydrated = useRef(false);

  const say = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3800);
  }, []);

  const thud = () => {
    const z = zoneRef.current;
    if (!z) return;
    z.classList.remove("shake");
    void z.offsetWidth; // restart the animation
    z.classList.add("shake");
  };

  // Load a shared stack from the URL (?s=crm,campaigns&b=M)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const s = (p.get("s") ?? "").split(",").filter((id) => moduleById(id));
    const b = p.get("b") as Band | null;
    if (s.length) {
      const resolved: string[] = [];
      s.forEach((id) => withDeps(id).forEach((d) => !resolved.includes(d) && resolved.push(d)));
      setStack(resolved);
    }
    if (b && ["S", "M", "L"].includes(b)) setBand(b);
    hydrated.current = true;
  }, []);

  // Keep the URL shareable
  useEffect(() => {
    if (!hydrated.current) return;
    const p = new URLSearchParams();
    if (stack.length) p.set("s", stack.join(","));
    p.set("b", band);
    window.history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
  }, [stack, band]);

  const add = useCallback(
    (id: string) => {
      setStack((cur) => {
        if (cur.includes(id)) {
          say(`${moduleById(id)?.name} is already in your stack.`);
          return cur;
        }
        const chain = withDeps(id).filter((d) => !cur.includes(d));
        const extras = chain.filter((d) => d !== id);
        if (extras.length) {
          say(
            `${moduleById(id)?.name} sits on ${extras.map((e) => moduleById(e)?.name).join(" + ")} — stacked that first.`,
          );
        } else {
          say(`+ ${moduleById(id)?.name}`);
        }
        return [...cur, ...chain];
      });
      setTimeout(thud, 330);
    },
    [say],
  );

  const remove = useCallback(
    (id: string) => {
      const toppled = dependentsOf(id, stack);
      const gone = [id, ...toppled];
      setRemoving(gone);
      if (toppled.length) {
        say(`Pulled ${moduleById(id)?.name} — ${toppled.map((t) => moduleById(t)?.name).join(", ")} came down with it.`);
      } else {
        say(`− ${moduleById(id)?.name}`);
      }
      setTimeout(() => {
        setStack((cur) => cur.filter((s) => !gone.includes(s)));
        setRemoving([]);
      }, 240);
    },
    [stack, say],
  );

  const loadPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const resolved: string[] = [];
    preset.modules.forEach((id) => withDeps(id).forEach((d) => !resolved.includes(d) && resolved.push(d)));
    setStack(resolved);
    setBatch((b) => b + 1);
    say(`Loaded the ${preset.name} stack — ${resolved.length} modules.`);
  };

  const clear = () => {
    setRemoving(stack);
    setTimeout(() => {
      setStack([]);
      setRemoving([]);
    }, 240);
    say("Stack cleared. Fresh foundation.");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      say("Link copied — share your stack with your team.");
    } catch {
      say("Couldn’t copy automatically — copy the address bar instead.");
    }
  };

  const visible = useMemo(() => MODULES.filter((m) => filter === "all" || m.category === filter), [filter]);

  const pricing = useMemo(() => {
    let total = 0;
    let unpriced = 0;
    for (const id of stack) {
      const p = moduleById(id)?.price[band];
      if (p == null) unpriced++;
      else total += p;
    }
    return { total, unpriced };
  }, [stack, band]);

  const mix = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        ...c,
        count: stack.filter((id) => moduleById(id)?.category === c.id).length,
      })).filter((c) => c.count > 0),
    [stack],
  );

  const contactHref = `/contact?s=${encodeURIComponent(stack.join(","))}&b=${band}`;

  return (
    <>
    <div className="container">
      <div className="presets" role="group" aria-label="Start from a preset stack">
        <span className="presets-label">START FROM:</span>
        {PRESETS.map((p) => (
          <button key={p.id} className="preset-btn" onClick={() => loadPreset(p.id)} title={p.blurb}>
            {p.name.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
    <div className="container sb">
      {/* ── Library ─────────────────────────────── */}
      <section aria-labelledby="lib-title">
        <h2 id="lib-title" className="eyebrow" style={{ marginBottom: 14 }}>
          // Pick your modules — tap Add or drag onto the stack
        </h2>
        <div className="lib-filters" role="group" aria-label="Filter modules by category">
          <button
            className="chip"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
            style={{ ["--c" as string]: "var(--text)" }}
          >
            ALL {MODULES.length}
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className="chip"
              aria-pressed={filter === c.id}
              onClick={() => setFilter(c.id)}
              style={{ ["--c" as string]: c.color }}
            >
              {c.name.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="lib">
          {visible.map((m) => {
            const cat = categoryById(m.category);
            const inStack = stack.includes(m.id);
            const isOpen = open === m.id;
            return (
              <article
                key={m.id}
                className={`lib-card${inStack ? " in-stack" : ""}`}
                style={{ ["--c" as string]: cat.color }}
                draggable={!inStack}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", m.id);
                  e.dataTransfer.effectAllowed = "copy";
                }}
              >
                <span className="cat">{cat.name}</span>
                <strong>{m.name}</strong>
                <p>{m.tagline}</p>
                {isOpen && (
                  <>
                    <ul className="lib-features">
                      {m.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    {m.requires && (
                      <span className="lib-req">
                        SITS ON: {m.requires.map((r) => moduleById(r)?.name.toUpperCase()).join(" + ")}
                      </span>
                    )}
                  </>
                )}
                <div className="lib-actions">
                  <button
                    className="lib-info"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : m.id)}
                  >
                    {isOpen ? "Less" : "What’s inside"}
                  </button>
                  <button
                    className="lib-add"
                    onClick={() => add(m.id)}
                    disabled={inStack}
                    aria-label={inStack ? `${m.name} is in your stack` : `Add ${m.name} to your stack`}
                  >
                    {inStack ? "✓ STACKED" : "+ ADD"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── The tower ──────────────────────────── */}
      <aside className="tower-wrap" aria-labelledby="tower-title">
        <div className="tower-panel">
          <div className="tower-head">
            <span id="tower-title">your-org — stack</span>
            <span>
              {stack.length} {stack.length === 1 ? "MODULE" : "MODULES"}
            </span>
          </div>

          <div
            ref={zoneRef}
            className={`tower-zone${dragOver ? " drag-over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
              if (!dragOver) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const id = e.dataTransfer.getData("text/plain");
              if (id) add(id);
            }}
            aria-label="Your stack. Modules stack from the foundation up."
          >
            {/* Foundation (rendered first = bottom, thanks to column-reverse) */}
            <div className="block foundation" title={FOUNDATION.features.join(" · ")}>
              <div className="block-left">
                <small>FOUNDATION · ALWAYS INCLUDED</small>
                <strong>{FOUNDATION.name}</strong>
              </div>
            </div>

            {stack.map((id, i) => {
              const m = moduleById(id)!;
              const cat = categoryById(m.category);
              return (
                <div
                  key={`${id}-${batch}`}
                  className={`block${removing.includes(id) ? " removing" : ""}`}
                  style={{
                    ["--c" as string]: cat.color,
                    animationDelay: batch ? `${i * 90}ms` : undefined,
                    animationFillMode: "both",
                  }}
                >
                  <div className="block-left">
                    <small>{cat.name}</small>
                    <strong>{m.name}</strong>
                  </div>
                  <button className="block-x" onClick={() => remove(id)} aria-label={`Remove ${m.name}`}>
                    ×
                  </button>
                </div>
              );
            })}

            {stack.length === 0 && (
              <div className="tower-empty">
                <span>
                  DROP MODULES HERE
                  <br />
                  ↓ THEY STACK ON THE FOUNDATION ↓
                </span>
              </div>
            )}
            <span className="tower-ruler" aria-hidden="true">
              HEIGHT {String(stack.length + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="summary">
            {mix.length > 0 && (
              <div className="mix" aria-hidden="true">
                {mix.map((c) => (
                  <span key={c.id} style={{ ["--c" as string]: c.color, flexGrow: c.count }} />
                ))}
              </div>
            )}

            <div className="bands" role="group" aria-label="Organization size">
              {BANDS.map((b) => (
                <button key={b.id} className="band-btn" aria-pressed={band === b.id} onClick={() => setBand(b.id)}>
                  <strong>{b.label}</strong>
                  <span>{b.staff}</span>
                </button>
              ))}
            </div>

            <div className="totals">
              <span className="label">ESTIMATED / MONTH</span>
              <span className="value">
                {stack.length === 0
                  ? "—"
                  : pricing.unpriced === stack.length
                    ? "Custom quote"
                    : money(pricing.total)}
                {stack.length > 0 && pricing.unpriced < stack.length && <small> /mo</small>}
              </span>
            </div>
            <p className="note">
              {pricing.unpriced > 0 && pricing.unpriced < stack.length
                ? `+ ${pricing.unpriced} module${pricing.unpriced > 1 ? "s" : ""} quoted on the call. `
                : ""}
              Monthly per module, or buy outright with annual maintenance. Your code, your database.
            </p>

            <p className="toast" role="status" aria-live="polite">
              {toast}
            </p>

            <div className="summary-actions">
              <Link
                href={stack.length ? contactHref : "#lib-title"}
                className="btn btn-primary"
                aria-disabled={stack.length === 0}
              >
                {stack.length ? "Send my stack →" : "Add a module to start"}
              </Link>
              <button className="btn btn-ghost" onClick={copyLink} disabled={stack.length === 0}>
                Share
              </button>
            </div>
            {stack.length > 0 && (
              <button className="lib-info" onClick={clear} style={{ alignSelf: "flex-start" }}>
                Clear stack
              </button>
            )}
          </div>
        </div>
      </aside>

    </div>
    </>
  );
}
