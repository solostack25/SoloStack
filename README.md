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

## Dev

```bash
npm install
npm run dev
npm run build
```

Contact email and site copy: `lib/site.ts`.
