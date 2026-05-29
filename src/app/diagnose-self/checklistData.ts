// 27項目セルフチェック式 LP診断のデータ
// 副業情報商材・教材の販売ページの典型的な危険サインをまとめたもの。
// チェックの数 × 重みづけ でリスク%を算出。

export type CheckItem = {
  id: string;
  category: string;
  text: string;
  weight: 1 | 2 | 3; // 1=軽い注意 / 2=中程度 / 3=強い危険サイン
};

export const CHECKLIST: CheckItem[] = [
  // === 表現・煽り（10項目） ===
  {
    id: "limited_now",
    category: "表現・煽り",
    text: "「今だけ」「期間限定」が大きく強調されている",
    weight: 2,
  },
  {
    id: "anyone_can",
    category: "表現・煽り",
    text: "「誰でもできる」「初心者でも」が繰り返される",
    weight: 2,
  },
  {
    id: "guaranteed",
    category: "表現・煽り",
    text: "「絶対」「100%」「必ず」などの断定的表現がある",
    weight: 3,
  },
  {
    id: "income_promise",
    category: "表現・煽り",
    text: "「月◯万円稼げる」と具体的な収入を保証している",
    weight: 3,
  },
  {
    id: "reproducible",
    category: "表現・煽り",
    text: "「再現性100%」「全員が成功」と書かれている",
    weight: 3,
  },
  {
    id: "easy_short_time",
    category: "表現・煽り",
    text: "「1日◯分で」「スマホだけで」と簡単さを過度に強調",
    weight: 2,
  },
  {
    id: "before_after",
    category: "表現・煽り",
    text: "ビフォーアフター画像が極端（破産→豪邸など）",
    weight: 2,
  },
  {
    id: "deadline_pressure",
    category: "表現・煽り",
    text: "「残り◯人」「24時間以内」と決断を急がせる",
    weight: 2,
  },
  {
    id: "easy_low_capital",
    category: "表現・煽り",
    text: "「資金ゼロから」「貯金なしOK」を強調",
    weight: 2,
  },
  {
    id: "lifestyle_imagery",
    category: "表現・煽り",
    text: "高級車、海外旅行、札束などのイメージが多用されている",
    weight: 1,
  },

  // === 販売者・実績（7項目） ===
  {
    id: "no_real_name",
    category: "販売者・実績",
    text: "販売者の本名・顔写真が公開されていない",
    weight: 2,
  },
  {
    id: "no_company_info",
    category: "販売者・実績",
    text: "運営会社・連絡先・所在地が明確に書かれていない",
    weight: 3,
  },
  {
    id: "no_tokushoho",
    category: "販売者・実績",
    text: "特定商取引法に基づく表記がない（または見つけにくい）",
    weight: 3,
  },
  {
    id: "screenshot_only",
    category: "販売者・実績",
    text: "実績がスクショ・口コミ画像のみで第三者検証なし",
    weight: 2,
  },
  {
    id: "celebrity_testimonial",
    category: "販売者・実績",
    text: "有名人・芸能人推薦の写真があるが本人確認できない",
    weight: 2,
  },
  {
    id: "unverifiable_results",
    category: "販売者・実績",
    text: "確定申告書や取引履歴の証明がない",
    weight: 1,
  },
  {
    id: "no_track_record",
    category: "販売者・実績",
    text: "販売者がいつから何年活動しているかが書かれていない",
    weight: 1,
  },

  // === 価格・契約（6項目） ===
  {
    id: "price_5k_10w",
    category: "価格・契約",
    text: "価格が 5,000円〜10万円台（情報商材の典型レンジ）",
    weight: 1,
  },
  {
    id: "support_too_short",
    category: "価格・契約",
    text: "サポート期間が1ヶ月以下と極端に短い",
    weight: 2,
  },
  {
    id: "interview_pressure",
    category: "価格・契約",
    text: "「無料相談」「面談」を必須化している",
    weight: 2,
  },
  {
    id: "no_refund",
    category: "価格・契約",
    text: "返金保証がない or 条件が極端に厳しい",
    weight: 2,
  },
  {
    id: "upsell_hint",
    category: "価格・契約",
    text: "「上位コース」「個別コンサル」のオプションが案内されている",
    weight: 2,
  },
  {
    id: "vague_what_youget",
    category: "価格・契約",
    text: "購入後に何が手に入るかが具体的でない",
    weight: 2,
  },

  // === 内容・手法（4項目） ===
  {
    id: "high_sku_recommendation",
    category: "内容・手法",
    text: "「数百SKU」「大量出品」「無在庫転売」を推奨",
    weight: 2,
  },
  {
    id: "yuan_markup",
    category: "内容・手法",
    text: "中国仕入れの「元」表記で価格を錯覚させる仕組みあり",
    weight: 2,
  },
  {
    id: "no_risk_disclosure",
    category: "内容・手法",
    text: "失敗例・リスクの説明が一切ない",
    weight: 3,
  },
  {
    id: "vague_method",
    category: "内容・手法",
    text: "「秘密の方法」「独自ノウハウ」と具体性がない",
    weight: 2,
  },
];

export const TOTAL_MAX_SCORE = CHECKLIST.reduce((s, i) => s + i.weight, 0);

// リスク%を判定文に変換
export function getRiskLabel(percent: number): {
  label: string;
  color: "green" | "yellow" | "orange" | "red";
  message: string;
} {
  if (percent < 20) {
    return {
      label: "比較的安全",
      color: "green",
      message:
        "目立つ危険サインは少ないようです。それでも購入前に販売者の実績を独自に検証することをおすすめします。",
    };
  }
  if (percent < 40) {
    return {
      label: "やや注意",
      color: "yellow",
      message:
        "いくつか警戒すべきサインがあります。価格・サポート期間・販売者情報を冷静に確認してから判断してください。",
    };
  }
  if (percent < 60) {
    return {
      label: "要警戒",
      color: "orange",
      message:
        "情報商材の典型的なパターンが複数見られます。一度購入を保留し、第三者の意見も聞いてみましょう。",
    };
  }
  return {
    label: "高リスク",
    color: "red",
    message:
      "副業詐欺・悪質情報商材のパターンに強く当てはまります。購入は控えるか、消費生活センター（188）で相談を検討してください。",
  };
}
