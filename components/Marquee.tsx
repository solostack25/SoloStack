const ITEMS = [
  "NEXT.JS",
  "SUPABASE",
  "VERCEL",
  "MICROSOFT 365",
  "ENTRA ID",
  "SALESFORCE",
  "STRIPE",
  "CHARITYSTACK",
  "HELPDESK",
  "DONOR CRM",
  "FLAT-RATE PRICING",
  "HOUSTON TX",
];

export default function Marquee() {
  const line = ITEMS.join(" /// ") + " /// ";
  return (
    <div className="marquee" aria-hidden="true" data-x="Marquee · pure CSS animation">
      <div className="marquee-track">
        <span>{line}</span>
        <span>{line}</span>
      </div>
    </div>
  );
}
