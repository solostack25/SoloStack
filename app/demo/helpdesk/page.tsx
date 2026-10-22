import type { Metadata } from "next";
import Link from "next/link";
import HelpdeskBoard from "@/components/HelpdeskBoard";

export const metadata: Metadata = {
  title: "Helpdesk Playground",
  description:
    "Play with the IT Helpdesk module from SoloStack's Nonprofit OS — drag tickets, close them, level up. Demo data, runs in your browser.",
};

export default function HelpdeskDemoPage() {
  return (
    <>
      <section className="container sb-hero" style={{ paddingBottom: 24 }}>
        <p className="eyebrow">// Live demo · IT Helpdesk module</p>
        <h1 className="h1" style={{ fontSize: "clamp(40px, 5.5vw, 76px)" }}>
          Go on, <span className="accent">close a ticket.</span>
        </h1>
        <p className="lead" style={{ marginTop: 20 }}>
          This is the helpdesk workboard from the staff portal, running on demo data. It replaced a SharePoint list and
          a lot of “did anyone see my email?” Nothing here is sent anywhere — it lives in your browser.
        </p>
      </section>
      <div className="container">
        <HelpdeskBoard />
        <div className="hd-cta">
          <p>
            In the real module: tickets hand off between departments, update live for everyone, and import your old
            ticket history.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/stack?s=helpdesk&b=M" className="btn btn-primary">
              Add it to my stack →
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              Book a consult
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
