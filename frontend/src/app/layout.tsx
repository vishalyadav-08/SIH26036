import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MapanSetu — Instrument Verification & Metrology Portal",
    template: "%s | MapanSetu",
  },
  description:
    "MapanSetu — SIH 2026 Prototype. Online verification of weighing and measuring instruments under the Legal Metrology Act, 2009.",
  keywords: [
    "legal metrology",
    "instrument verification",
    "weighing scale certificate",
    "MapanSetu",
    "SIH 2026",
  ],
  openGraph: {
    title: "MapanSetu — Instrument Verification & Metrology Portal",
    description:
      "MapanSetu — SIH 2026 Prototype. Online verification of weighing and measuring instruments.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "MapanSetu — Instrument Verification & Metrology Portal",
    description:
      "MapanSetu — SIH 2026 Prototype. Online verification of weighing and measuring instruments.",
  },
  robots: { index: false, follow: false }, // Prototype — do not index
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
