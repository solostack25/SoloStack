import type { Metadata, Viewport } from "next";
import "./card.css";

// NFC / QR landing page for the SoloStack Labs metal business card.
// Rendered as a full-screen layer over the site chrome so a tap opens straight into the card.

export const metadata: Metadata = {
  title: "Travis Ali",
  description: "Travis Ali — SoloStack Labs. Save my contact, or open SoloStack and Siqa.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#050708" };

const PHONE = "+13215069546";
const PHONE_LABEL = "(321) 506-9546";
const EMAIL = "travis@solostack.us";

export default function CardPage() {
  return (
    <div className="bc" data-x="Business card · NFC landing">
      <div className="bc-inner">
        <div className="bc-top">
          <span>// SOLOSTACK LABS</span>
          <span>BUILD 001 · HTX</span>
        </div>

        <div className="bc-hero">
          <span className="bc-ssl">SSL</span>
          <span className="bc-sub">SOLOSTACK_LABS</span>
        </div>

        <div className="bc-term">
          <span className="dim">~ $ whoami</span>
          <span className="bc-name">travis_ali</span>
          <span className="dim">&gt; it·web·automation</span>
          <span className="dim bc-gap">~ $ connect --pick</span>
        </div>

        <nav className="bc-actions" aria-label="Card actions">
          <a className="bc-btn bc-primary" href="/card/contact">
            <span className="bc-k">01</span>
            <span className="bc-l">
              Save my contact
              <small>adds Travis Ali to your phone</small>
            </span>
            <span className="bc-arrow">↓</span>
          </a>
          <a className="bc-btn" href="https://solostack.us/">
            <span className="bc-k">02</span>
            <span className="bc-l">
              solostack.us
              <small>IT · web · automation</small>
            </span>
            <span className="bc-arrow">→</span>
          </a>
          <a className="bc-btn" href="https://siqa.us/">
            <span className="bc-k">03</span>
            <span className="bc-l">
              siqa.us
              <small>Islamic media &amp; community</small>
            </span>
            <span className="bc-arrow">→</span>
          </a>
        </nav>

        <div className="bc-quick">
          <a href={`tel:${PHONE}`}>call</a>
          <a href={`sms:${PHONE}`}>text</a>
          <a href={`mailto:${EMAIL}`}>email</a>
        </div>

        <div className="bc-foot">
          <span>{PHONE_LABEL}</span>
          <span>{EMAIL}</span>
          <span className="bc-ok">
            200 OK<i className="bc-cursor" aria-hidden="true" />
          </span>
        </div>
      </div>
    </div>
  );
}
