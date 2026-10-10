import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Universal Bridge Ltd",
    short_name: "Universal Bridge",
    description:
      "Software & technology company in Kigali. Building Smart Solutions. Connecting the Future.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F8FA",
    theme_color: "#0B47C1",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icons/192", type: "image/png", sizes: "192x192" },
      { src: "/icons/512", type: "image/png", sizes: "512x512" },
      { src: "/icons/maskable-512", type: "image/png", sizes: "512x512", purpose: "maskable" },
    ],
  };
}
