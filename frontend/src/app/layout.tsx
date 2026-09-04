import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";

import "./globals.css";

// Manrope for interface text: a sturdy geometric face with real weight at
// 500-800, so labels and headings read as printed material rather than a
// thin template. JetBrains Mono for identifiers (certificate and application
// numbers, readings, hashes): a distinct zero and tabular digits so codes
// can be read back over the phone.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MapanSetu",
  description: "Verification lifecycle for weighing and measuring instruments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrainsMono.variable}`}>
      <body>
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

