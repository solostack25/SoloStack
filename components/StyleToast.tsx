"use client";

import { useEffect, useState } from "react";
import { styleById } from "@/lib/styles";

// After a style switch: "Editorial — for foundations, nonprofits, annual reports"
export default function StyleToast() {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      setId((e as CustomEvent<string>).detail);
      clearTimeout(t);
      t = setTimeout(() => setId(null), 3600);
    };
    window.addEventListener("solostack:style", on);
    return () => {
      window.removeEventListener("solostack:style", on);
      clearTimeout(t);
    };
  }, []);

  const s = id ? styleById(id) : null;
  if (!s) return null;
  return (
    <div className="style-toast" role="status" aria-live="polite" key={s.id}>
      <b>{s.name}</b>
      <span>{s.forWho}</span>
    </div>
  );
}
