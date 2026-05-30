import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ai.fukugyobuddy.app",
  appName: "副業バディAI",
  // Webアプリ(Next.js SSR)をそのままWebViewで表示する戦略
  // 静的エクスポートではなく、本番Vercelをそのままロードする
  server: {
    url: "https://fukugyo-buddy.vercel.app",
    cleartext: false,
    androidScheme: "https",
  },
  // ローカル開発用に切り替えたい場合は server を以下のように：
  // server: { url: "http://10.0.2.2:3000", cleartext: true },
  android: {
    // WebView の User-Agent に目印を付与。
    // フロント側でこの文字列を検知し、アプリ内では課金導線を隠す
    // （Google Play の決済規約対応：アプリ内でデジタル課金させない）
    appendUserAgent: "FukugyoBuddyApp",
    buildOptions: {
      keystorePath: undefined, // 本番リリース時に署名証明書を指定
      keystoreAlias: undefined,
    },
  },
};

export default config;
