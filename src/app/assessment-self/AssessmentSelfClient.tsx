"use client";

import { useState } from "react";
import { questions, calculateResult, type PersonaResult } from "./selfData";
import ShareButtons from "../components/ShareButtons";
import ReviewPrompt from "../components/ReviewPrompt";
import AppInstallBanner from "../components/AppInstallBanner";

export default function AssessmentSelfClient() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PersonaResult | null>(null);

  const totalQuestions = questions.length;

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (step < totalQuestions) {
      setStep(step + 1);
    }

    if (step === totalQuestions) {
      setResult(calculateResult(newAnswers));
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
  };

  // ===== イントロ画面 =====
  if (step === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          副業適性診断（無料版）
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          15の質問に答えると、あなたに向いた副業タイプを判定します。
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

  // ===== 結果画面 =====
  if (result) {
    return (
      <div className="max-w-xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span>📊</span> 診断結果
        </h2>

        {/* ペルソナ */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 mb-4">
          <p className="text-xs text-gray-500 mb-2">あなたのタイプは</p>
          <h3 className="text-xl font-bold text-emerald-700 mb-3">
            {result.persona}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {result.description}
          </p>
        </div>

        {/* 向いてる副業 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">
            ✅ あなたに向いてる副業
          </h3>
          <ol className="space-y-2 list-decimal list-inside">
            {result.topJobs.map((job, i) => (
              <li key={i} className="text-sm text-gray-700 leading-relaxed">
                {job}
              </li>
            ))}
          </ol>
        </div>

        {/* 避けるべき */}
        {result.avoidJobs.length > 0 && (
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 mb-4">
            <h3 className="text-sm font-bold text-amber-700 mb-3">
              ⚠ 慎重に検討したい副業
            </h3>
            <ul className="space-y-1.5">
              {result.avoidJobs.map((job, i) => (
                <li
                  key={i}
                  className="text-sm text-gray-700 leading-relaxed flex gap-2"
                >
                  <span className="text-amber-500">•</span>
                  <span>{job}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* アドバイス */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-5">
          <h3 className="text-sm font-bold text-emerald-700 mb-2">
            💡 始め方のアドバイス
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {result.advice}
          </p>
        </div>

        {/* シェアボタン（バイラル誘導） */}
        <div className="mb-5">
          <ShareButtons
            text={`副業適性診断やってみた🧭\n私のタイプは「${result.persona}」でした！`}
            hashtags={["副業バディAI", "副業適性診断", "副業"]}
            url="https://fukugyo-buddy.vercel.app/assessment-self"
          />
        </div>

        {/* Standard誘導 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            🤖 AI版なら、あなた専用の提案まで
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            このセルフ診断はパターン判定ですが、<strong>Standardプラン</strong>のAI適性診断なら、あなたの回答を読み解いて向いている副業TOP3を理由付きで提案。月5回まで何度でも試せます。
          </p>
          <a
            href="/#pricing"
            className="inline-block bg-emerald-600 text-white text-sm px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            7日間無料で試す →
          </a>
          <p className="text-xs text-gray-400 mt-2">
            初回7日間無料 ／ いつでも解約できます
          </p>
        </div>

        <button
          onClick={reset}
          className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          もう一度診断する
        </button>

        {/* 診断を使ってくれた人をアプリへ（Web閲覧時のみ表示） */}
        <AppInstallBanner source="assessment_self" className="mt-4" />

        {/* 診断を終えた直後＝満足度が高い瞬間にだけレビューをお願いする（アプリ版のみ） */}
        <ReviewPrompt variant="completion" />
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

      <h2 className="text-lg font-bold text-gray-900 mb-5 leading-relaxed">
        {currentQuestion.text}
      </h2>

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
