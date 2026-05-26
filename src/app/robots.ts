import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://fukugyo-buddy.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/", // 内部APIは非公開
          "/account", // 個人ページ
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
