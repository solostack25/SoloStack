// The Nonprofit OS module catalog — the ICNA Relief staff portal broken into
// stackable pieces. Edit this file to add modules, change copy, or set prices.

export type CategoryId = "ops" | "programs" | "fundraising" | "leadership" | "add-ons";

export type Category = {
  id: CategoryId;
  name: string;
  color: string; // block accent
};

export const CATEGORIES: Category[] = [
  { id: "ops", name: "Operations", color: "#19E3C4" },
  { id: "programs", name: "Programs", color: "#3FA9F5" },
  { id: "fundraising", name: "Fundraising & Comms", color: "#F2B33A" },
  { id: "leadership", name: "Leadership", color: "#B98CFF" },
  { id: "add-ons", name: "Add-ons", color: "#FF7A8A" },
];

export type Module = {
  id: string;
  name: string;
  category: CategoryId;
  tagline: string;
  features: string[];
  /** Modules that must be in the stack first. Added automatically. */
  requires?: string[];
  /** Monthly price per staff band. Leave null to show "Quote". */
  price: { S: number | null; M: number | null; L: number | null };
};

/** The foundation every stack sits on. Always included. */
export const FOUNDATION = {
  id: "core",
  name: "Core Platform",
  tagline: "Microsoft sign-in, roles, staff directory and the installable phone app.",
  features: [
    "Single sign-on with Microsoft Entra ID",
    "Role-based access per office and region",
    "Employee directory synced from Active Directory",
    "Installable app on iPhone and Android",
    "Your own Supabase database and GitHub repo",
  ],
};

const TBD = { S: null, M: null, L: null };

export const MODULES: Module[] = [
  // ── Operations ────────────────────────────────────────────────
  {
    id: "helpdesk",
    name: "IT Helpdesk",
    category: "ops",
    tagline: "Tickets, cross-department handoffs and a live drag-and-drop workboard.",
    features: [
      "Requests that hand off between departments",
      "Trello-style workboard with live updates",
      "Gamified IT mode with points and leaderboard",
      "Imports your old SharePoint ticket list",
    ],
    price: TBD,
  },
  {
    id: "finance",
    name: "Finance Tickets & Approvals",
    category: "ops",
    tagline: "Routed approval chains and a finance queue that replaces email threads.",
    features: [
      "Configurable approval routing",
      "Finance ticket queue with status tracking",
      "Speaker and honorarium requests that route themselves",
      "Replaces Power Apps / Dataverse ticketing",
    ],
    price: TBD,
  },
  {
    id: "hr",
    name: "HR & Onboarding",
    category: "ops",
    tagline: "New hires get real Microsoft accounts on day one. Clock-in and mileage included.",
    features: [
      "Onboarding creates Entra / AD accounts via Microsoft Graph",
      "Clock in / out, ready for payroll sync",
      "Mileage tracker with start/end trip",
      "Offboarding checklist",
    ],
    price: TBD,
  },
  {
    id: "lms",
    name: "Training / LMS",
    category: "ops",
    tagline: "Courses, quizzes and completion tracking for every staff member.",
    features: ["Course builder", "Assignments by role or office", "Completion reports", "Certificates"],
    requires: ["hr"],
    price: TBD,
  },

  // ── Programs ──────────────────────────────────────────────────
  {
    id: "intake",
    name: "Client Intake & Case Management",
    category: "programs",
    tagline: "One client registry across every program, with search and case notes.",
    features: [
      "Shared client registry across programs",
      "Intake forms and eligibility",
      "Case management (e.g. transitional housing)",
      "Fast search across offices",
    ],
    price: TBD,
  },
  {
    id: "food",
    name: "Food Distribution",
    category: "programs",
    tagline: "Barcode check-in, dietary filters and a client portal in five languages.",
    features: [
      "Barcode client check-in",
      "Dietary preference filtering",
      "Multi-language client portal with RTL support",
      "Accessible (WCAG) by default",
    ],
    requires: ["intake"],
    price: TBD,
  },
  {
    id: "inkind",
    name: "In-Kind Donations",
    category: "programs",
    tagline: "Scan donated items, batch cash and checks, and email receipts automatically.",
    features: [
      "Barcode intake with an item price catalog",
      "Cash and check batching into deposits",
      "Automatic receipt emails",
      "Pushes each gift to Salesforce",
    ],
    price: TBD,
  },
  {
    id: "assistance",
    name: "Financial Assistance",
    category: "programs",
    tagline: "Zakat and assistance requests with unanimous sign-off, straight to Finance.",
    features: [
      "Case managers submit requests for approved clients",
      "Configurable approver list, unanimous sign-off",
      "Approved requests land in the Finance queue",
      "Full audit trail",
    ],
    requires: ["intake", "finance"],
    price: TBD,
  },

  // ── Fundraising & Comms ───────────────────────────────────────
  {
    id: "crm",
    name: "Donor CRM",
    category: "fundraising",
    tagline: "Contacts and a dynamic segment builder — a Pardot replacement you own.",
    features: [
      "Contacts and households",
      "Dynamic segment builder",
      "Works alongside CharityStack, Stripe or Salesforce",
      "Donor PII stays in your system of record",
    ],
    price: TBD,
  },
  {
    id: "campaigns",
    name: "Email & SMS Campaigns",
    category: "fundraising",
    tagline: "Block-based email builder, SMS blasts and drip sequences.",
    features: ["Drag-and-drop email builder", "SMS campaigns", "Drip sequence engine", "Per-segment sends"],
    requires: ["crm"],
    price: TBD,
  },
  {
    id: "calling",
    name: "Donor Calling",
    category: "fundraising",
    tagline: "Calling campaigns with click-to-call and automatic call transcripts.",
    features: ["Calling queues by segment", "Click-to-call", "AI call transcription", "Outcome tracking"],
    requires: ["crm"],
    price: TBD,
  },
  {
    id: "fundraisers",
    name: "Fundraisers",
    category: "fundraising",
    tagline: "Staff-built fundraiser pages with a leadership approval gate.",
    features: [
      "GoFundMe-style page builder for staff",
      "Mandatory approval before publishing",
      "CharityStack or Stripe payments",
      "Progress tracking",
    ],
    price: TBD,
  },
  {
    id: "fliers",
    name: "Flier Builder",
    category: "fundraising",
    tagline: "Canva-style flier designer with stock photos and AI backgrounds.",
    features: ["Drag-and-drop canvas", "Stock photo search", "AI-illustrated backgrounds", "Brand-locked templates"],
    price: TBD,
  },

  // ── Leadership ────────────────────────────────────────────────
  {
    id: "exec",
    name: "Executive Dashboard",
    category: "leadership",
    tagline: "The whole organization on one screen, with a what-if scenario calculator.",
    features: ["Org-wide KPIs", "Revenue rollup", "What-if scenario calculator", "Office and region drill-down"],
    price: TBD,
  },
  {
    id: "grants",
    name: "Grants Tracker",
    category: "leadership",
    tagline: "Deadlines, deliverables and reporting for every grant.",
    features: ["Grant pipeline", "Deadline reminders", "Deliverable tracking", "Funder reports"],
    price: TBD,
  },
  {
    id: "reports",
    name: "Reports",
    category: "leadership",
    tagline: "Office, area and regional reports with CSV export and scheduled email.",
    features: [
      "Config-driven report builder",
      "Scoped by office, area and region",
      "CSV export",
      "Scheduled email delivery",
    ],
    price: TBD,
  },

  // ── Add-ons ───────────────────────────────────────────────────
  {
    id: "salesforce",
    name: "Salesforce Sync",
    category: "add-ons",
    tagline: "Enter data once — it lands in your Salesforce (and your partners').",
    features: [
      "Push records to one or many Salesforce orgs",
      "Nightly pull of donations for reporting",
      "Config-driven field mapping",
      "Ends double data entry",
    ],
    price: TBD,
  },
  {
    id: "assistant",
    name: "Portal AI Assistant",
    category: "add-ons",
    tagline: "A chat assistant that finds pages, tickets and office info for staff.",
    features: [
      "Built on Microsoft Copilot Studio",
      "Looks up your helpdesk tickets",
      "Finds the right portal page",
      "Office and volunteer event info",
    ],
    price: TBD,
  },
];

export type Preset = { id: string; name: string; blurb: string; modules: string[] };

export const PRESETS: Preset[] = [
  {
    id: "pantry",
    name: "Food Pantry",
    blurb: "Serve clients faster and stop double-entering into the food bank's system.",
    modules: ["intake", "food", "inkind", "salesforce", "reports"],
  },
  {
    id: "masjid",
    name: "Masjid",
    blurb: "Donations, community services and board reporting in one place.",
    modules: ["crm", "campaigns", "fundraisers", "intake", "assistance", "exec"],
  },
  {
    id: "fundraising",
    name: "Fundraising Engine",
    blurb: "Everything a development team needs to run Ramadan-sized campaigns.",
    modules: ["crm", "campaigns", "calling", "fundraisers", "fliers", "exec"],
  },
  {
    id: "backoffice",
    name: "Back Office",
    blurb: "Get IT, finance and HR off email and spreadsheets.",
    modules: ["helpdesk", "finance", "hr", "lms"],
  },
];

export type Band = "S" | "M" | "L";

export const BANDS: { id: Band; label: string; staff: string }[] = [
  { id: "S", label: "Small", staff: "Under 25 staff" },
  { id: "M", label: "Medium", staff: "25–100 staff" },
  { id: "L", label: "Large", staff: "100+ staff" },
];

export const moduleById = (id: string) => MODULES.find((m) => m.id === id);
export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;
