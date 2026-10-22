# SoloStack — solostack.us

Next.js rebuild of solostack.us. Dark / neon-teal theme, Rajdhani + Inter + JetBrains Mono.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Home — services, work, Nonprofit OS, why SoloStack, process, CTA |
| `/stack` | **Build Your Stack** — stack Nonprofit OS modules on the Core Platform foundation |
| `/contact` | Consult form; receives a stack from `/stack` and opens a prefilled email |

## Build Your Stack

- Modules, categories, presets and prices live in `lib/modules.ts`.
- Modules with `requires` pull their dependencies in automatically; removing a module topples everything sitting on it.
- Add by tapping **+ Add** or dragging a card onto the tower. Presets: Food Pantry, Masjid, Fundraising Engine, Back Office.
- The stack is encoded in the URL (`/stack?s=crm,campaigns&b=M`) so it can be shared, and is carried into `/contact`.
- **Pricing:** every module's `price` is `{ S: null, M: null, L: null }`, which shows "Custom quote". Fill in numbers per staff band (S under 25 / M 25–100 / L 100+) to show a live monthly estimate.

## Show-off features

| Feature | Where | Notes |
| --- | --- | --- |
| Physics stack | `/stack` · `components/PhysicsTower.tsx` | matter-js; Jenga pulls, toppling dependents; static fallback for reduced motion |
| Share image + link cards | `lib/stackImage.ts`, `app/api/og` | 1080×1350 PNG via Web Share; OG card per shared stack (Rajdhani in `assets/fonts`, OFL) |
| Terminal mode | press `~` anywhere · `components/Terminal.tsx` | `help`, `ls modules`, `stack add/rm/preset`, `theme`, `sound`, `xray`, `open`, `book`… |
| Scroll story | home · `components/ChaosToPortal.tsx` | six messy tools reassemble into a portal, driven by scroll position |
| X-ray mode | nav button · `components/XrayHud.tsx` | outlines every `data-x` component + live Web Vitals, FPS, JS/CSS shipped |
| Helpdesk playground | `/demo/helpdesk` · `components/HelpdeskBoard.tsx` | pointer drag & drop (mouse/touch), ← → keyboard moves, quest-mode points, simulated live tickets |
| Theme switcher | nav swatch · `lib/prefs.ts` | Teal / Navy & Gold / Emerald / Ember via CSS variables, no flash on load |
| Sound design | nav speaker · `lib/sound.ts` | Web Audio synthesized (no files), off by default |

To label a new component for X-ray, add `data-x="Name · detail"` to its root element.

## Dev

```bash
npm install
npm run dev
npm run build
```

Contact email and site copy: `lib/site.ts`.
