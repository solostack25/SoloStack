import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Book a Consult",
  description: "A free 30-minute call about your IT, your website or your stack. No pressure, no pitch.",
};

export default function ContactPage() {
  return (
    <section className="container contact">
      <p className="eyebrow">Book a free consult</p>
      <h1 className="h1" style={{ fontSize: "clamp(40px, 5vw, 68px)" }}>
        Let&rsquo;s talk tech.
      </h1>
      <p className="lead" style={{ marginTop: 20 }}>
        Free 30 minutes. No pressure, no pitch — just an honest conversation about what&rsquo;s slowing your team
        down and what we&rsquo;d fix first.
      </p>
      <ContactForm />
    </section>
  );
}
