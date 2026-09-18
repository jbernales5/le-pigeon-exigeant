import type { MetadataRoute } from "next"

import { absoluteUrl } from "@/lib/site"

// The collection itself is private: only the public front door is indexable.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ["/", "/login", "/register"], disallow: ["/collection", "/map", "/add", "/hotels/", "/api/", "/uploads/"] },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/").replace(/\/$/, ""),
  }
}
