import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MotoHub — Twoja pasja. Twój MotoHub.",
  description:
    "MotoHub to miejsce dla motocyklistów. Odkrywaj motocykle, buduj swój garaż i poznawaj społeczność.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
