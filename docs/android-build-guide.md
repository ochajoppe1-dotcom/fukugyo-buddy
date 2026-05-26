# 📱 Android APP化ビルドガイド

副業バディAI（Webアプリ）を Capacitor 経由で Android アプリにする手順。

## 設計方針：WebView ラッパー方式

Next.js（SSR）の本番デプロイ（fukugyo-buddy.vercel.app）を、AndroidアプリのWebViewでそのまま表示する戦略。

**メリット:**
- Web側の更新が即アプリに反映（再リリース不要）
- SSR機能・Stripe決済・Supabase認証がそのまま使える
- メンテナンス2重化を避けられる

**デメリット:**
- オフライン動作不可（PWAキャッシュは活用可能）
- 完全ネイティブな体験ではない

→ MVP段階では十分。後でフルネイティブ化したくなったら静的エクスポートに移行。

---

## 前提：必要なソフト

### 必須
- **Android Studio**（最新版）  
  https://developer.android.com/studio
- **Java JDK 17以上**（Android Studio に同梱）

### Google Play 公開時に必要
- **Google Play Console アカウント**（$25 一回限り）  
  https://play.google.com/console
- **署名証明書（keystore）**

---

## 🛠 セットアップ済みの内容（おれっち実施済み）

すでに以下は完了：
- `@capacitor/core` `@capacitor/cli` `@capacitor/android` インストール
- `capacitor.config.ts` 作成（appId: `ai.fukugyobuddy.app`）
- `npx cap add android` で `android/` ディレクトリ生成
- `.gitignore` に Android ビルド成果物を追加

→ **やまちゃんがやるのは「Android Studioで開く」以降**

---

## 📲 やまちゃんの手順

### Step 1：Android Studio インストール（初回のみ）

1. https://developer.android.com/studio から最新版をダウンロード
2. インストーラー実行（Windowsなら標準パスでOK）
3. 初回起動時に SDK・エミュレーターをダウンロード（数GB、30〜60分）

### Step 2：プロジェクトを Android Studio で開く

副業バディAI のルートで以下を実行：

```bash
cd C:\Users\rairy\Projects\fukugyo-buddy
npx cap open android
```

→ Android Studio が `android/` ディレクトリを開く

### Step 3：Gradle同期

Android Studio が自動で `Gradle sync...` を始める。  
初回は依存関係のダウンロードで5〜15分かかる。

完了後、左サイドバーの構造を確認：
- `app/manifests/AndroidManifest.xml`
- `app/java/ai.fukugyobuddy.app/MainActivity`
- `app/res/values/strings.xml`

### Step 4：エミュレーターまたは実機で起動

#### A. Android仮想デバイス（エミュレーター）で起動
1. ツールバー上部のデバイスドロップダウン → **Device Manager**
2. **Create Device** → Pixel 6 など適当に → API 34 を選択
3. 作成したエミュレーター選択 → ▶ Run ボタン
4. エミュレーターが起動 → 副業バディAIが表示される

#### B. 実機（自分のAndroidスマホ）で起動
1. スマホで「開発者オプション」有効化（設定 → 端末情報 → ビルド番号を7回タップ）
2. 「USBデバッグ」有効化
3. PCにUSB接続
4. Android Studioのデバイスリストに自分のスマホが表示される → 選択 → ▶ Run

### Step 5：動作確認

エミュレーター/実機で：
- ✅ アプリ起動 → 副業バディAI のトップ画面が表示される
- ✅ LP診断などをタップ → ページ遷移
- ✅ ログイン → Supabase認証 OK
- ✅ ボトムナビ動作
- ✅ ⚠ ステータスバー・キーボードまわりの違和感がないか

---

## 🎨 アプリアイコン設定

現状はCapacitorデフォルトのアイコン。リリース前に変更必要。

### 推奨ツール
- **Android Asset Studio**: https://romannurik.github.io/AndroidAssetStudio/  
  もしくは
- **AppIcon.co**: https://www.appicon.co/

### 手順
1. 元画像を1枚用意（推奨：1024×1024 PNG、副業バディAIの盾アイコン色を活かす）
2. 上記ツールで Android用 mipmap セットを生成
3. 生成された `mipmap-*` フォルダを `android/app/src/main/res/` 内に上書き
4. Android Studio で Build → Make Project

おれっち、もし元画像準備できればAndroidアイコン生成も自動でできるよ。

---

## 🚀 リリースビルド（Google Play 提出用）

### Step 1：keystore 署名証明書を作成

```bash
keytool -genkey -v -keystore release.keystore -alias fukugyobuddy -keyalg RSA -keysize 2048 -validity 10000
```

質問に答える：
- パスワード（必ずメモ・絶対紛失NG）
- 名前・組織・部署・市・州・国コード

→ `release.keystore` ファイルが生成される

⚠️ **このkeystoreは厳重に保管。紛失すると同じappIdでアプリ更新できなくなる**

### Step 2：署名情報を `android/key.properties` に書く

```properties
storeFile=../release.keystore
storePassword=設定したパスワード
keyAlias=fukugyobuddy
keyPassword=設定したパスワード
```

⚠️ `key.properties` は .gitignore 済み（コミットしない）

### Step 3：Android Studio でリリースビルド

1. メニュー：**Build → Generate Signed Bundle / APK**
2. **Android App Bundle (.aab)** を選択（Google Play推奨）
3. keystore選択 → エイリアス入力
4. Release ビルドタイプ選択 → Finish
5. 数分後 `android/app/release/app-release.aab` が生成される

### Step 4：Google Play Console で公開

1. https://play.google.com/console
2. **アプリを作成** → アプリ名「副業バディAI」
3. **アプリのコンテンツ** で以下を入力：
   - プライバシーポリシーURL: `https://fukugyo-buddy.vercel.app/privacy`
   - 対象年齢
   - 広告の有無：なし
   - データ収集の申告（Supabase認証で取得するメアド等）
4. **製品版** → 新しいリリースを作成 → .aab をアップロード
5. リリースノート記入 → 審査提出

審査は数時間〜数日。

---

## 🆘 トラブル対応

### "Gradle sync failed"
- Java JDKバージョン確認（17以上必須）
- Android Studio → File → Invalidate Caches → Restart

### アプリ起動するが画面真っ白
- `capacitor.config.ts` の server.url が正しいか
- `https://fukugyo-buddy.vercel.app` がブラウザで開けるか
- Chrome DevTools で chrome://inspect/#devices を使い、エミュレーターのコンソールを見る

### Stripe Checkoutに遷移できない
- AndroidのIntent設定が必要な場合がある
- WebViewからの外部URL遷移をMainActivityで許可しているか確認

### Google Play 審査リジェクト
- プライバシーポリシーURL が公開・アクセス可能か
- アプリ説明に誇大表現がないか
- 「副業詐欺」「保証」等のNGワードに注意

---

## 📊 今後の発展

- **オフラインキャッシュ**：Service Worker / PWA キャッシュ戦略
- **プッシュ通知**：Capacitor Push Notifications + FCM
- **アプリ内課金**：StripeをやめてGoogle Play Billingに移行（30%手数料）
  - or Stripe維持で「外部決済」表示
- **iOS版**：`npx cap add ios` で同様に追加可能（Apple Developer $99/年）

---

## ✍ 編集履歴

- 2026-05-26：初版作成（Capacitor導入完了時点）
