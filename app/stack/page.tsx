import type { Metadata } from "next";
import StackBuilder from "@/components/StackBuilder";
import { MODULES, moduleById } from "@/lib/modules";

type Search = Promise<{ s?: string; b?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const { s = "", b = "M" } = await searchParams;
  const ids = s.split(",").filter((id) => moduleById(id));
  const shared = ids.length > 0;
  const og = `/api/og?s=${encodeURIComponent(ids.join(","))}&b=${encodeURIComponent(b)}`;
  const title = shared ? `Our ${ids.length + 1}-block SoloStack` : "Build Your Stack";
  const description = shared
    ? `${ids.map((id) => moduleById(id)!.name).join(" · ")} — stacked on the SoloStack Core Platform. Build yours.`
    : "Stack the Nonprofit OS modules your organization needs — helpdesk, donor CRM, finance approvals, client intake and more — on a foundation you own.";
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default function StackPage() {
  return (
    <>
      <section className="container sb-hero">
        <p className="eyebrow">Nonprofit OS · {MODULES.length} modules · 1 foundation</p>
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
