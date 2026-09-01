import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "MapanSetu - Department of Legal Metrology",
  description: "Digital Verification & Instrument Management Portal - Government of India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#f8fafc] text-[#111c2d] min-h-screen flex flex-col font-sans">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
