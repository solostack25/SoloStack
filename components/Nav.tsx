import Link from "next/link";
import { NAV } from "@/lib/site";
import Logo from "./Logo";

export default function Nav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Logo />
        <nav aria-label="Main" className="nav-links">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hide-sm">
              {n.label}
            </Link>
          ))}
          <Link href="/stack" className="nav-stack">
            ▤ BUILD YOUR STACK
          </Link>
          <Link href="/contact" className="btn btn-primary btn-sm">
            Book a consult →
          </Link>
        </nav>
      </div>
    </header>
  );
}
