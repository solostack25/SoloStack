import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="footer" data-x="Footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <span className="logo-word" style={{ color: "var(--text)" }}>
            Solo<span className="accent">//</span>Stack
          </span>
          <span>Tech that actually shows up — for nonprofits, masjids and growing organizations.</span>
        </div>
        <nav aria-label="Footer services" className="footer-col">
          <h4>SERVICES</h4>
          <Link href="/#services">Managed IT</Link>
          <Link href="/#services">Websites &amp; Platforms</Link>
          <Link href="/#platform">Nonprofit OS</Link>
          <Link href="/stack">Build Your Stack</Link>
        </nav>
        <nav aria-label="Footer company" className="footer-col">
          <h4>COMPANY</h4>
          <Link href="/#work">Work</Link>
          <Link href="/#about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="footer-col">
          <h4>CONTACT</h4>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <span>{SITE.location}</span>
          <span className="live">Open for new clients</span>
        </div>
      </div>
      <div className="container footer-base">
        <span>© {new Date().getFullYear()} SoloStack · Built on Next.js + Vercel</span>
        <span>HOUSTON, TX</span>
      </div>
    </footer>
  );
}
