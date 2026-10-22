"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { chime, click, thud, whoosh } from "@/lib/sound";

// A playable copy of the portal's IT Helpdesk workboard on demo data.
// Pointer-event drag & drop (mouse + touch), keyboard moves, quest-mode points.
// State lives in this browser only.

type ColId = "new" | "doing" | "waiting" | "done";
type Priority = "Low" | "Medium" | "High" | "Urgent";
type Ticket = { id: number; title: string; dept: string; who: string; pri: Priority; age: string; col: ColId };

const COLS: { id: ColId; name: string }[] = [
  { id: "new", name: "New" },
  { id: "doing", name: "In progress" },
  { id: "waiting", name: "Waiting on user" },
  { id: "done", name: "Done" },
];

const POINTS: Record<Priority, number> = { Low: 10, Medium: 20, High: 35, Urgent: 50 };
const PRI_COLOR: Record<Priority, string> = { Low: "#8fa3a8", Medium: "#3FA9F5", High: "#F2B33A", Urgent: "#FF7A8A" };

const SEED: Ticket[] = [
  { id: 1041, title: "New hire laptop — starts Monday", dept: "HR", who: "AK", pri: "High", age: "2h", col: "new" },
  { id: 1042, title: "Pantry barcode scanner offline", dept: "Programs", who: "MR", pri: "Urgent", age: "20m", col: "new" },
  { id: 1043, title: "Printer on 2nd floor jamming (again)", dept: "Admin", who: "JL", pri: "Low", age: "1d", col: "new" },
  { id: 1044, title: "Reset MFA for volunteer coordinator", dept: "Volunteers", who: "SH", pri: "Medium", age: "45m", col: "doing" },
  { id: 1045, title: "Donation receipt emails bouncing", dept: "Development", who: "NB", pri: "High", age: "3h", col: "doing" },
  { id: 1046, title: "Zoom room for Thursday's board meeting", dept: "Executive", who: "FA", pri: "Medium", age: "5h", col: "waiting" },
  { id: 1047, title: "Adobe license request", dept: "Marketing", who: "TC", pri: "Low", age: "2d", col: "waiting" },
  { id: 1048, title: "Wi-Fi drops in the warehouse", dept: "Operations", who: "DW", pri: "High", age: "1d", col: "done" },
];

const ARRIVALS: Omit<Ticket, "col" | "id" | "age">[] = [
  { title: "Can't open the shared drive", dept: "Finance", who: "RA", pri: "Medium" },
  { title: "Phone extension not ringing", dept: "Programs", who: "LO", pri: "Low" },
  { title: "Suspicious email — clicked a link?", dept: "Development", who: "YK", pri: "Urgent" },
  { title: "Set up laptop for summer intern", dept: "HR", who: "BE", pri: "Medium" },
];

const TEAM = [
  { name: "Aisha", pts: 340 },
  { name: "Marcus", pts: 285 },
  { name: "Dana", pts: 190 },
];

const LEVELS = [
  { at: 0, name: "Tier 1 Tech" },
  { at: 60, name: "Fixer" },
  { at: 150, name: "Sysadmin" },
  { at: 300, name: "Network Wizard" },
  { at: 500, name: "Legend of the Server Room" },
];

const KEY = "solostack:helpdesk-demo";

type Drag = { id: number; dx: number; dy: number; x: number; y: number; w: number; startX: number; startY: number; active: boolean };
type Burst = { key: number; x: number; y: number; text: string };

export default function HelpdeskBoard() {
  const [tickets, setTickets] = useState<Ticket[]>(SEED);
  const [points, setPoints] = useState(0);
  const [quest, setQuest] = useState(true);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [overCol, setOverCol] = useState<ColId | null>(null);
  const [overCard, setOverCard] = useState<number | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [toast, setToast] = useState("");
  const [arrived, setArrived] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const [newPri, setNewPri] = useState<Priority>("Medium");
  const [fresh, setFresh] = useState<number | null>(null);
  const loaded = useRef(false);
  const nextId = useRef(1049);
  const cardEls = useRef(new Map<number, HTMLElement>());

  // restore / persist (this browser only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw) as { tickets: Ticket[]; points: number; quest: boolean; arrived: number };
        if (Array.isArray(s.tickets)) setTickets(s.tickets);
        setPoints(s.points ?? 0);
        setQuest(s.quest ?? true);
        setArrived(s.arrived ?? 0);
        nextId.current = Math.max(1049, ...s.tickets.map((t) => t.id + 1));
      }
    } catch {
      /* ignore */
    }
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ tickets, points, quest, arrived }));
    } catch {
      /* ignore */
    }
  }, [tickets, points, quest, arrived]);

  const say = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? "" : t)), 3200);
  }, []);

  // simulated realtime: a few new tickets trickle in while you play
  useEffect(() => {
    if (arrived >= ARRIVALS.length) return;
    const t = window.setTimeout(() => {
      const a = ARRIVALS[arrived];
      const id = nextId.current++;
      setTickets((cur) => [{ ...a, id, age: "just now", col: "new" }, ...cur]);
      setArrived((n) => n + 1);
      setFresh(id);
      thud(0.35);
      say(`Live: new ticket #${id} from ${a.dept}`);
    }, 18000 + arrived * 9000);
    return () => clearTimeout(t);
  }, [arrived, say]);

  const reward = (t: Ticket, at?: { x: number; y: number }) => {
    if (!quest) return;
    const gained = POINTS[t.pri];
    const before = points;
    const after = before + gained;
    setPoints(after);
    chime();
    const el = cardEls.current.get(t.id);
    const r = el?.getBoundingClientRect();
    const pos = at ?? (r ? { x: r.left + r.width / 2, y: r.top } : { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const key = Date.now() + Math.random();
    setBursts((b) => [...b, { key, x: pos.x, y: pos.y, text: `+${gained}` }]);
    window.setTimeout(() => setBursts((b) => b.filter((x) => x.key !== key)), 1100);
    const lvl = (p: number) => [...LEVELS].reverse().find((l) => p >= l.at)!;
    if (lvl(after).name !== lvl(before).name) say(`Level up — you're now a ${lvl(after).name}!`);
  };

  const move = (id: number, col: ColId, beforeId?: number | null, at?: { x: number; y: number }) => {
    const t = tickets.find((x) => x.id === id);
    if (!t) return;
    const wasDone = t.col === "done";
    setTickets((cur) => {
      const rest = cur.filter((x) => x.id !== id);
      const moved = { ...t, col };
      const idx = beforeId != null ? rest.findIndex((x) => x.id === beforeId) : -1;
      if (idx >= 0) rest.splice(idx, 0, moved);
      else {
        // append after the last card in that column
        let last = -1;
        rest.forEach((x, i) => x.col === col && (last = i));
        rest.splice(last + 1, 0, moved);
      }
      return rest;
    });
    if (col === "done" && !wasDone) reward(t, at);
    else if (col !== t.col) click(1.1);
  };

  const nextCol = (c: ColId): ColId => COLS[Math.min(COLS.length - 1, COLS.findIndex((x) => x.id === c) + 1)].id;
  const prevCol = (c: ColId): ColId => COLS[Math.max(0, COLS.findIndex((x) => x.id === c) - 1)].id;

  // ── pointer drag ──────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent, t: Ticket) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (e.button !== 0) return;
    e.preventDefault(); // no text selection while dragging
    (e.currentTarget as HTMLElement).focus({ preventScroll: true });
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({
      id: t.id,
      dx: e.clientX - r.left,
      dy: e.clientY - r.top,
      x: e.clientX,
      y: e.clientY,
      w: r.width,
      startX: e.clientX,
      startY: e.clientY,
      active: false,
    });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const moved = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 6;
    if (!drag.active && !moved) return;
    if (!drag.active) click(0.6);
    setDrag({ ...drag, x: e.clientX, y: e.clientY, active: true });
    const under = document.elementsFromPoint(e.clientX, e.clientY);
    const colEl = under.find((el) => (el as HTMLElement).dataset?.col) as HTMLElement | undefined;
    const cardEl = under.find((el) => (el as HTMLElement).dataset?.card && Number((el as HTMLElement).dataset.card) !== drag.id) as
      | HTMLElement
      | undefined;
    setOverCol((colEl?.dataset.col as ColId) ?? null);
    setOverCard(cardEl ? Number(cardEl.dataset.card) : null);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag) return;
    if (drag.active && overCol) move(drag.id, overCol, overCard, { x: e.clientX, y: e.clientY });
    setDrag(null);
    setOverCol(null);
    setOverCard(null);
  };

  const addTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    const id = nextId.current++;
    setTickets((cur) => [{ id, title, dept: "You", who: "ME", pri: newPri, age: "just now", col: "new" }, ...cur]);
    setFresh(id);
    setNewTitle("");
    whoosh(true);
    say(`Ticket #${id} created.`);
  };

  const reset = () => {
    setTickets(SEED);
    setPoints(0);
    setArrived(0);
    nextId.current = 1049;
    whoosh();
    say("Board reset to demo data.");
  };

  const lvl = [...LEVELS].reverse().find((l) => points >= l.at)!;
  const nextLvl = LEVELS.find((l) => l.at > points);
  const progress = nextLvl ? (points - lvl.at) / (nextLvl.at - lvl.at) : 1;
  const board = [...TEAM, { name: "You", pts: points }].sort((a, b) => b.pts - a.pts);
  const dragged = drag?.active ? tickets.find((t) => t.id === drag.id) : null;
  const openCount = tickets.filter((t) => t.col !== "done").length;

  return (
    <div className={`hd${quest ? " quest" : ""}`} data-x="HelpdeskBoard · pointer-event drag & drop">
      <div className="hd-toolbar">
        <div className="hd-stats">
          <span>
            <b>{openCount}</b> open
          </span>
          <span>
            <b>{tickets.filter((t) => t.col === "done").length}</b> closed
          </span>
          <span className="live">live</span>
        </div>
        <div className="hd-actions">
          <label className="hd-toggle">
            <input
              type="checkbox"
              checked={quest}
              onChange={(e) => {
                setQuest(e.target.checked);
                click(e.target.checked ? 1.3 : 0.8);
              }}
            />
            <span>Quest mode</span>
          </label>
          <button className="btn btn-ghost btn-sm" onClick={reset}>
            Reset
          </button>
        </div>
      </div>

      {quest && (
        <div className="hd-quest" aria-label="Quest progress">
          <div className="hd-level">
            <span className="hd-level-name">{lvl.name}</span>
            <span className="hd-pts">{points} pts</span>
            <div className="hd-xp" aria-hidden="true">
              <span style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="hd-next">{nextLvl ? `${nextLvl.at - points} pts to ${nextLvl.name}` : "Max level. Respect."}</span>
          </div>
          <ol className="hd-leader">
            {board.map((p, i) => (
              <li key={p.name} className={p.name === "You" ? "you" : undefined}>
                <span>{i + 1}</span>
                {p.name}
                <b>{p.pts}</b>
              </li>
            ))}
          </ol>
        </div>
      )}

      <form className="hd-new" onSubmit={addTicket}>
        <label htmlFor="hd-title" className="sr-only">
          New ticket title
        </label>
        <input
          id="hd-title"
          placeholder="+ New ticket — e.g. “Outlook keeps asking for my password”"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          maxLength={80}
        />
        <label htmlFor="hd-pri" className="sr-only">
          Priority
        </label>
        <select id="hd-pri" value={newPri} onChange={(e) => setNewPri(e.target.value as Priority)}>
          {(Object.keys(POINTS) as Priority[]).map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <button className="btn btn-primary btn-sm" type="submit">
          Create
        </button>
      </form>

      <p className="hd-hint">Drag cards between columns (or focus a card and use ← →). Close tickets to score.</p>

      <div className="hd-board" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        {COLS.map((c) => {
          const list = tickets.filter((t) => t.col === c.id);
          return (
            <section
              key={c.id}
              className={`hd-col${overCol === c.id && drag?.active ? " over" : ""}`}
              data-col={c.id}
              aria-label={`${c.name}, ${list.length} tickets`}
            >
              <header>
                <span>{c.name}</span>
                <b>{list.length}</b>
              </header>
              <div className="hd-list">
                {list.map((t) => (
                  <article
                    key={t.id}
                    ref={(el) => {
                      if (el) cardEls.current.set(t.id, el);
                      else cardEls.current.delete(t.id);
                    }}
                    data-card={t.id}
                    tabIndex={0}
                    aria-label={`#${t.id} ${t.title}, ${t.pri} priority, ${c.name}`}
                    className={`hd-card${drag?.active && drag.id === t.id ? " ghosted" : ""}${
                      overCard === t.id && drag?.active ? " insert" : ""
                    }${fresh === t.id ? " fresh" : ""}${t.col === "done" ? " closed" : ""}`}
                    style={{ ["--p" as string]: PRI_COLOR[t.pri] }}
                    onPointerDown={(e) => onPointerDown(e, t)}
                    onAnimationEnd={() => fresh === t.id && setFresh(null)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight") {
                        e.preventDefault();
                        move(t.id, nextCol(t.col));
                      } else if (e.key === "ArrowLeft") {
                        e.preventDefault();
                        move(t.id, prevCol(t.col));
                      }
                    }}
                  >
                    <TicketFace t={t} quest={quest} />
                    {t.col !== "done" && (
                      <button
                        className="hd-advance"
                        aria-label={`Move #${t.id} to ${COLS.find((x) => x.id === nextCol(t.col))?.name}`}
                        onClick={() => move(t.id, nextCol(t.col))}
                      >
                        →
                      </button>
                    )}
                  </article>
                ))}
                {list.length === 0 && <div className="hd-empty">Drop here</div>}
              </div>
            </section>
          );
        })}
      </div>

      {dragged && drag && (
        <div className="hd-card hd-floating" style={{ ["--p" as string]: PRI_COLOR[dragged.pri], width: drag.w, left: drag.x - drag.dx, top: drag.y - drag.dy }} aria-hidden="true">
          <TicketFace t={dragged} quest={quest} />
        </div>
      )}

      {bursts.map((b) => (
        <span key={b.key} className="hd-burst" style={{ left: b.x, top: b.y }} aria-hidden="true">
          {b.text}
          {Array.from({ length: 10 }).map((_, i) => (
            <i key={i} style={{ ["--a" as string]: `${i * 36}deg`, ["--d" as string]: `${30 + (i % 3) * 14}px` }} />
          ))}
        </span>
      ))}

      <p className="toast hd-toast" role="status" aria-live="polite">
        {toast}
      </p>
    </div>
  );
}

function TicketFace({ t, quest }: { t: Ticket; quest: boolean }) {
  return (
    <>
      <div className="hd-meta">
        <span>#{t.id}</span>
        <span className="hd-pri">{t.pri}</span>
        {quest && t.col !== "done" && <span className="hd-reward">+{POINTS[t.pri]}</span>}
      </div>
      <strong>{t.title}</strong>
      <div className="hd-foot">
        <span className="hd-who">{t.who}</span>
        <span>{t.dept}</span>
        <span>· {t.age}</span>
      </div>
    </>
  );
}
