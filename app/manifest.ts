import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "elvispresley.cafe",
    short_name: "Elvis Cafe",
    description: "A retro Elvis-inspired music cafe.",
    start_url: "/",
    display: "standalone",
    background_color: "#130d10",
    theme_color: "#130d10",
    icons: [
      {
        src: "/icon.svg",
        sizes: "64x64",
        type: "image/svg+xml",
      },
    ],
  };
}
