import type { Metadata } from "next";
import StackBuilder from "@/components/StackBuilder";
import { MODULES } from "@/lib/modules";

export const metadata: Metadata = {
  title: "Build Your Stack",
  description:
    "Stack the Nonprofit OS modules your organization needs — helpdesk, donor CRM, finance approvals, client intake and more — on a foundation you own.",
};

export default function StackPage() {
  return (
    <>
      <section className="container sb-hero">
        <p className="eyebrow">// Nonprofit OS · {MODULES.length} modules · 1 foundation</p>
        <h1 className="h1">
          Build your <span>stack.</span>
        </h1>
        <p className="lead" style={{ marginTop: 24 }}>
          The staff portal we built for a national relief organization, broken into modules. Stack only what you
          need on a foundation you own — then add more when it pays for itself.
        </p>
      </section>
      <StackBuilder />
    </>
  );
}
