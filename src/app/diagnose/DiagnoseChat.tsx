"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Message = {
  role: "assistant" | "user";
  content: string;
};

type DiagnoseResult = {
  riskScore: number;
  summary: string;
  redFlags: string[];
  recommendation: string;
} | null;

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "こんにちは。副業バディAIです。\n\n気になっている副業教材・情報商材のLP（販売ページ）を一緒に診断しましょう。\n\nまずは、教材の URL または タイトル/販売者名 を教えてください。\n\n（例：https://〇〇.com / 〇〇式せどり講座 など）",
};

export default function DiagnoseChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnoseResult>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();

      if (data.limit_exceeded) {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: `⚠️ ${data.error}\n\nStandard プランなら無制限でご利用いただけます。`,
          },
        ]);
        // 上限到達時はトップへの誘導ボタンに切り替え
        setResult({
          riskScore: 0,
          summary: "",
          redFlags: [],
          recommendation: "__limit_exceeded__",
        } as DiagnoseResult);
      } else if (data.error) {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: `⚠️ ${data.error}`,
          },
        ]);
      } else if (data.result) {
        setResult(data.result);
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "診断が完了しました。下に結果を表示します👇",
          },
        ]);
        // 残り回数表示を更新（結果生成時のみカウントされる）
        router.refresh();
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.message },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "⚠️ エラーが発生しました。時間を置いて再度お試しください。",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
    setResult(null);
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 py-4">
      {/* メッセージ表示エリア */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-gray-200 text-gray-800"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1.5 mb-1.5 text-xs text-emerald-600 font-medium">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>副業バディAI</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-100"></span>
                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-200"></span>
                <span className="ml-1">考えています...</span>
              </div>
            </div>
          </div>
        )}

        {/* 診断結果カード */}
        {result && (
          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-emerald-200 rounded-2xl p-5 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>📊</span> 診断結果
            </h3>
            {/* 危険度バー */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-gray-700">危険度</span>
                <span
                  className={`text-2xl font-bold ${
                    result.riskScore >= 70
                      ? "text-red-600"
                      : result.riskScore >= 40
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {result.riskScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    result.riskScore >= 70
                      ? "bg-red-500"
                      : result.riskScore >= 40
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${result.riskScore}%` }}
                />
              </div>
            </div>
            {/* サマリー */}
            <div className="mb-4">
              <h4 className="text-sm font-bold text-gray-700 mb-1">総評</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {result.summary}
              </p>
            </div>
            {/* 危険サイン */}
            {result.redFlags.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-red-700 mb-2">
                  🚩 検出された危険サイン
                </h4>
                <ul className="space-y-1">
                  {result.redFlags.map((flag, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-700 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-red-500"
                    >
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* 推奨アクション */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              <h4 className="text-sm font-bold text-emerald-600 mb-1">
                💡 おすすめアクション
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {result.recommendation}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア or 再診断ボタン */}
      {result ? (
        <button
          onClick={reset}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
        >
          🔄 別の教材を診断する
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            disabled={loading}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 hover:bg-emerald-700 transition-colors"
          >
            送信
          </button>
        </form>
      )}
    </div>
  );
}
