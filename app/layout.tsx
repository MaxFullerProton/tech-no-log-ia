import type { Metadata } from "next";
import "./globals.css";
import { companyConfig } from "@/lib/company-config";

export const metadata: Metadata = {
  title: `${companyConfig.name} — Client Runtime`,
  description: companyConfig.description,
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
