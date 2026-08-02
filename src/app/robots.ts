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
    // ⚠️ 2026-08-02：/sitemap.xml が Search Console で2回連続「取得できませんでした」
    //    （型:不明・最終読み込み日時が空・検出0）になり、90本の記事のうち2ページしか
    //    インデックスされていなかった。サーバー側は Googlebot に 200 を返しており
    //    壊れていないので、詰まりは Google 側の取得記録にある。
    //    そこで public/ に置いた素のファイル（Next.js の処理を通らず CDN から返る）を
    //    2本目として並べる。robots.txt は必ず読まれるので、送信とは別の発見経路になる。
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/sitemap-static.xml`],
  };
}
