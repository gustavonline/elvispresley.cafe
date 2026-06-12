import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "elvispresley.cafe",
    short_name: "Elvis Cafe",
    description: "A retro Elvis-inspired music cafe.",
    start_url: "/",
    display: "standalone",
    background_color: "#5e303c",
    theme_color: "#5e303c",
    icons: [
      {
        src: "/icon.svg",
        sizes: "64x64",
        type: "image/svg+xml",
      },
    ],
  };
}
