import Link from "next/link";
import { NAV } from "@/lib/site";
import Logo from "./Logo";
import NavControls from "./NavControls";

export default function Nav() {
  return (
    <header className="nav" data-x="Nav · sticky header">
      <div className="container nav-inner">
        <Logo />
        <nav aria-label="Main" className="nav-links">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hide-sm">
              {n.label}
            </Link>
          ))}
          <Link href="/stack" className="nav-stack" data-tour="stack-link" aria-label="Build your stack">
            ▤<span className="hide-sm"> BUILD YOUR STACK</span>
          </Link>
          <NavControls />
          <Link href="/contact" className="btn btn-primary btn-sm hide-sm">
            Book a consult →
          </Link>
        </nav>
      </div>
    </header>
  );
}
