import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BANDS, FOUNDATION, categoryById, moduleById, type Band } from "@/lib/modules";

let fonts: Promise<[Buffer, Buffer]> | null = null;
const loadFonts = () =>
  (fonts ??= Promise.all([
    readFile(join(process.cwd(), "assets/fonts/rajdhani-700.woff")),
    readFile(join(process.cwd(), "assets/fonts/rajdhani-600.woff")),
  ]));

// Link-preview card for a shared stack: /api/og?s=crm,campaigns&b=M
export async function GET(req: Request) {
  const [bold, semi] = await loadFonts();
  const { searchParams } = new URL(req.url);
  const ids = (searchParams.get("s") ?? "")
    .split(",")
    .filter((id) => moduleById(id))
    .slice(0, 18);
  const band = (["S", "M", "L"].includes(searchParams.get("b") ?? "") ? searchParams.get("b") : "M") as Band;
  const bandInfo = BANDS.find((b) => b.id === band)!;

  const blocks = [
    { name: FOUNDATION.name, color: "#2a3a44", tag: "FOUNDATION" },
    ...ids.map((id) => {
      const m = moduleById(id)!;
      const c = categoryById(m.category);
      return { name: m.name, color: c.color, tag: c.name.toUpperCase() };
    }),
  ];
  const n = blocks.length;
  const h = Math.min(52, Math.floor(500 / n) - 6);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#070b0f",
          color: "#e6f1f0",
          padding: 56,
          fontFamily: "Rajdhani",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 470 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: "#19e3c4", fontSize: 22, letterSpacing: 3 }}>
              {`// ${n} BLOCKS · ${bandInfo.label.toUpperCase()} ORG`}
            </div>
            <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 0.95, marginTop: 24 }}>MY ORG&apos;S</div>
            <div style={{ display: "flex", fontSize: 92, fontWeight: 700, lineHeight: 0.95 }}>
              <span>SOLO</span>
              <span style={{ color: "#19e3c4" }}>//</span>
              <span>STACK</span>
            </div>
            <div style={{ fontSize: 26, color: "#a9bbc0", marginTop: 28, lineHeight: 1.35 }}>
              Nonprofit OS modules, stacked on a foundation we own.
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#8fa3a8" }}>
            BUILD YOURS AT<span style={{ color: "#19e3c4", marginLeft: 10 }}>SOLOSTACK.US/STACK</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column-reverse",
            justifyContent: "flex-start",
            flexGrow: 1,
            marginLeft: 40,
          }}
        >
          {blocks.map((b, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: i === 0 ? h + 8 : h,
                marginTop: 6,
                padding: "0 18px",
                background: i === 0 ? "#0f1a21" : "#0b1218",
                border: `2px solid ${b.color}`,
                borderLeft: `8px solid ${b.color}`,
                fontSize: Math.max(16, Math.min(26, h * 0.48)),
                fontWeight: 700,
              }}
            >
              <span>{b.name}</span>
              <span style={{ fontSize: 13, color: i === 0 ? "#19e3c4" : b.color, letterSpacing: 2 }}>{b.tag}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Rajdhani", data: bold, weight: 700, style: "normal" },
        { name: "Rajdhani", data: semi, weight: 600, style: "normal" },
      ],
    },
  );
}
