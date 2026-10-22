import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Terminal from "@/components/Terminal";
import XrayHud from "@/components/XrayHud";
import { SITE } from "@/lib/site";
import { THEME_BOOT_SCRIPT } from "@/lib/themeBoot";

export const metadata: Metadata = {
  title: { default: `${SITE.name} — Managed IT + Custom Platforms`, template: `%s — ${SITE.name}` },
  description: SITE.description,
  metadataBase: new URL("https://www.solostack.us"),
  openGraph: { title: SITE.name, description: SITE.description, siteName: SITE.name, type: "website" },
};

export const viewport: Viewport = { themeColor: "#070b0f" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="teal" suppressHydrationWarning>
      <head>
        {/* apply the visitor's saved theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
        <Terminal />
        <XrayHud />
      </body>
    </html>
  );
}
