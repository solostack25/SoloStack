// The five complete site styles. Same content and components — different design languages.
// Tokens + component overrides live in app/styles/<id>.css; this file is the catalog.

export const STYLES = [
  {
    id: "stack",
    name: "Stack",
    kind: "Technical",
    tagline: "Dark, precise, terminal-grade.",
    forWho: "Tech-forward brands, IT & data teams",
    // fonts the browser should have ready before switching (CSS font shorthand)
    fonts: ['700 40px "Rajdhani"', '400 16px "Inter"', '500 13px "JetBrains Mono"'],
    swatches: ["#070b0f", "#19e3c4", "#e6f1f0"],
  },
  {
    id: "editorial",
    name: "Editorial",
    kind: "Warm & trusted",
    tagline: "Paper, ink and a confident serif.",
    forWho: "Foundations, nonprofits, annual reports",
    fonts: ['500 40px "Fraunces"', 'italic 500 40px "Fraunces"', '400 16px "DM Sans"', '600 13px "DM Sans"'],
    swatches: ["#f4eee2", "#1f5c45", "#b07d2b"],
  },
  {
    id: "glass",
    name: "Glass",
    kind: "Product & SaaS",
    tagline: "Gradients, frosted glass, soft glow.",
    forWho: "Product launches, apps, startups",
    fonts: ['700 40px "Sora"', '400 16px "Plus Jakarta Sans"', '600 13px "Plus Jakarta Sans"'],
    swatches: ["#0b0820", "#8b7bff", "#36d6e7"],
  },
  {
    id: "brutal",
    name: "Brutal",
    kind: "Bold campaign",
    tagline: "Thick lines, hard shadows, loud type.",
    forWho: "Campaigns, causes, events",
    fonts: ['400 40px "Archivo Black"', '500 16px "Space Grotesk"', '700 13px "Space Mono"'],
    swatches: ["#f7f2e7", "#ffd23f", "#ff5ca8"],
  },
  {
    id: "playful",
    name: "Playful",
    kind: "Friendly community",
    tagline: "Round, bright and a little bouncy.",
    forWho: "Masjids, youth programs, communities",
    fonts: ['600 40px "Fredoka"', '500 16px "Nunito"', '800 13px "Nunito"'],
    swatches: ["#fff7ee", "#6c4cf1", "#ff7a59"],
  },
] as const;

export type StyleId = (typeof STYLES)[number]["id"];
export const STYLE_IDS = STYLES.map((s) => s.id) as StyleId[];
export const styleById = (id: string) => STYLES.find((s) => s.id === id);
