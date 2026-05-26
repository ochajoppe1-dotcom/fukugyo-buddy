import type { Metadata, Viewport } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";
import BottomNav from "./components/BottomNav";

const rounded = M_PLUS_Rounded_1c({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-rounded",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://fukugyo-buddy.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "副業バディAI - あなたの副業を、AIが伴走します",
    template: "%s | 副業バディAI",
  },
  description:
    "副業を始める前のLP診断、実践中のAI相談、副業日記、適性診断まで。AI完結の副業安全パートナー。情報商材・副業詐欺の被害を未然に防ぎます。",
  keywords: [
    "副業",
    "副業 始め方",
    "副業 AI",
    "副業 LP診断",
    "情報商材 見分け方",
    "副業 詐欺 チェック",
    "副業 適性診断",
    "副業 安全",
    "副業 失敗",
    "中国輸入 失敗",
    "時給220円",
    "せどり 失敗",
  ],
  authors: [{ name: "副業バディAI事務局" }],
  creator: "副業バディAI事務局",
  publisher: "副業バディAI事務局",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "副業バディAI",
  },
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: "副業バディAI",
    title: "副業バディAI - あなたの副業を、AIが伴走します",
    description:
      "副業を始める前のLP診断、実践中のAI相談まで。AI完結の副業安全パートナー。",
    images: [
      {
        url: "/icons/icon-512.svg",
        width: 512,
        height: 512,
        alt: "副業バディAI",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "副業バディAI",
    description:
      "副業を始める前のLP診断、実践中のAI相談まで。AI完結の副業安全パートナー。",
    images: ["/icons/icon-512.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${rounded.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-16">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
