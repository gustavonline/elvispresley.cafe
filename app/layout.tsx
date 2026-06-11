import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const tradeGothic = localFont({
  src: "../public/fonts/Trade-Gothic-Next-LT-Pro-Cn.ttf",
  variable: "--font-trade-gothic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://elvispresley.cafe"),
  title: {
    default: "elvispresley.cafe",
    template: "%s | elvispresley.cafe",
  },
  description: "A retro Elvis-inspired music cafe with neon stations, focus timer, and configurable YouTube sources.",
  openGraph: {
    title: "elvispresley.cafe",
    description: "A retro Elvis-inspired music cafe with neon stations and a minimal listening room.",
    images: [
      {
        url: "/images/elvis-cafe-stage.png",
        width: 1536,
        height: 1024,
        alt: "Retro neon rock-and-roll cafe stage with jukebox and microphone",
      },
    ],
    siteName: "elvispresley.cafe",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "elvispresley.cafe",
    description: "A retro Elvis-inspired music cafe with neon stations and a minimal listening room.",
    images: ["/images/elvis-cafe-stage.png"],
  },
  applicationName: "elvispresley.cafe",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "Elvis Cafe",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={tradeGothic.variable}>{children}</body>
    </html>
  );
}
