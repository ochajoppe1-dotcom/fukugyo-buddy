"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Message = {
  role: "assistant" | "user";
  content: string;
};

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "こんにちは。副業バディAIです。\n\n副業のことで気になっていることがあれば、なんでも聞いてください。\n\n・どんな副業が向いてるか迷ってる\n・本業と両立できるか不安\n・始めたけど続かない\n・買おうとしてる教材があるけど怪しい気がする\n・売上が伸びなくて辞めようか悩んでる\n\nどんな相談でも大丈夫です。気軽にどうぞ。",
};

// 相談スタート用のサジェスト
const SUGGESTIONS = [
  "副業を始めたいけど何から始めたらいい？",
  "本業と両立する時間の作り方は？",
  "情報商材を買おうか迷ってる",
  "副業が続かない、どうすれば？",
];

export default function ChatClient() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();

      if (data.limit_exceeded) {
        setLimitExceeded(true);
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: `⚠️ ${data.error}`,
          },
        ]);
      } else if (data.error) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: `⚠️ ${data.error}` },
        ]);
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.message },
        ]);
        // 最初のメッセージ送信時のみ消費 → ヘッダー表示を更新
        const isFirstMessage =
          newMessages.filter((m) => m.role === "user").length === 1;
        if (isFirstMessage) {
          router.refresh();
        }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
    setLimitExceeded(false);
  };

  const showSuggestions = messages.length === 1;

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 py-4">
      {/* メッセージ表示 */}
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
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
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

        {/* サジェスト（初回のみ） */}
        {showSuggestions && (
          <div className="flex flex-col gap-2 mt-4">
            <p className="text-xs text-gray-400 px-1">よくある相談から始める</p>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                disabled={loading}
                className="text-left text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-4 py-2.5 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors disabled:opacity-50"
              >
                💬 {s}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア or 上限到達CTA */}
      {limitExceeded ? (
        <a
          href="/#pricing"
          className="block w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors text-center"
        >
          プランをアップグレード
        </a>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
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
          {messages.length > 1 && (
            <button
              onClick={handleReset}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors self-center"
            >
              🔄 新しい相談を始める（カウント+1）
            </button>
          )}
        </>
      )}
    </div>
  );
}
