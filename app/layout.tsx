import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: 'Tech.NO-Log.IA — Central de Operações',
  description: 'Disponibilidade das aplicações, localização de falhas e acompanhamento da recuperação.',
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
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
