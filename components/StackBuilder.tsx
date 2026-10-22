"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BANDS,
  CATEGORIES,
  MODULES,
  PRESETS,
  type Band,
  type CategoryId,
  categoryById,
  moduleById,
} from "@/lib/modules";
import { renderStackImage } from "@/lib/stackImage";
import { chime, click } from "@/lib/sound";
import PhysicsTower from "./PhysicsTower";

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

const resolve = (ids: string[]) => {
  const out: string[] = [];
  ids.forEach((id) => withDeps(id).forEach((d) => !out.includes(d) && out.push(d)));
  return out;
};

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export default function StackBuilder() {
  const [stack, setStack] = useState<string[]>([]);
  const [pulled, setPulled] = useState<string | null>(null);
  const [band, setBand] = useState<Band>("M");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [imaging, setImaging] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);

  const say = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3800);
  }, []);

  // Load a shared stack from the URL (?s=crm,campaigns&b=M)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const s = (p.get("s") ?? "").split(",").filter((id) => moduleById(id));
    const b = p.get("b") as Band | null;
    if (s.length) setStack(resolve(s));
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
      click(1.1);
      setPulled(null);
      setStack((cur) => {
        if (cur.includes(id)) {
          say(`${moduleById(id)?.name} is already in your stack.`);
          return cur;
        }
        const chain = withDeps(id).filter((d) => !cur.includes(d));
        const extras = chain.filter((d) => d !== id);
        say(
          extras.length
            ? `${moduleById(id)?.name} sits on ${extras.map((e) => moduleById(e)?.name).join(" + ")} — stacked that first.`
            : `+ ${moduleById(id)?.name}`,
        );
        return [...cur, ...chain];
      });
    },
    [say],
  );

  const remove = useCallback(
    (id: string) => {
      const toppled = dependentsOf(id, stack);
      const gone = [id, ...toppled];
      setPulled(id);
      setStack((cur) => cur.filter((s) => !gone.includes(s)));
      say(
        toppled.length
          ? `Pulled ${moduleById(id)?.name} — ${toppled.map((t) => moduleById(t)?.name).join(", ")} came down with it.`
          : `− ${moduleById(id)?.name}`,
      );
    },
    [stack, say],
  );

  // The terminal (and anything else) can drive the stack with a window event.
  useEffect(() => {
    const onCmd = (e: Event) => {
      const { action, ids = [] } = (e as CustomEvent<{ action: "add" | "rm" | "set" | "clear"; ids?: string[] }>).detail;
      if (action === "add") ids.forEach((id) => add(id));
      if (action === "rm") ids.forEach((id) => stack.includes(id) && remove(id));
      if (action === "set") {
        setPulled(null);
        setStack(resolve(ids));
      }
      if (action === "clear") {
        setPulled(null);
        setStack([]);
      }
    };
    window.addEventListener("solostack:stack", onCmd);
    return () => window.removeEventListener("solostack:stack", onCmd);
  }, [add, remove, stack]);

  const loadPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    click(1.2);
    const resolved = resolve(preset.modules);
    setPulled(null);
    setStack(resolved);
    say(`Loaded the ${preset.name} stack — ${resolved.length} modules.`);
  };

  const clear = () => {
    setPulled(null);
    setStack([]);
    say("Timber! Stack cleared.");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      say("Link copied — share your stack with your team.");
    } catch {
      say("Couldn’t copy automatically — copy the address bar instead.");
    }
  };

  const shareImage = async () => {
    if (!stack.length || imaging) return;
    setImaging(true);
    try {
      const blob = await renderStackImage(stack, band);
      const file = new File([blob], "my-solostack.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My org’s SoloStack",
          text: `Our ${stack.length + 1}-block stack. Build yours:`,
          url: window.location.href,
        });
        chime();
        say("Shared. Nice stack.");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "my-solostack.png";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        chime();
        say("Saved my-solostack.png — post it anywhere.");
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") say("Couldn’t make the image — try again.");
    } finally {
      setImaging(false);
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
        <section aria-labelledby="lib-title" data-x="ModuleLibrary · client component">
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
                    <button className="lib-info" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : m.id)}>
                      {isOpen ? "Less" : "What’s inside"}
                    </button>
                    {m.id === "helpdesk" && (
                      <Link href="/demo/helpdesk" className="lib-info" style={{ color: "var(--accent)" }}>
                        Try it ↗
                      </Link>
                    )}
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
        <aside className="tower-wrap" aria-labelledby="tower-title" data-x="StackTower · sticky aside">
          <div className="tower-panel">
            <div className="tower-head">
              <span id="tower-title">your-org — stack</span>
              <span>
                {stack.length} {stack.length === 1 ? "MODULE" : "MODULES"}
              </span>
            </div>

            <PhysicsTower stack={stack} pulledId={pulled} onRemove={remove} onDropId={add} />

            <div className="summary" data-x="StackSummary · live pricing">
              {mix.length > 0 && (
                <div className="mix" aria-hidden="true">
                  {mix.map((c) => (
                    <span key={c.id} style={{ ["--c" as string]: c.color, flexGrow: c.count }} />
                  ))}
                </div>
              )}

              <div className="bands" role="group" aria-label="Organization size">
                {BANDS.map((b) => (
                  <button
                    key={b.id}
                    className="band-btn"
                    aria-pressed={band === b.id}
                    onClick={() => {
                      click(0.9);
                      setBand(b.id);
                    }}
                  >
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

              <Link
                href={stack.length ? contactHref : "#lib-title"}
                className="btn btn-primary"
                aria-disabled={stack.length === 0}
              >
                {stack.length ? "Send my stack →" : "Add a module to start"}
              </Link>
              <div className="share-row">
                <button className="btn btn-ghost btn-sm" onClick={shareImage} disabled={!stack.length || imaging}>
                  {imaging ? "Rendering…" : "▣ Share image"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={copyLink} disabled={!stack.length}>
                  ⧉ Copy link
                </button>
              </div>
              {stack.length > 0 && (
                <button className="lib-info" onClick={clear} style={{ alignSelf: "flex-start" }}>
                  Knock it all down
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
