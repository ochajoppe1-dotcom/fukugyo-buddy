import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "アカウントの削除について",
  description:
    "副業バディAIのアカウントと関連データの削除方法・削除されるデータの種類・保持期間についてのご案内です。",
};

export default function AccountDeletionPage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-700 text-sm transition-colors"
          >
            ← 戻る
          </Link>
          <h1 className="font-bold text-gray-900">アカウントの削除について</h1>
        </div>
      </header>

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-8 text-gray-700">
          <p className="text-sm leading-relaxed">
            副業バディAI（運営：副業バディAI事務局）では、ユーザーご自身で、アカウントと関連データをいつでも削除できます。このページでは、その手順・削除されるデータの種類・保持期間についてご案内します。
          </p>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              アカウント削除の手順
            </h2>
            <ol className="space-y-2 text-sm leading-relaxed list-decimal list-inside bg-white rounded-2xl border border-gray-100 p-4">
              <li>
                アプリまたはWebサイト（fukugyo-buddy.vercel.app）にログインします。
              </li>
              <li>画面下部メニューの「マイページ」を開きます。</li>
              <li>「アカウントを削除する」を選択します。</li>
              <li>
                確認画面で実行すると、アカウントと関連データが削除されます。
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              削除されるデータ
            </h2>
            <ul className="space-y-1.5 text-sm leading-relaxed bg-white rounded-2xl border border-gray-100 p-4">
              <li>・アカウント情報（メールアドレス）</li>
              <li>・副業日記の記録（売上・経費・作業時間など）</li>
              <li>・AI相談の履歴</li>
              <li>・各種診断の結果・利用履歴</li>
              <li>・サブスクリプションに関する情報</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              データの保持期間
            </h2>
            <p className="text-sm leading-relaxed">
              アカウント削除を実行すると、アカウント情報および上記の関連データは速やかに削除されます。バックアップ等に一時的に残るデータについても、最大30日以内に消去されます。なお、法令にもとづき保持が必要な情報（取引記録など）がある場合は、必要な期間に限り保持することがあります。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              お困りの場合
            </h2>
            <p className="text-sm leading-relaxed">
              削除がうまくいかない場合や、削除に関するご質問は、
              <Link
                href="/contact"
                className="text-emerald-600 hover:underline"
              >
                お問い合わせフォーム
              </Link>
              からご連絡ください。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
