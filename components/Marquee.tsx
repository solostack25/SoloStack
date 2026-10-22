const ITEMS = [
  "Next.js",
  "Supabase",
  "Vercel",
  "Microsoft 365",
  "Entra ID",
  "Salesforce",
  "Stripe",
  "CharityStack",
  "Helpdesk",
  "Donor CRM",
  "Flat-rate pricing",
  "Houston TX",
];

// Each item is its own span; the active style draws the separator (/// · ★ ●) and sets the case.
export default function Marquee() {
  const run = (k: string) => (
    <span key={k}>
      {ITEMS.map((t) => (
        <span className="mq-i" key={t}>
          {t}
        </span>
      ))}
    </span>
  );
  return (
    <div className="marquee" aria-hidden="true" data-x="Marquee · pure CSS animation">
      <div className="marquee-track">{[run("a"), run("b")]}</div>
    </div>
  );
}
