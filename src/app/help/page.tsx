import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "よくある質問・ヘルプ",
  description:
    "副業バディAIの料金プラン、解約方法、AI機能の限界、データの取り扱いなどよくある質問にお答えします。",
};

const FAQ_GROUPS = [
  {
    title: "料金・プラン",
    items: [
      {
        q: "Free プランで何ができますか？",
        a: "LP診断（月3回）と AI相談（月3回）が無料でご利用いただけます。アカウント登録のみで使えます。クレジットカード登録不要です。",
      },
      {
        q: "Standard と Premium の違いは？",
        a: "Standard（¥550/月）は副業を「始めて続ける」ためのプランです：LP診断無制限・AI相談月20回（日記の数字を踏まえた回答可）・適性診断・副業日記・数字レポート月1回・詐欺アラートが使えます。Premium（¥990/月）は「本業化を目指す人向け」のプランで、Standardに加えてAI相談無制限+会話の全記憶、レポート月4回、AI副業ロードマップ、AI実務サポート、緊急時テンプレ生成が使えます。",
      },
      {
        q: "AI相談で自分の日記データはどこまで使われますか？",
        a: "Standard以上のプランでは、AI相談中にあなたの副業日記の累計データ（売上・経費・時間・時給）が参考情報としてAIに渡され、より具体的な返答が可能になります。Premium はさらに過去の会話内容も記憶されるため、相談履歴を踏まえた継続的な伴走が可能です。",
      },
      {
        q: "本当に7日間無料ですか？",
        a: "はい。初回登録時のみ7日間トライアル期間中は料金が発生しません。8日目から月額料金が自動的に課金されます。トライアル中の解約予約も可能です。",
      },
      {
        q: "解約はどうやってしますか？",
        a: "マイページ → 「プラン変更・解約」ボタン → Stripeカスタマーポータルで「サブスクリプションをキャンセル」をクリックしてください。解約後も、お支払い済みの期間内はサービスをご利用いただけます。",
      },
      {
        q: "解約予約のキャンセルはできますか？",
        a: "はい。マイページの「プラン変更・解約」から、Stripeポータルで「サブスクリプションをキャンセルしない」を選べば予約を取り消せます。",
      },
      {
        q: "支払い方法は？",
        a: "クレジットカード決済（Stripe決済）のみ対応しています。Visa・Mastercard・JCB・American Expressをご利用いただけます。",
      },
    ],
  },
  {
    title: "機能について",
    items: [
      {
        q: "AI相談で何が聞けますか？",
        a: "副業選び、始め方、続け方、辞め時、詐欺被害、数字の悩みなど、副業全般の相談に対応しています。なお、税理・法律・医療・投資の具体的助言は専門家にお譲りしますので、適切な相談先をご案内します。",
      },
      {
        q: "Premium の「全記憶」とは？",
        a: "Premiumプランでは、AI相談の会話履歴がアカウントに保存され、次回ログイン時に前回の会話を引き継いで続けられます。Standardプラン以下は会話履歴を保存しません（ページを閉じるとリセット）。",
      },
      {
        q: "LP診断の精度は？",
        a: "AIが27の典型的な危険サインに基づき判定します。100%の判定はできませんが、購入前の冷静なチェックとしてご活用ください。最終的な購入判断はご自身で行ってください。",
      },
      {
        q: "副業日記のデータはどう管理されますか？",
        a: "Supabaseのデータベースに保存され、行レベルセキュリティ（RLS）により本人以外は閲覧できません。アカウント削除時に全データを削除します。",
      },
      {
        q: "詐欺アラートで個別企業を名指ししないのは？",
        a: "業界全体の典型パターンを教育目的で紹介しているため、特定企業の名指しは法的リスク（名誉毀損）回避のため避けています。実際の被害事例は消費生活センター（188）等にご相談ください。",
      },
    ],
  },
  {
    title: "アカウント・データ",
    items: [
      {
        q: "アカウントを削除したい",
        a: "マイページ（/account）の一番下にある「アカウントを削除する」から自動削除できます。サブスクの自動解約 + 副業日記・チャット履歴・利用回数等の全データを即座に削除します。削除前に副業日記のCSVバックアップをおすすめします。",
      },
      {
        q: "パスワードを忘れた",
        a: "ログイン画面の「パスワードを忘れた方」リンクをクリックし、登録メールアドレスを入力してください。リセット用リンクをメールでお送りします。",
      },
      {
        q: "メールアドレスを変更したい",
        a: "マイページのアカウント情報セクションにある「編集」ボタンから変更できます。新しいメールアドレスに確認メールが届くので、リンクをクリックして完了させてください。",
      },
      {
        q: "副業日記のデータをエクスポートしたい",
        a: "副業日記ページ（/diary）の上部にある「CSVでダウンロード」ボタンから、全データをCSV形式でダウンロードできます。Excel・Googleスプレッドシート等で開けます。Standardプラン以上で利用可能。",
      },
    ],
  },
  {
    title: "技術・トラブル",
    items: [
      {
        q: "AI生成の結果が変・不適切",
        a: "AIは完璧ではなく、不適切な出力をすることがあります。出力内容は参考情報であり、最終判断はご自身で行ってください。明らかに問題のある出力は fukugyo.buddy.ai@gmail.com までご報告ください。",
      },
      {
        q: "決済できない・課金が反映されない",
        a: "Stripe側で処理されたが当サービスに反映されない場合があります。お問い合わせフォーム（/contact）でカテゴリ「課金トラブル」を選び、決済日時とメールアドレスを添えてご連絡ください。通常2〜3営業日以内にお返事します。",
      },
      {
        q: "スマホアプリ版はありますか？",
        a: "Android版を準備中です。当面はブラウザでアクセスしてください。ホーム画面に追加するとアプリのように使えます（PWA対応）。",
      },
    ],
  },
];

export default function HelpPage() {
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
          <h1 className="font-bold text-gray-900">よくある質問</h1>
        </div>
      </header>

      <section className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
          {FAQ_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                {group.title}
              </h2>
              <div className="space-y-2">
                {group.items.map((item, i) => (
                  <details
                    key={i}
                    className="bg-white rounded-2xl border border-gray-100 group"
                  >
                    <summary className="px-5 py-4 cursor-pointer text-sm font-semibold text-gray-900 flex items-center justify-between list-none">
                      <span>Q. {item.q}</span>
                      <span className="text-emerald-600 group-open:rotate-180 transition-transform">
                        ▾
                      </span>
                    </summary>
                    <div className="px-5 pb-4 text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-3">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}

          {/* お問い合わせ */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mt-8">
            <h2 className="text-sm font-bold text-emerald-700 mb-2">
              💬 解決しない場合
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              上記で解決しないお問い合わせは、お問い合わせフォームをご利用ください。通常2〜3営業日以内にお返事します。
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              お問い合わせフォームへ →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
