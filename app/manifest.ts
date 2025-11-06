import type { MetadataRoute } from "next";
import { APP_MANIFEST } from "@/app/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    ...APP_MANIFEST,
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
