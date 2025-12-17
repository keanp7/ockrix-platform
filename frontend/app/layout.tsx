import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SecurityInitializer } from "./components/SecurityInitializer";

// Inter font for accessible, readable typography
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

// JetBrains Mono for code/monospace
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "OCKRIX Platform | Secure Recovery Solutions",
  description: "Trust-focused secure recovery platform with zero-knowledge architecture",
  keywords: ["OCKRIX", "security", "recovery", "authentication", "zero-knowledge"],
  authors: [{ name: "OCKRIX" }],
  creator: "OCKRIX",
  publisher: "OCKRIX",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://ockrix.com"),
  openGraph: {
    title: "OCKRIX Platform | Secure Recovery Solutions",
    description: "Trust-focused secure recovery platform with zero-knowledge architecture",
    type: "website",
    locale: "en_US",
    alternateLocale: ["en_GB", "es_ES", "fr_FR", "de_DE", "zh_CN", "ja_JP"],
  },
  twitter: {
    card: "summary_large_image",
    title: "OCKRIX Platform",
    description: "Trust-focused secure recovery platform",
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: "#0a0a0f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" dir="ltr">
      <head>
        {/* Global-ready: Support for multiple languages */}
        <meta httpEquiv="Content-Language" content="en" />
        {/* Accessibility */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-dark-bg-primary text-dark-text-primary min-h-screen`}
      >
        <LanguageProvider>
          <SecurityInitializer />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
