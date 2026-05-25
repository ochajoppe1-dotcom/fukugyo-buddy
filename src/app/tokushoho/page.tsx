import LegalLayout from "../components/LegalLayout";

export const metadata = {
  title: "特定商取引法に基づく表記｜副業バディAI",
};

export default function TokushohoPage() {
  return (
    <LegalLayout title="特定商取引法に基づく表記">
      <p className="text-sm text-gray-500 mb-6">最終更新日：2026年5月25日</p>

      <table className="w-full text-sm border-collapse">
        <tbody>
          <Row label="販売事業者" value="YAMATARO（個人事業主）" />
          <Row label="運営責任者" value="YAMATARO" />
          <Row
            label="所在地"
            value="請求があれば遅滞なく開示します。"
            note="お問い合わせフォームまたはメールにてご請求ください。"
          />
          <Row
            label="電話番号"
            value="請求があれば遅滞なく開示します。"
            note="お問い合わせフォームまたはメールにてご請求ください。"
          />
          <Row label="メールアドレス" value="ochajoppe1@gmail.com" />
          <Row
            label="サービス名"
            value="副業バディAI（fukugyo-buddy）"
          />
          <Row
            label="販売価格"
            value="Free：0円／Standard：月額550円（税込）／Premium：月額990円（税込）"
            note="価格は予告なく変更する場合があります。"
          />
          <Row
            label="商品代金以外の必要料金"
            value="インターネット接続料金、通信料金等はお客様のご負担となります。"
          />
          <Row label="支払方法" value="クレジットカード決済（Stripe）" />
          <Row
            label="支払時期"
            value="初回登録時の7日間無料トライアル終了後、毎月自動課金されます。"
          />
          <Row
            label="サービスの提供時期"
            value="決済完了後、即時ご利用いただけます。"
          />
          <Row
            label="解約方法"
            value="アカウント画面の「プラン変更・解約」ボタンから、いつでもワンクリックで解約できます。解約後も、お支払い済みの期間内はサービスをご利用いただけます。"
          />
          <Row
            label="返金について"
            value="デジタルサービスの性質上、原則として返金は行っておりません。ただし、当サービスの瑕疵によりサービスを利用できなかった場合は、当該期間分の料金を返金いたします。"
          />
          <Row
            label="動作環境"
            value="最新版の主要ブラウザ（Chrome、Safari、Firefox、Edge）でご利用ください。インターネット接続が必須です。"
          />
        </tbody>
      </table>

      <p className="text-xs text-gray-500 mt-8">
        ※ 個人運営のため、所在地・電話番号はプライバシー保護のため非公開としていますが、特定商取引法第11条第1項に基づき、ご請求があった場合は遅滞なく開示いたします。お問い合わせは上記メールアドレスまでお願いいたします。
      </p>
    </LegalLayout>
  );
}

function Row({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <tr className="border-b border-gray-100">
      <th className="text-left align-top py-3 pr-4 w-1/3 font-semibold text-gray-700">
        {label}
      </th>
      <td className="py-3 text-gray-700">
        {value}
        {note && (
          <p className="text-xs text-gray-500 mt-1">{note}</p>
        )}
      </td>
    </tr>
  );
}
