"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type MatterNS from "matter-js";
import { FOUNDATION, categoryById, moduleById } from "@/lib/modules";
import { thud, whoosh } from "@/lib/sound";

type Matter = typeof MatterNS;

type Props = {
  stack: string[];
  /** The block the user clicked × on — it slides out Jenga-style; anything else leaving topples. */
  pulledId: string | null;
  onRemove: (id: string) => void;
  onDropId: (id: string) => void;
};

type Item = { id: string; leaving: boolean };

// World constants (CSS px == physics units)
const BLOCK_H = 46;
const FOUND_H = 58;
const PAD = 28; // side gutter inside the zone
const SLACK = 8; // room each block has to shift/tilt before it touches a wall
const FLOOR = 4000; // physics y of the foundation's bottom edge
const BOTTOM_PAD = 20; // px between zone bottom and foundation
const MIN_H = 460;

const CAT_BLOCK = 0x0001;
const CAT_WALL = 0x0002;

const zoneHeightFor = (n: number) => Math.max(MIN_H, FOUND_H + n * (BLOCK_H + 2) + 230);

export default function PhysicsTower({ stack, pulledId, onRemove, onDropId }: Props) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Item[]>(() => stack.map((id) => ({ id, leaving: false })));
  const [width, setWidth] = useState(0);
  const [mode, setMode] = useState<"pending" | "physics" | "static">("pending");
  const [dragOver, setDragOver] = useState(false);

  const M = useRef<Matter | null>(null);
  const engine = useRef<MatterNS.Engine | null>(null);
  const bodies = useRef(new Map<string, MatterNS.Body>());
  const els = useRef(new Map<string, HTMLDivElement>());
  const walls = useRef<MatterNS.Body[]>([]);
  const foundation = useRef<MatterNS.Body | null>(null);
  const zoneH = useRef(zoneHeightFor(stack.length));
  const widthRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastThud = useRef(0);
  const lastSound = useRef(0);
  const flinging = useRef(new Set<string>());
  const stackRef = useRef(stack);
  stackRef.current = stack;

  const liveCount = items.filter((i) => !i.leaving).length;
  const height = zoneHeightFor(liveCount);
  zoneH.current = height;
  const blockW = Math.max(160, width - PAD * 2);

  // ── boot: decide mode, load matter, build the world ─────────────
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setMode("static");
      return;
    }
    let raf = 0;
    let cancelled = false;

    import("matter-js").then((mod) => {
      if (cancelled) return;
      const Matter = (mod as unknown as { default?: Matter }).default ?? (mod as unknown as Matter);
      M.current = Matter;
      const eng = Matter.Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8 });
      eng.gravity.y = 1.15;
      engine.current = eng;

      Matter.Events.on(eng, "collisionStart", (ev) => {
        for (const pair of ev.pairs) {
          const speed = Math.max(pair.bodyA.speed, pair.bodyB.speed);
          // audible landing (throttled so a settling pile doesn't machine-gun)
          if (speed > 2.2 && performance.now() - lastSound.current > 70) {
            lastSound.current = performance.now();
            thud(speed / 11);
          }
          // a heavy landing shakes the zone a little
          if (speed > 6 && performance.now() - lastThud.current > 180) {
            lastThud.current = performance.now();
            const z = zoneRef.current;
            if (z) {
              z.classList.remove("shake");
              void z.offsetWidth;
              z.classList.add("shake");
            }
            break;
          }
        }
      });

      setMode("physics");

      let last = performance.now();
      let acc = 0;
      const STEP = 1000 / 60;
      const frame = (t: number) => {
        acc += Math.min(t - last, 100);
        last = t;
        while (acc >= STEP) {
          Matter.Engine.update(eng, STEP);
          acc -= STEP;
        }
        const offset = zoneH.current - BOTTOM_PAD - FLOOR;
        bodies.current.forEach((b, id) => {
          const el = els.current.get(id);
          if (!el) return;
          const w = el.offsetWidth;
          el.style.transform = `translate(${b.position.x - w / 2}px, ${b.position.y + offset - BLOCK_H / 2}px) rotate(${b.angle}rad)`;
          el.style.visibility = "visible";
        });
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.current.forEach(clearTimeout);
      timers.current = [];
      if (engine.current && M.current) {
        M.current.Composite.clear(engine.current.world, false);
        M.current.Engine.clear(engine.current);
      }
      engine.current = null;
      bodies.current.clear();
      walls.current = [];
      foundation.current = null;
    };
  }, []);

  // ── measure the zone width ──────────────────────────────────────
  useLayoutEffect(() => {
    const z = zoneRef.current;
    if (!z) return;
    const ro = new ResizeObserver(() => setWidth(z.clientWidth));
    ro.observe(z);
    setWidth(z.clientWidth);
    return () => ro.disconnect();
  }, []);

  // ── (re)build the static world when width is known / changes ───
  useEffect(() => {
    const Matter = M.current;
    const eng = engine.current;
    if (mode !== "physics" || !Matter || !eng || width === 0) return;
    if (Math.abs(widthRef.current - width) < 4 && foundation.current) return;
    widthRef.current = width;

    const bw = Math.max(160, width - PAD * 2);
    const cx = width / 2;

    // statics
    if (foundation.current) Matter.Composite.remove(eng.world, foundation.current);
    walls.current.forEach((w) => Matter.Composite.remove(eng.world, w));
    const wallOpts = { isStatic: true, friction: 0.2, collisionFilter: { category: CAT_WALL, mask: CAT_BLOCK } };
    walls.current = [
      Matter.Bodies.rectangle(cx - bw / 2 - SLACK - 50, FLOOR - 3000, 100, 6000, wallOpts),
      Matter.Bodies.rectangle(cx + bw / 2 + SLACK + 50, FLOOR - 3000, 100, 6000, wallOpts),
    ];
    foundation.current = Matter.Bodies.rectangle(cx, FLOOR - FOUND_H / 2, bw, FOUND_H, {
      isStatic: true,
      friction: 1,
      collisionFilter: { category: CAT_BLOCK, mask: CAT_BLOCK },
    });
    Matter.Composite.add(eng.world, [...walls.current, foundation.current]);

    // re-seat existing blocks at rest at the new width (no drop on resize)
    const live = [...bodies.current.entries()];
    live.forEach(([, b]) => Matter.Composite.remove(eng.world, b));
    bodies.current.clear();
    let y = FLOOR - FOUND_H;
    stack.forEach((id) => {
      if (!live.some(([lid]) => lid === id)) return;
      const b = makeBlock(Matter, cx, y - BLOCK_H / 2 - 1, bw, 0);
      Matter.Composite.add(eng.world, b);
      bodies.current.set(id, b);
      y -= BLOCK_H + 1;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, width]);

  // ── diff the stack prop against what's in the world ─────────────
  useEffect(() => {
    // keep the render list in sync (leaving items linger until their fling ends)
    setItems((cur) => {
      const next: Item[] = cur.map((it) => (stack.includes(it.id) ? { ...it, leaving: false } : { ...it, leaving: true }));
      stack.forEach((id) => {
        if (!next.some((n) => n.id === id)) next.push({ id, leaving: false });
      });
      return next;
    });

    const Matter = M.current;
    const eng = engine.current;
    if (mode !== "physics" || !Matter || !eng || !foundation.current) {
      // static mode / not booted yet: just drop leaving items
      const t = setTimeout(() => setItems((cur) => cur.filter((i) => stack.includes(i.id))), 0);
      timers.current.push(t);
      return;
    }

    const cx = widthRef.current / 2;
    const bw = Math.max(160, widthRef.current - PAD * 2);

    // leaving → fling (once per body)
    const gone = [...bodies.current.keys()].filter((id) => !stack.includes(id) && !flinging.current.has(id));
    gone.forEach((id) => {
      const b = bodies.current.get(id)!;
      flinging.current.add(id);
      Matter.Body.set(b, "collisionFilter", { group: 0, category: CAT_BLOCK, mask: 0 });
      Matter.Sleeping.set(b, false);
      if (id === pulledId) {
        // Jenga pull: slide straight out
        whoosh();
        Matter.Body.setVelocity(b, { x: 17, y: -1 });
        Matter.Body.setAngularVelocity(b, 0.01);
      } else {
        if (gone.length < 4 || gone.indexOf(id) === 0) whoosh(true);
        const dir = Math.random() < 0.5 ? -1 : 1;
        Matter.Body.setVelocity(b, { x: dir * (5 + Math.random() * 6), y: -6 - Math.random() * 5 });
        Matter.Body.setAngularVelocity(b, dir * (0.08 + Math.random() * 0.12));
      }
      const t = setTimeout(() => {
        Matter.Composite.remove(eng.world, b);
        flinging.current.delete(id);
        if (bodies.current.get(id) === b) bodies.current.delete(id);
        setItems((cur) => cur.filter((i) => i.id !== id || stackRef.current.includes(id)));
      }, 1100);
      timers.current.push(t);
    });
    // anything resting on a removed block must wake up and fall
    if (gone.length) bodies.current.forEach((b) => Matter.Sleeping.set(b, false));

    // new → spawn above the zone, staggered so presets rain in.
    // A block re-added while it's still flying out gets a fresh body.
    const fresh = stack.filter((id) => !bodies.current.has(id) || flinging.current.has(id));
    fresh.forEach((id) => {
      if (flinging.current.has(id)) bodies.current.delete(id); // old body finishes its fling untracked
    });
    fresh.forEach((id, i) => {
      const spawn = () => {
        if (!engine.current || bodies.current.has(id)) return;
        const topEdge = FLOOR - (zoneH.current - BOTTOM_PAD); // physics y of the zone's top
        const tilt = (Math.random() - 0.5) * 0.12;
        const jitter = (Math.random() - 0.5) * SLACK * 1.4;
        const b = makeBlock(Matter, cx + jitter, topEdge - BLOCK_H, bw, tilt);
        Matter.Body.setVelocity(b, { x: 0, y: 4 });
        Matter.Composite.add(eng.world, b);
        bodies.current.set(id, b);
      };
      if (i === 0) spawn();
      else timers.current.push(setTimeout(spawn, i * 150));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stack, mode, width]);

  const isEmpty = liveCount === 0;

  return (
    <div
      ref={zoneRef}
      className={`tower-zone phys-zone${dragOver ? " drag-over" : ""}${mode === "static" ? " static" : ""}`}
      style={{ height: mode === "static" ? undefined : height }}
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
        if (id) onDropId(id);
      }}
      aria-label="Your stack. Modules stack from the foundation up."
      data-x="PhysicsTower · matter-js @ 60fps"
    >
      {mode === "static" ? (
        <>
          <div className="block foundation">
            <div className="block-left">
              <small>FOUNDATION · ALWAYS INCLUDED</small>
              <strong>{FOUNDATION.name}</strong>
            </div>
          </div>
          {stack.map((id) => (
            <BlockFace key={id} id={id} onRemove={onRemove} />
          ))}
        </>
      ) : (
        <>
          <div
            className="block foundation phys"
            style={{ width: blockW, left: PAD, top: height - BOTTOM_PAD - FOUND_H }}
            title={FOUNDATION.features.join(" · ")}
          >
            <div className="block-left">
              <small>FOUNDATION · ALWAYS INCLUDED</small>
              <strong>{FOUNDATION.name}</strong>
            </div>
          </div>
          {items.map((it) => (
            <BlockFace
              key={it.id}
              id={it.id}
              onRemove={onRemove}
              leaving={it.leaving}
              width={blockW}
              refCb={(el) => {
                if (el) els.current.set(it.id, el);
                else els.current.delete(it.id);
              }}
            />
          ))}
        </>
      )}

      {isEmpty && (
        <div className="tower-empty">
          <span>
            DROP MODULES HERE
            <br />↓ THEY STACK ON THE FOUNDATION ↓
          </span>
        </div>
      )}
      <span className="tower-ruler" aria-hidden="true">
        HEIGHT {String(liveCount + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

function makeBlock(Matter: Matter, x: number, y: number, w: number, angle: number) {
  return Matter.Bodies.rectangle(x, y, w, BLOCK_H, {
    angle,
    friction: 0.9,
    frictionStatic: 1.2,
    frictionAir: 0.012,
    restitution: 0.04,
    density: 0.002,
    chamfer: { radius: 2 },
    sleepThreshold: 40,
    collisionFilter: { category: CAT_BLOCK, mask: CAT_BLOCK | CAT_WALL },
  });
}

function BlockFace({
  id,
  onRemove,
  leaving = false,
  width,
  refCb,
}: {
  id: string;
  onRemove: (id: string) => void;
  leaving?: boolean;
  width?: number;
  refCb?: (el: HTMLDivElement | null) => void;
}) {
  const m = moduleById(id);
  if (!m) return null;
  const cat = categoryById(m.category);
  const physics = width !== undefined;
  return (
    <div
      ref={refCb}
      className={`block${physics ? " phys" : ""}${leaving ? " leaving" : ""}`}
      style={{
        ["--c" as string]: cat.color,
        ...(physics ? { width, visibility: "hidden" as const } : {}),
      }}
      aria-hidden={leaving || undefined}
    >
      <div className="block-left">
        <small>{cat.name}</small>
        <strong>{m.name}</strong>
      </div>
      {!leaving && (
        <button className="block-x" onClick={() => onRemove(id)} aria-label={`Pull ${m.name} out of the stack`}>
          ×
        </button>
      )}
    </div>
  );
}
