import { baseURL } from "@/resources";

// Prerender to a static robots.txt for `output: export`.
export const dynamic = "force-static";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
      },
    ],
    sitemap: `${baseURL}/sitemap.xml`,
  };
}
