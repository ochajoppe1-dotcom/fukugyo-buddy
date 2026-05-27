"use client";

import { useState } from "react";
import { questions } from "./questions";
import AiReportButton from "../components/AiReportButton";

type Result = {
  summary: string;
  topJobs: { name: string; reason: string; matchScore: number }[];
  avoidJobs: { name: string; reason: string }[];
  advice: string;
};

export default function AssessmentClient() {
  const [step, setStep] = useState(0); // 0=intro, 1-15=questions, 16=loading/result
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalQuestions = questions.length;

  const handleAnswer = async (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (step < totalQuestions) {
      setStep(step + 1);
    }

    // 最後の質問に答えたら診断実行
    if (step === totalQuestions) {
      await runDiagnosis(newAnswers);
    }
  };

  const runDiagnosis = async (finalAnswers: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result);
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
    setError(null);
  };

  // ===== イントロ画面 =====
  if (step === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          副業適性診断
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          15の質問に答えると、AIがあなたに向いた副業を提案します。
          <br />
          所要時間は約2分。直感で答えてください。
        </p>
        <button
          onClick={() => setStep(1)}
          className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
        >
          診断をはじめる
        </button>
      </div>
    );
  }

  // ===== ローディング画面 =====
  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="inline-block animate-spin text-5xl mb-4">🧭</div>
        <p className="text-gray-600 font-medium">AIが診断中...</p>
        <p className="text-gray-400 text-sm mt-1">少々お待ちください</p>
      </div>
    );
  }

  // ===== エラー画面 =====
  if (error) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-red-600 font-medium mb-2">{error}</p>
        <button
          onClick={reset}
          className="mt-4 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
        >
          最初からやり直す
        </button>
      </div>
    );
  }

  // ===== 結果画面 =====
  if (result) {
    return (
      <div className="max-w-xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span>📊</span> 診断結果
        </h2>

        {/* 総評 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            {result.summary}
          </p>
        </div>

        {/* 向いてる副業 TOP3 */}
        <h3 className="text-sm font-bold text-gray-700 mb-2">
          あなたに向いてる副業 TOP3
        </h3>
        <div className="space-y-3 mb-5">
          {result.topJobs.map((job, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-emerald-100 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h4 className="font-bold text-gray-900">{job.name}</h4>
                </div>
                <span className="text-sm font-bold text-emerald-600">
                  適性 {job.matchScore}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${job.matchScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {job.reason}
              </p>
            </div>
          ))}
        </div>

        {/* 避けるべき副業 */}
        {result.avoidJobs.length > 0 && (
          <>
            <h3 className="text-sm font-bold text-amber-700 mb-2">
              ⚠️ 慎重に検討したい副業
            </h3>
            <div className="space-y-2 mb-5">
              {result.avoidJobs.map((job, i) => (
                <div
                  key={i}
                  className="bg-amber-50 rounded-xl border border-amber-100 p-4"
                >
                  <h4 className="font-bold text-gray-800 text-sm mb-1">
                    {job.name}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {job.reason}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* アドバイス */}
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 mb-6">
          <h3 className="text-sm font-bold text-emerald-700 mb-2">
            💡 始め方のアドバイス
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {result.advice}
          </p>
        </div>

        <button
          onClick={reset}
          className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          もう一度診断する
        </button>

        <div className="text-right mt-3">
          <AiReportButton
            feature="適性診断"
            output={JSON.stringify(result, null, 2)}
          />
        </div>
      </div>
    );
  }

  // ===== 質問画面 =====
  const currentQuestion = questions[step - 1];
  const progress = Math.round(((step - 1) / totalQuestions) * 100);

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      {/* プログレスバー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">
            質問 {step} / {totalQuestions}
          </span>
          <span className="text-xs text-emerald-600 font-medium">
            {progress}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 質問 */}
      <h2 className="text-lg font-bold text-gray-900 mb-5 leading-relaxed">
        {currentQuestion.text}
      </h2>

      {/* 選択肢 */}
      <div className="space-y-2">
        {currentQuestion.options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleAnswer(currentQuestion.id, option.value)}
            className="w-full text-left bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors"
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* 戻るボタン */}
      {step > 1 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← 前の質問にもどる
        </button>
      )}
    </div>
  );
}
