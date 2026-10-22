import { BANDS, FOUNDATION, type Band, categoryById, moduleById } from "./modules";

const W = 1080;
const H = 1350; // 4:5 — the feed-friendly size for Instagram / LinkedIn

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function mix(hex: string, amount: number, base = "#0b1218") {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(hex);
  const [r2, g2, b2] = p(base);
  const m = (a: number, b: number) => Math.round(a * amount + b * (1 - amount));
  return `rgb(${m(r1, r2)}, ${m(g1, g2)}, ${m(b1, b2)})`;
}

function fit(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > max) t = t.slice(0, -1);
  return t + "…";
}

/** Draws a "My org's SoloStack" card for the given stack. */
export async function renderStackImage(stack: string[], band: Band, orgName?: string): Promise<Blob> {
  // make sure the brand fonts are ready before drawing text
  try {
    await Promise.all([
      document.fonts.load('700 96px "Rajdhani"'),
      document.fonts.load('500 24px "JetBrains Mono"'),
    ]);
  } catch {
    /* fall back to system fonts */
  }

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // background + grid
  ctx.fillStyle = "#070b0f";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(27, 39, 48, 0.7)";
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 36) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(W, y + 0.5);
    ctx.stroke();
  }
  const glow = ctx.createRadialGradient(W / 2, H - 120, 20, W / 2, H - 120, 620);
  glow.addColorStop(0, "rgba(25, 227, 196, 0.16)");
  glow.addColorStop(1, "rgba(25, 227, 196, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // header
  const PADX = 84;
  ctx.fillStyle = "#19e3c4";
  ctx.font = '500 24px "JetBrains Mono", monospace';
  ctx.textBaseline = "alphabetic";
  const bandInfo = BANDS.find((b) => b.id === band)!;
  ctx.fillText(`// ${stack.length + 1} BLOCKS · ${bandInfo.label.toUpperCase()} ORG`, PADX, 120);

  ctx.fillStyle = "#e6f1f0";
  ctx.font = '700 92px "Rajdhani", sans-serif';
  const title = orgName?.trim() ? `${orgName.trim().toUpperCase()}'S` : "MY ORG'S";
  ctx.fillText(fit(ctx, title, W - PADX * 2), PADX, 212);
  ctx.fillText("SOLO", PADX, 296);
  const soloW = ctx.measureText("SOLO").width;
  ctx.fillStyle = "#19e3c4";
  ctx.fillText("//", PADX + soloW, 296);
  const slashW = ctx.measureText("//").width;
  ctx.fillStyle = "#e6f1f0";
  ctx.fillText("STACK", PADX + soloW + slashW, 296);

  // tower, bottom-up
  const towerTop = 350;
  const towerBottom = H - 150;
  const blocks = stack.length + 1;
  const gap = 8;
  const bh = Math.min(70, Math.floor((towerBottom - towerTop - gap * blocks) / blocks));
  const bw = W - PADX * 2;
  const nameSize = Math.max(20, Math.min(34, bh * 0.5));
  const tagSize = Math.max(11, Math.min(15, bh * 0.22));
  // short stacks sit in the middle of the space instead of leaving a gap under the title
  const towerH = blocks * (bh + gap) + 8;
  let y = towerBottom - Math.max(0, towerBottom - towerTop - towerH) / 2;

  const drawBlock = (name: string, tag: string, color: string, isFoundation: boolean, i: number) => {
    const h = isFoundation ? bh + 8 : bh;
    // slight playful offset so it reads as a stacked tower
    const dx = isFoundation ? 0 : ((i * 37) % 17) - 8;
    const x = PADX + dx;
    y -= h;
    // drop shadow "ledge"
    ctx.fillStyle = isFoundation ? "#050809" : mix(color, 0.3, "#050809");
    roundRect(ctx, x, y + 6, bw, h, 4);
    ctx.fill();
    // face
    if (isFoundation) {
      ctx.save();
      roundRect(ctx, x, y, bw, h, 4);
      ctx.clip();
      ctx.fillStyle = "#0d161c";
      ctx.fillRect(x, y, bw, h);
      ctx.strokeStyle = "#111c23";
      ctx.lineWidth = 10;
      for (let s = -h; s < bw + h; s += 20) {
        ctx.beginPath();
        ctx.moveTo(x + s, y + h);
        ctx.lineTo(x + s + h, y);
        ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = "#2a3a44";
    } else {
      const g = ctx.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, mix(color, 0.24, "#0f1a21"));
      g.addColorStop(1, mix(color, 0.1));
      ctx.fillStyle = g;
      roundRect(ctx, x, y, bw, h, 4);
      ctx.fill();
      ctx.strokeStyle = mix(color, 0.6);
    }
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, bw, h, 4);
    ctx.stroke();
    // labels
    const textY = y + h / 2;
    ctx.fillStyle = isFoundation ? "#19e3c4" : color;
    ctx.font = `500 ${tagSize}px "JetBrains Mono", monospace`;
    ctx.textBaseline = "middle";
    const tagW = ctx.measureText(tag).width;
    ctx.fillText(tag, x + bw - 24 - tagW, textY);
    ctx.fillStyle = "#e6f1f0";
    ctx.font = `700 ${nameSize}px "Rajdhani", sans-serif`;
    ctx.fillText(fit(ctx, name, bw - tagW - 72), x + 24, textY + 1);
    y -= gap;
  };

  drawBlock(FOUNDATION.name, "FOUNDATION", "#e6f1f0", true, 0);
  stack.forEach((id, i) => {
    const m = moduleById(id);
    if (!m) return;
    const cat = categoryById(m.category);
    drawBlock(m.name, cat.name.toUpperCase(), cat.color, false, i + 1);
  });

  // footer
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#8fa3a8";
  ctx.font = '500 24px "JetBrains Mono", monospace';
  ctx.fillText("BUILD YOURS →", PADX, H - 64);
  ctx.fillStyle = "#19e3c4";
  const lead = ctx.measureText("BUILD YOURS → ").width;
  ctx.fillText("SOLOSTACK.US/STACK", PADX + lead, H - 64);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not render image"))), "image/png"),
  );
}
