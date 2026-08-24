import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteUrl, siteName } from "./site-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Construcción de Alta Precisión en Carapungo, Quito`,
    template: `%s | ${siteName}`,
  },
  description: "Empresa constructora líder en Carapungo, Quito. Obras civiles, diseño, remodelación y acabados de alta precisión.",
  keywords: ["Construcción Quito", "Fénix Construcciones", "Carapungo", "Obras civiles", "Remodelación Quito"],
  openGraph: {
    title: `${siteName} | Construcción de Alta Precisión`,
    description: "Servicios de construcción y remodelación en Quito y Carapungo.",
    url: siteUrl,
    siteName: siteName,
    locale: "es_EC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Construcción de Alta Precisión`,
    description: "Servicios de construcción y remodelación en Quito.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}