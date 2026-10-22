import Link from "next/link";
import Marquee from "@/components/Marquee";
import ChaosToPortal from "@/components/ChaosToPortal";
import StyleShowcase from "@/components/StyleShowcase";
import { CATEGORIES, MODULES, categoryById } from "@/lib/modules";

const ORGS = [
  { name: "Staff Portal — national relief org", stack: "next.js · supabase · entra", status: "DEPLOYED" },
  { name: "Wisal Foundation", stack: "2 sites + dashboard · stripe", status: "DEPLOYED" },
  { name: "The FYI", stack: "next.js · vercel", status: "BUILD PASSED" },
  { name: "The Braid Inc", stack: "wordpress → next.js", status: "MIGRATING" },
  { name: "txbyt", stack: "data-viz publishing", status: "DEPLOYED" },
];

const SERVICES = [
  {
    num: "01",
    title: "Managed IT",
    body: "Your outsourced IT department. Microsoft 365 and Entra ID, helpdesk, onboarding and offboarding, patching, backups and vendor wrangling — handled for a flat monthly fee.",
    tags: ["M365", "ENTRA ID", "HELPDESK", "SECURITY"],
  },
  {
    num: "02",
    title: "Websites & Platforms",
    body: "Fast Next.js sites with giving built in — campaign pages, split-gift donations, matching gifts — that your staff edit from a dashboard, not a developer ticket.",
    tags: ["NEXT.JS", "VERCEL", "STRIPE", "CHARITYSTACK"],
  },
  {
    num: "03",
    title: "Nonprofit OS",
    body: "Staff-portal modules — helpdesk, donor CRM, finance approvals, client intake, training — on a database you own, connected to the Salesforce and Microsoft tools you already pay for.",
    tags: ["SUPABASE", "SALESFORCE", "MS GRAPH", "REPORTS"],
  },
];

const WORK = [
  {
    kind: "STAFF PORTAL · NATIONAL NONPROFIT",
    name: "Staff portal for a national relief organization",
    shot: "STAFF PORTAL",
    body: "One platform replacing SharePoint lists, Power Apps and spreadsheet cleanup across HR, finance, programs and IT.",
    points: [
      "2,662 helpdesk tickets migrated off SharePoint into a live workboard",
      "Onboarding creates real Microsoft Entra accounts",
      "Office data syncs to each food bank’s Salesforce — no double entry",
    ],
  },
  {
    kind: "WEBSITES + CRM",
    name: "Wisal Foundation",
    shot: "WISALFOUNDATION.ORG",
    body: "Two public sites and a central dashboard on one database — donors, campaigns and email in one place.",
    points: ["Donor CRM on their existing Stripe account", "Campaign pages staff build themselves", "“Follow your donation” update emails"],
  },
  {
    kind: "REBUILD",
    name: "The FYI",
    shot: "THEFYI.ORG",
    body: "A sprawling content site rebuilt around one clear path: find the toolkit, support the mission.",
    points: ["Simplified structure and navigation", "Interactive features that keep visitors exploring", "Donor-focused calls to action"],
  },
  {
    kind: "DATA PLATFORM",
    name: "txbyt",
    shot: "TXBYT",
    body: "A Visual Capitalist-style publishing platform with an infographic builder for a new media venture.",
    points: ["Runs on the client’s own Supabase", "Built-in chart suggestions", "Deployed on Vercel"],
  },
];

const WHY = [
  {
    title: "Built from the inside",
    body: "More than a decade running IT for a national nonprofit. We know grant reports, volunteer chaos and the five-person finance team because we’ve sat with them.",
  },
  {
    title: "You own everything",
    body: "Your code in your GitHub, your data in your database. No lock-in, no hostage invoices — walk away with it any time.",
  },
  {
    title: "One partner, full stack",
    body: "IT support and software under one roof. No blame-shifting between the IT vendor and the web agency.",
  },
  {
    title: "Flat, honest pricing",
    body: "Predictable monthly costs from day one. Start with one module; add more only when it pays off.",
  },
];

const STEPS = [
  { title: "Discover", body: "A free call and a walk through your tools to find the system that costs you the most hours." },
  { title: "Pilot", body: "One module or one site, live with real data in weeks — not a year-long project." },
  { title: "Launch", body: "Migration, staff training and handoff docs. Old systems retired cleanly." },
  { title: "Run", body: "We monitor, patch and improve from one command center, on a flat monthly plan." },
];

export default function Home() {
  const featured = ["helpdesk", "finance", "intake", "crm", "campaigns", "exec", "reports", "salesforce"]
    .map((id) => MODULES.find((m) => m.id === id)!)
    .filter(Boolean);

  return (
    <>
      {/* HERO */}
      <section className="container hero" style={{ padding: "96px 24px 80px" }} data-x="Hero · server component">
        <div className="hero-copy">
          <p className="eyebrow">Managed IT + custom platforms · Houston, TX</p>
          <h1 className="h1">
            Your IT department.
            <br />
            Your software team.
            <br />
            <span className="accent">One partner.</span>
          </h1>
          <p className="lead" style={{ marginTop: 28 }}>
            SoloStack runs the tech and builds the software for nonprofits, masjids and mission-driven organizations —
            from Microsoft 365 and helpdesk to donor-ready websites and staff portals you actually own.
          </p>
          <div className="hero-actions">
            <Link href="/contact" className="btn btn-primary">
              Book free 30-min consult
            </Link>
            <Link href="/stack" className="btn btn-ghost">
              Build your stack →
            </Link>
          </div>
        </div>

        <div className="console" data-x="CommandCenter · console" role="img" aria-label="The SoloStack Command Center showing client deployments">
          <div className="console-head">
            <span>solostack — command center</span>
            <span className="live">live</span>
          </div>
          <div style={{ padding: "8px 0" }}>
            {ORGS.map((o) => (
              <div className="console-row" key={o.name}>
                <div style={{ minWidth: 0 }}>
                  <span>{o.name}</span>
                  <small>{o.stack}</small>
                </div>
                <span className="console-ok">✓ {o.status}</span>
              </div>
            ))}
          </div>
          <div className="console-foot">$ one dashboard · every client · every app</div>
        </div>
      </section>

      <Marquee />

      <ChaosToPortal />

      {/* SERVICES */}
      <section id="services" className="container section" data-x="Services · CSS grid">
        <div className="section-head">
          <div>
            <p className="eyebrow">What we do</p>
            <h2 className="h2">
              Full stack.
              <br />
              Zero gaps.
            </h2>
          </div>
          <p>
            Most orgs juggle an IT vendor, a web agency and a pile of SaaS logins. We replace the juggling with one team
            that keeps the lights on and ships the tools.
          </p>
        </div>
        <div className="joined-grid cols-3">
          {SERVICES.map((s) => (
            <article className="service" key={s.num}>
              <span className="num">{s.num}</span>
              <h3 className="h3" style={{ fontSize: 30 }}>
                {s.title}
              </h3>
              <p>{s.body}</p>
              <div className="tags">
                {s.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* WORK */}
      <section id="work" className="container section" data-x="WorkGrid · auto-fit grid">
        <p className="eyebrow">Shipped, not pitched</p>
        <h2 className="h2" style={{ marginBottom: 48 }}>
          Built for orgs
          <br />
          that run on mission.
        </h2>
        <div className="work-grid">
          {WORK.map((w) => (
            <article className="work-card" key={w.name}>
              <div className="work-shot">[ SCREENSHOT — {w.shot} ]</div>
              <div className="work-body">
                <span className="work-kind">{w.kind}</span>
                <h3 className="h3" style={{ textTransform: "none" }}>
                  {w.name}
                </h3>
                <p>{w.body}</p>
                <ul className="arrow-list">
                  {w.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <StyleShowcase />

      {/* NONPROFIT OS */}
      <section id="platform" className="band" data-x="NonprofitOS · data from lib/modules.ts">
        <div className="container platform">
          <div className="platform-copy">
            <p className="eyebrow">Nonprofit OS</p>
            <h2 className="h2">
              The staff portal,
              <br />
              one module
              <br />
              at a time.
            </h2>
            <p className="muted" style={{ marginTop: 24 }}>
              The same platform running inside a national relief organization — broken into {MODULES.length} modules.
              Start with the one that hurts most. Stack the rest when it pays for itself.
            </p>
            <p style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text-2)" }}>
              Your Supabase. Your GitHub. Your data.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
              <Link href="/stack" className="btn btn-primary">
                ▤ Build your stack
              </Link>
              <Link data-tour="helpdesk-link" href="/demo/helpdesk" className="btn btn-ghost">
                Try the helpdesk →
              </Link>
            </div>
          </div>
          <div className="platform-grid">
            {featured.map((m) => (
              <div className="mod-card" key={m.id} style={{ ["--c" as string]: categoryById(m.category).color }}>
                <strong>{m.name}</strong>
                <span>{m.tagline}</span>
              </div>
            ))}
            <Link
              href="/stack"
              className="mod-card"
              style={{ ["--c" as string]: CATEGORIES[4].color, justifyContent: "center", color: "var(--text)" }}
            >
              <strong>+ {MODULES.length - featured.length} more →</strong>
              <span>See every module in the stack builder.</span>
            </Link>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section id="about" className="container section" data-x="WhySoloStack">
        <p className="eyebrow">Why SoloStack</p>
        <h2 className="h2" style={{ marginBottom: 48 }}>
          Built by someone
          <br />
          who&rsquo;s been your IT guy.
        </h2>
        <div className="why-grid">
          {WHY.map((y, i) => (
            <div className="why" key={y.title}>
              <span className="big">0{i + 1}</span>
              <strong>{y.title}</strong>
              <p>{y.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="container section">
        <p className="eyebrow">How it works</p>
        <div className="joined-grid cols-4" style={{ marginTop: 24 }} data-x="Process · 4-step grid">
          {STEPS.map((s, i) => (
            <div className="step" key={s.title}>
              <span className="num">STEP 0{i + 1}</span>
              <strong>{s.title}</strong>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ marginTop: 96 }}>
        <div className="cta" data-x="CallToAction">
          <div>
            <p className="eyebrow">Ready to stack up?</p>
            <h2 className="h2" style={{ fontSize: "clamp(34px, 4vw, 52px)" }}>
              Let&rsquo;s build something solid.
            </h2>
            <p>
              A free 30-minute call. Bring your messiest system — the spreadsheet everyone double-enters, the helpdesk
              nobody checks. We&rsquo;ll tell you honestly what we&rsquo;d fix first.
            </p>
          </div>
          <Link href="/contact" className="btn btn-primary">
            Book free consult →
          </Link>
        </div>
      </section>
    </>
  );
}
