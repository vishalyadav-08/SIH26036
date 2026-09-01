import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MapanSetu - National Metrology Verification & Instrument Passport',
  description: 'National Legal Metrology Verification and Instrument Passport Portal (SIH 2026 Prototype)',
  openGraph: {
    title: 'MapanSetu - National Metrology Verification & Instrument Passport',
    description: 'National Legal Metrology Verification and Instrument Passport Portal (SIH 2026 Prototype)',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MapanSetu - National Metrology Verification & Instrument Passport',
    description: 'National Legal Metrology Verification and Instrument Passport Portal (SIH 2026 Prototype)',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <body className="bg-background text-text-main antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

