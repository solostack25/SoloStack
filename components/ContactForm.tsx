"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BANDS, FOUNDATION, type Band, categoryById, moduleById } from "@/lib/modules";
import { SITE } from "@/lib/site";

export default function ContactForm() {
  const [stack, setStack] = useState<string[]>([]);
  const [band, setBand] = useState<Band>("M");
  const [form, setForm] = useState({ name: "", org: "", email: "", need: "Nonprofit OS / staff portal", message: "" });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setStack((p.get("s") ?? "").split(",").filter((id) => moduleById(id)));
    const b = p.get("b") as Band | null;
    if (b && ["S", "M", "L"].includes(b)) setBand(b);
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const bandInfo = BANDS.find((b) => b.id === band);
    const lines = [
      `Name: ${form.name}`,
      `Organization: ${form.org}`,
      `Email: ${form.email}`,
      `Looking for: ${form.need}`,
      "",
      form.message,
    ];
    if (stack.length) {
      lines.push(
        "",
        `MY STACK (${bandInfo?.label}, ${bandInfo?.staff}):`,
        `- ${FOUNDATION.name}`,
        ...stack.map((id) => `- ${moduleById(id)?.name}`),
        "",
        `Stack link: ${window.location.origin}/stack?s=${stack.join(",")}&b=${band}`,
      );
    }
    const subject = `Consult request — ${form.org || form.name || "new client"}`;
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <>
      {stack.length > 0 && (
        <div className="stack-receipt">
          <p className="eyebrow" style={{ margin: 0 }}>
            Your stack · {BANDS.find((b) => b.id === band)?.label} org · {stack.length + 1} blocks
          </p>
          <ul>
            <li style={{ ["--c" as string]: "var(--text)" }}>{FOUNDATION.name}</li>
            {stack.map((id) => {
              const m = moduleById(id)!;
              return (
                <li key={id} style={{ ["--c" as string]: categoryById(m.category).color }}>
                  {m.name}
                </li>
              );
            })}
          </ul>
          <Link href={`/stack?s=${stack.join(",")}&b=${band}`} className="lib-info" style={{ display: "inline-block", marginTop: 10 }}>
            ← Edit stack
          </Link>
        </div>
      )}

      <form className="form" data-x="ContactForm · prefilled mailto" onSubmit={submit} style={{ marginTop: stack.length ? 0 : 36 }}>
        <div className="row-2">
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input id="name" required value={form.name} onChange={set("name")} autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="org">Organization</label>
            <input id="org" value={form.org} onChange={set("org")} autoComplete="organization" />
          </div>
        </div>
        <div className="row-2">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={form.email} onChange={set("email")} autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="need">Looking for</label>
            <select id="need" value={form.need} onChange={set("need")}>
              <option>Nonprofit OS / staff portal</option>
              <option>Managed IT</option>
              <option>New website</option>
              <option>Not sure yet</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="message">What&rsquo;s slowing your team down?</label>
          <textarea id="message" rows={5} value={form.message} onChange={set("message")} />
        </div>
        <div>
          <button type="submit" className="btn btn-primary">
            Send request →
          </button>
          <p className="note" style={{ marginTop: 12 }}>
            Opens your email app with everything filled in. Or write us directly at{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
        </div>
      </form>
    </>
  );
}
