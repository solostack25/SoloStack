"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MODULES, PRESETS, moduleById } from "@/lib/modules";
import { getPrefs, setPrefs } from "@/lib/prefs";
import { STYLES } from "@/lib/styles";
import { switchStyle } from "@/lib/switchStyle";
import { SITE } from "@/lib/site";
import { chime, click, key } from "@/lib/sound";
import { toggleSound } from "./NavControls";

type Line = { text: string; kind: "cmd" | "out" | "err" | "ok" | "dim" | "banner" };

const PAGES: Record<string, string> = {
  home: "/",
  stack: "/stack",
  contact: "/contact",
  helpdesk: "/demo/helpdesk",
};

const BANNER = String.raw`
 ___  ___  _    ___   _   _ ___ _____ _   ___ _  __
/ __|/ _ \| |  / _ \ / / / / __|_   _/_\ / __| |/ /
\__ \ (_) | |_| (_) / / / /\__ \ | |/ _ \ (__| ' <
|___/\___/|____\___/_/ /_/ |___/ |_/_/ \_\___|_|\_\
`;

const COMMANDS = [
  "help", "ls", "stack", "open", "cd", "style", "theme", "sound", "xray", "demo",
  "book", "tour", "whoami", "about", "neofetch", "history", "date", "echo", "clear", "exit", "sudo",
];

const HELP: [string, string][] = [
  ["ls modules", "every Nonprofit OS module (also: ls work, ls pages, ls styles)"],
  ["stack", "show your current stack"],
  ["stack add <id…>", "stack modules, e.g. stack add crm campaigns"],
  ["stack rm <id>", "pull a module out (Jenga rules apply)"],
  ["stack preset <name>", "pantry · masjid · fundraising · backoffice"],
  ["stack clear", "knock it all down"],
  ["open <page>", "home · stack · contact · helpdesk"],
  ["demo helpdesk", "play with the real helpdesk board"],
  ["style <name>", "stack · editorial · glass · brutal · playful"],
  ["sound on|off", "synthesized UI sounds"],
  ["xray on|off", "see how this page is built"],
  ["book", "book a free consult"],
  ["tour", "guided tour of this page"],
  ["whoami · about · neofetch", "self-explanatory, mostly"],
  ["clear · exit", "tidy up · close (or press Esc / ~)"],
];

function currentStack(): string[] {
  if (typeof window === "undefined") return [];
  if (window.location.pathname !== "/stack") return [];
  return (new URLSearchParams(window.location.search).get("s") ?? "").split(",").filter((id) => moduleById(id));
}

export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const booted = useRef(false);
  const router = useRouter();
  const path = usePathname();

  const print = useCallback((...ls: Line[]) => setLines((cur) => [...cur, ...ls].slice(-300)), []);
  const out = (text: string, kind: Line["kind"] = "out"): Line => ({ text, kind });

  // open / close: ` or ~ anywhere (except while typing in a field), Esc to close, or the nav button event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.key === "`" || e.key === "~") && (!typing || t === inputRef.current)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("solostack:terminal", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("solostack:terminal", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    if (!booted.current) {
      booted.current = true;
      print(
        out(BANNER, "banner"),
        out(`solostack shell v1.0 — ${new Date().toLocaleDateString()}`, "dim"),
        out("Type `help` to see what this thing can do. Tab completes. ↑ ↓ for history."),
        out(""),
      );
    }
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open, print]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines, open]);

  const go = (href: string) => {
    router.push(href);
  };

  const stackCmd = (args: string[]) => {
    const [sub, ...rest] = args;
    const onStackPage = path === "/stack";
    const emit = (action: string, ids?: string[]) =>
      window.dispatchEvent(new CustomEvent("solostack:stack", { detail: { action, ids } }));

    if (!sub) {
      const s = currentStack();
      if (!s.length) return [out("Your stack is just the foundation. Try `stack add helpdesk`.", "dim")];
      return [
        out("┌ your-org — stack"),
        ...[...s].reverse().map((id) => out(`│ ▤ ${moduleById(id)?.name}  (${id})`)),
        out("│ ▣ Core Platform  (foundation)"),
        out(`└ ${s.length + 1} blocks`),
      ];
    }
    if (sub === "add") {
      const ids = rest.filter((id) => moduleById(id));
      const bad = rest.filter((id) => !moduleById(id));
      const res: Line[] = bad.map((b) => out(`stack: unknown module '${b}' — try \`ls modules\``, "err"));
      if (!ids.length) return res.length ? res : [out("usage: stack add <id…>", "err")];
      if (onStackPage) emit("add", ids);
      else go(`/stack?s=${ids.join(",")}`);
      return [...res, out(`+ stacked ${ids.map((i) => moduleById(i)?.name).join(", ")}`, "ok")];
    }
    if (sub === "rm") {
      const id = rest[0];
      if (!id || !moduleById(id)) return [out("usage: stack rm <id>", "err")];
      if (!onStackPage) return [out("Nothing to pull — open the stack first (`open stack`).", "dim")];
      if (!currentStack().includes(id)) return [out(`stack: ${id} isn't in your stack`, "err")];
      emit("rm", [id]);
      return [out(`− pulled ${moduleById(id)?.name}. Watch it go.`, "ok")];
    }
    if (sub === "preset") {
      const p = PRESETS.find((x) => x.id === rest[0]);
      if (!p) return [out(`usage: stack preset <${PRESETS.map((x) => x.id).join("|")}>`, "err")];
      if (onStackPage) emit("set", p.modules);
      else go(`/stack?s=${p.modules.join(",")}`);
      return [out(`Loaded ${p.name}: ${p.blurb}`, "ok")];
    }
    if (sub === "clear") {
      if (onStackPage) emit("clear");
      return [out("Timber.", "ok")];
    }
    return [out(`stack: unknown subcommand '${sub}'`, "err")];
  };

  const run = (raw: string) => {
    const cmdline = raw.trim();
    print(out(`guest@solostack:${path}$ ${cmdline}`, "cmd"));
    if (!cmdline) return;
    setHist((h) => [...h.filter((x) => x !== cmdline), cmdline].slice(-50));
    setHIdx(-1);

    const [cmd, ...args] = cmdline.split(/\s+/);
    const res: Line[] = [];
    switch (cmd.toLowerCase()) {
      case "help":
        res.push(...HELP.map(([c, d]) => out(`  ${c.padEnd(26)} ${d}`)));
        break;
      case "ls": {
        const what = args[0] ?? "pages";
        if (what === "modules")
          res.push(...MODULES.map((m) => out(`  ${m.id.padEnd(12)} ${m.name}${m.requires ? `  ↳ needs ${m.requires.join(", ")}` : ""}`)));
        else if (what === "work")
          res.push(
            out("  staff-portal/    national relief org — HR, finance, helpdesk, programs"),
            out("  wisal/           2 sites + donor CRM dashboard on one database"),
            out("  thefyi/          content site rebuilt around one donor path"),
            out("  txbyt/           data-viz publishing platform"),
          );
        else if (what === "styles" || what === "themes")
          res.push(...STYLES.map((t) => out(`  ${t.id.padEnd(11)} ${t.tagline}  — ${t.forWho}`)));
        else res.push(...Object.entries(PAGES).map(([k, v]) => out(`  ${k.padEnd(10)} ${v}`)));
        break;
      }
      case "stack":
        res.push(...stackCmd(args));
        break;
      case "open":
      case "cd": {
        const target = (args[0] ?? "home").replace(/^\/+/, "") || "home";
        const href = PAGES[target];
        if (!href) res.push(out(`${cmd}: no such page '${target}' — try \`ls pages\``, "err"));
        else {
          go(href);
          res.push(out(`→ ${href}`, "ok"));
        }
        break;
      }
      case "demo":
        if ((args[0] ?? "helpdesk") === "helpdesk") {
          go("/demo/helpdesk");
          res.push(out("→ loading the helpdesk playground. Drag a ticket to Done.", "ok"));
        } else res.push(out("demo: only `demo helpdesk` exists (for now)", "err"));
        break;
      case "style":
      case "theme": {
        const t = STYLES.find((x) => x.id === args[0]);
        if (!t) res.push(out(`usage: style <${STYLES.map((x) => x.id).join("|")}>`, "err"));
        else {
          void switchStyle(t.id);
          res.push(out(`Style → ${t.name}. ${t.tagline} Same code, whole new look.`, "ok"));
        }
        break;
      }
      case "sound": {
        const on = args[0] ? args[0] === "on" : !getPrefs().sound;
        toggleSound(on);
        res.push(out(on ? "♪ sound on" : "sound off", "ok"));
        break;
      }
      case "xray": {
        const on = args[0] ? args[0] === "on" : !getPrefs().xray;
        setPrefs({ xray: on });
        res.push(out(on ? "X-ray on. Everything outlined is a component." : "X-ray off.", "ok"));
        break;
      }
      case "tour":
        setOpen(false);
        setTimeout(() => window.dispatchEvent(new Event("solostack:tour")), 150);
        return;
      case "book":
        go("/contact");
        res.push(out("→ /contact — free 30 minutes, no pitch.", "ok"));
        break;
      case "whoami":
        res.push(out("guest@your-org — probably juggling three spreadsheets and a SharePoint list. `book` fixes that."));
        break;
      case "about":
      case "cat":
        res.push(
          out("SoloStack — managed IT + custom platforms for mission-driven orgs. Houston, TX."),
          out("One partner runs your Microsoft 365 and builds the software your staff use daily."),
          out(`Your code in your GitHub. Your data in your database. ${SITE.email}`),
        );
        break;
      case "neofetch":
        res.push(
          out("   ▤▤▤▤▤      guest@solostack", "ok"),
          out("   ▤▤▤▤▤      ---------------"),
          out("   ▤▤▤▤▤      OS: Nonprofit OS (18 modules)"),
          out("   ▤▤▤▤▤      Host: Vercel"),
          out("   ▣▣▣▣▣      Kernel: Next.js 16 / React 19"),
          out("              DB: Supabase (yours)"),
          out("              Shell: solostack-sh 1.0"),
          out(`              Style: ${getPrefs().style}`),
          out("              Uptime: always on"),
        );
        break;
      case "history":
        res.push(...hist.map((h, i) => out(`  ${String(i + 1).padStart(3)}  ${h}`)));
        break;
      case "date":
        res.push(out(new Date().toString()));
        break;
      case "echo":
        res.push(out(args.join(" ")));
        break;
      case "clear":
        setLines([]);
        return;
      case "exit":
        setOpen(false);
        return;
      case "sudo":
        res.push(out("Permission denied: you're not on the managed IT plan yet. (`book` to upgrade)", "err"));
        break;
      case "rm":
        res.push(
          args.join(" ").includes("-rf")
            ? out("Blocked. We back up everything — that's kind of the point.", "err")
            : out("rm: did you mean `stack rm <id>`?", "err"),
        );
        break;
      case "vim":
      case "emacs":
        res.push(out("Not getting into that here. Press Esc to escape (unlike vim).", "dim"));
        break;
      default:
        res.push(out(`command not found: ${cmd} — try \`help\``, "err"));
    }
    if (res.some((r) => r.kind === "ok")) chime();
    print(...res);
  };

  const complete = () => {
    const parts = input.split(/\s+/);
    const last = parts[parts.length - 1];
    let pool: string[] = [];
    if (parts.length === 1) pool = COMMANDS;
    else if (parts[0] === "stack" && parts.length === 2) pool = ["add", "rm", "preset", "clear"];
    else if (parts[0] === "stack" && parts[1] === "preset") pool = PRESETS.map((p) => p.id);
    else if (parts[0] === "stack") pool = MODULES.map((m) => m.id);
    else if (parts[0] === "style" || parts[0] === "theme") pool = STYLES.map((t) => t.id);
    else if (parts[0] === "open" || parts[0] === "cd") pool = Object.keys(PAGES);
    else if (parts[0] === "ls") pool = ["modules", "work", "pages", "styles"];
    else if (["sound", "xray"].includes(parts[0])) pool = ["on", "off"];
    const hits = pool.filter((p) => p.startsWith(last));
    if (hits.length === 1) {
      parts[parts.length - 1] = hits[0];
      setInput(parts.join(" ") + " ");
    } else if (hits.length > 1) {
      print(out(`guest@solostack:${path}$ ${input}`, "cmd"), out("  " + hits.join("   "), "dim"));
    }
  };

  if (!open) return null;

  return (
    <div className="term" role="dialog" aria-modal="false" aria-label="SoloStack terminal">
      <div className="term-bar">
        <span>
          <i /> <i /> <i />
        </span>
        <span>guest@solostack — ~/{path.replace(/^\//, "")}</span>
        <button className="block-x" aria-label="Close terminal" onClick={() => setOpen(false)}>
          ×
        </button>
      </div>
      <div className="term-body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
        {lines.map((l, i) => (
          <pre key={i} className={`t-${l.kind}`}>
            {l.text}
          </pre>
        ))}
        <form
          className="term-input"
          onSubmit={(e) => {
            e.preventDefault();
            click(0.7);
            run(input);
            setInput("");
          }}
        >
          <label htmlFor="term-in" className="t-prompt">
            guest@solostack:{path}$
          </label>
          <input
            id="term-in"
            ref={inputRef}
            value={input}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => {
              setInput(e.target.value);
              key();
            }}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault();
                complete();
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                const i = hIdx < 0 ? hist.length - 1 : Math.max(0, hIdx - 1);
                if (hist[i] !== undefined) {
                  setHIdx(i);
                  setInput(hist[i]);
                }
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                if (hIdx < 0) return;
                const i = hIdx + 1;
                if (i >= hist.length) {
                  setHIdx(-1);
                  setInput("");
                } else {
                  setHIdx(i);
                  setInput(hist[i]);
                }
              } else if (e.key === "l" && e.ctrlKey) {
                e.preventDefault();
                setLines([]);
              }
            }}
          />
        </form>
      </div>
    </div>
  );
}
