import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "next-app-note",
    short_name: "note",
    description: "next-app-note application",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/brand/note-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/note-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
