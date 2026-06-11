import type { Metadata } from "next";
import "@fontsource/bebas-neue/400.css";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
