"use client";

import { useState } from "react";
import { useToast } from "./Toast";

type Props = {
  /** シェアするテキスト（結果の要約など） */
  text: string;
  /** シェア時につけるハッシュタグ（#なし、カンマ区切り） */
  hashtags?: string[];
  /** 流入先URL（未指定なら本番トップ） */
  url?: string;
};

const SITE_URL = "https://fukugyo-buddy.vercel.app";

export default function ShareButtons({
  text,
  hashtags = ["副業バディAI", "副業"],
  url = SITE_URL,
}: Props) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const shareText = `${text}\n\n▼無料で診断してみる\n`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(url);
  const encodedTags = hashtags.join(",");

  // X（Twitter）シェア
  const xUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=${encodedTags}`;

  // LINEシェア
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`;

  // コピー（URLまるごと）
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}${url}`);
      setCopied(true);
      toast.show("コピーしました", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.show("コピーに失敗しました", "error");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <p className="text-sm font-bold text-gray-700 mb-3 text-center">
        結果をシェアする
      </p>
      <div className="flex items-center justify-center gap-3">
        {/* X */}
        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 max-w-[140px] flex items-center justify-center gap-2 bg-black text-white py-2.5 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
          aria-label="Xでシェア"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Xでシェア
        </a>
        {/* LINE */}
        <a
          href={lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 max-w-[140px] flex items-center justify-center gap-2 bg-[#06C755] text-white py-2.5 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity"
          aria-label="LINEでシェア"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 5.64 2 10.13c0 4.02 3.55 7.39 8.35 8.03.32.07.77.21.88.49.1.25.07.65.03.9l-.14.85c-.04.25-.2.99.86.54 1.07-.45 5.75-3.39 7.85-5.8C21.36 13.5 22 11.9 22 10.13 22 5.64 17.52 2 12 2zM7.96 12.96H6.13c-.27 0-.49-.22-.49-.49V8.83c0-.27.22-.49.49-.49s.49.22.49.49v3.15h1.34c.27 0 .49.22.49.49s-.22.49-.49.49zm1.92-.49c0 .27-.22.49-.49.49s-.49-.22-.49-.49V8.83c0-.27.22-.49.49-.49s.49.22.49.49v3.64zm4.43 0c0 .21-.14.4-.34.46-.05.02-.1.02-.15.02-.16 0-.3-.07-.39-.2l-1.87-2.54v2.26c0 .27-.22.49-.49.49s-.49-.22-.49-.49V8.83c0-.21.14-.4.34-.46.05-.02.1-.02.15-.02.15 0 .3.08.39.2l1.87 2.54V8.83c0-.27.22-.49.49-.49s.49.22.49.49v3.64zm3.4-2.31c.27 0 .49.22.49.49s-.22.49-.49.49h-1.34v.85h1.34c.27 0 .49.22.49.49s-.22.49-.49.49h-1.83c-.27 0-.49-.22-.49-.49V8.83c0-.27.22-.49.49-.49h1.83c.27 0 .49.22.49.49s-.22.49-.49.49h-1.34v.85h1.34z" />
          </svg>
          LINE
        </a>
        {/* コピー */}
        <button
          onClick={copyLink}
          className="flex items-center justify-center w-11 h-11 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors flex-shrink-0"
          aria-label="リンクをコピー"
        >
          {copied ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
      <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
        友だちにもシェアして、副業の不安を減らそう
      </p>
    </div>
  );
}
