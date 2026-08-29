import type { Metadata } from "next";

import { PwaProvider } from "@/components/providers/PwaProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MapanSetu",
  description: "Verification lifecycle for weighing and measuring instruments.",
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alkatra:wght@400..700&family=Almendra:ital,wght@0,400;0,700;1,400;1,700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Iosevka+Charon:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&family=Kapakana:wght@300..400&display=swap" rel="stylesheet" />
      </head>
      <body>
        <PwaProvider />
        {children}
      </body>
    </html>
  );
}
