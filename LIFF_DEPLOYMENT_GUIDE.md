# 📱 LIFFアプリ公開完全ガイド

> **FaceTouch - おかおぺちぺち** をLINE LIFFアプリとして公開する手順

## 📋 目次

1. [GitHub Pagesでアプリを公開](#1-github-pagesでアプリを公開)
2. [LINE Developersでアプリ作成](#2-line-developersでアプリ作成)
3. [LIFF設定](#3-liff設定)
4. [コードにLIFF IDを設定](#4-コードにliff-idを設定)
5. [本番デプロイ](#5-本番デプロイ)
6. [LINEでテスト](#6-lineでテスト)
7. [友達に共有](#7-友達に共有)
8. [セキュリティ設定](#8-セキュリティ設定)
9. [分析・改善](#9-分析改善)

---

## 🚀 1. GitHub Pagesでアプリを公開

### 1-1. プロジェクトをビルド

```powershell
npm run build
```

### 1-2. GitHub Pagesを有効化

1. GitHubリポジトリ（`https://github.com/ono5333/FaceTouch`）にアクセス
2. **Settings** タブをクリック
3. 左サイドバーの **Pages** をクリック
4. **Source** で「Deploy from a branch」を選択
5. **Branch** で「main」を選択、フォルダーは「/ (root)」
6. **Save** をクリック

### 1-3. GitHub Actionsでビルド自動化

`.github/workflows/deploy.yml` を作成：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Setup Pages
        uses: actions/configure-pages@v3
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: dist
          
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

### 1-4. アクセス可能URL

数分後に以下のURLでアクセス可能になります：

```
https://ono5333.github.io/FaceTouch/
```

---

## 📱 2. LINE Developersでアプリ作成

### 2-1. LINE Developersコンソールにアクセス

- **URL**: https://developers.line.biz/console/
- LINEアカウントでログイン

### 2-2. プロバイダーを作成

1. **「プロバイダーを作成」** をクリック
2. **プロバイダー名**: `FaceTouch Games` など
3. **作成** をクリック

### 2-3. チャネルを作成

1. **「チャネルを作成」** をクリック
2. **「LINEログイン」** を選択
3. 基本情報を入力：
   - **チャネル名**: `おかおぺちぺち`
   - **チャネル説明**: `1分間の顔クリックゲーム`
   - **アプリタイプ**: `ウェブアプリ`
   - **メールアドレス**: あなたのメールアドレス
4. **作成** をクリック

---

## 🔧 3. LIFF設定

### 3-1. LIFFアプリを追加

1. 作成したチャネルの **「LIFF」** タブをクリック
2. **「追加」** をクリック
3. LIFF設定を入力：

| 項目 | 設定値 |
|------|--------|
| **LIFFアプリ名** | `おかおぺちぺち` |
| **サイズ** | `Full` |
| **エンドポイントURL** | `https://ono5333.github.io/FaceTouch/` |
| **Scope** | ✅ profile<br>✅ openid |
| **ボットリンク機能** | `On (Aggressive)` |

4. **追加** をクリック

### 3-2. LIFF IDを取得

- 作成されたLIFFアプリの **「LIFF ID」** をコピー
- 例: `1234567890-abcdefgh` → 実際のIDに置換する

---

## 💻 4. コードにLIFF IDを設定

### 4-1. 環境変数ファイル作成

`.env` ファイルを作成：

```env
VITE_LIFF_ID=【ここに実際のLIFF IDを貼り付け】
```

### 4-2. main.jsを更新

```javascript
// LIFF初期化
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await liff.init({
      liffId: import.meta.env.VITE_LIFF_ID || '1234567890-abcdefgh'
    });
    
    if (liff.isLoggedIn()) {
      console.log('LIFF ログイン済み');
      initGame();
    } else {
      liff.login();
    }
  } catch (error) {
    console.error('LIFF初期化エラー:', error);
    // LIFFが使用できない場合でもゲームは動作させる
    initGame();
  }
});
```

### 4-3. vite.config.jsを更新

```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/FaceTouch/',
  define: {
    'process.env': {}
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

### 4-4. package.jsonのscriptsを確認

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 🛠️ 5. 本番デプロイ

### 5-1. 変更をコミット・プッシュ

```powershell
git add .
git commit -m "Add LIFF configuration for production deployment"
git push origin main
```

### 5-2. GitHub Actionsで自動デプロイ

1. プッシュ後、GitHubの **Actions** タブで進行状況確認
2. ✅ 緑色のチェックマークが表示されたら完了
3. `https://ono5333.github.io/FaceTouch/` でアクセス可能

### 5-3. デプロイ確認事項

- [ ] ゲームが正常に表示される
- [ ] 顔クリックが動作する
- [ ] スコア表示が正常
- [ ] モバイルでも正常に動作

---

## 📲 6. LINEでテスト

### 6-1. LIFF URLを取得

LINE Developersコンソールで：

1. LIFF一覧から作成したアプリをクリック
2. **「LIFF URL」** をコピー
3. 例: `https://liff.line.me/1234567890-abcdefgh`

### 6-2. LINEでテスト

1. **スマートフォンのLINEアプリ** でLIFF URLにアクセス
2. または **LINE Developer Console** の「テスト用QRコード」をスキャン
3. ゲームが正常に動作することを確認

### 6-3. テスト項目チェックリスト

- [ ] LINEログインが正常に動作
- [ ] ゲームが正常に開始
- [ ] 顔クリックが反応
- [ ] スコア計算が正確
- [ ] ラッシュモードが動作
- [ ] 結果シェア機能が動作
- [ ] モバイル表示が適切

---

## 🎯 7. 友達に共有

### 7-1. QRコードで共有

- LINE Developersコンソールの **「QRコード」** をダウンロード
- 友達にQRコードを送信

### 7-2. URLで直接共有

```
https://liff.line.me/【あなたのLIFF_ID】
```

### 7-3. LINE Official Accountと連携（オプション）

1. **Messaging API** チャネルも作成
2. リッチメニューやメッセージからゲームに誘導
3. より本格的なLINEアプリとして配布

### 7-4. 共有メッセージ例

```
🎮 新しいゲーム「おかおぺちぺち」をリリースしました！

⏰ 60秒間で顔をクリックして高得点を目指すゲームです
😊 6種類の顔でそれぞれ違うポイント
🏃‍♂️ ラッシュモードで超高速バトル！

下のリンクからプレイできます：
https://liff.line.me/【LIFF_ID】

#おかおぺちぺち #LINEゲーム #Stableソフト
```

---

## 🔒 8. セキュリティ設定

### 8-1. ドメイン制限

LINE Developersで：

1. **チャネル設定** → **LIFF**
2. **「Linked OA」** でドメインを制限
3. `ono5333.github.io` のみ許可

### 8-2. スコープ最小化

必要最小限の権限のみ設定：

- ✅ **profile**: ユーザー名・アイコン取得
- ✅ **openid**: ユーザー識別
- ❌ **chat_message.write**: 不要
- ❌ **email**: 不要

### 8-3. HTTPS必須

- GitHub Pagesは自動的にHTTPS
- カスタムドメイン使用時は必ずHTTPS設定

---

## 📊 9. 分析・改善

### 9-1. Google Analytics追加（オプション）

`index.html` の `<head>` タグ内に追加：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

### 9-2. ユーザーフィードバック収集

`main.js` に追加：

```javascript
// フィードバック機能
function collectFeedback() {
  const feedback = {
    score: gameState.score,
    playTime: GAME_CONFIG.DURATION - gameState.timeLeft,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };
  
  // ローカルストレージに保存
  localStorage.setItem('gameStats', JSON.stringify(feedback));
}

// ゲーム終了時に呼び出し
function endGame() {
  // 既存のコード...
  collectFeedback();
  // 既存のコード...
}
```

### 9-3. パフォーマンス監視

```javascript
// パフォーマンス測定
const performanceMetrics = {
  startTime: performance.now(),
  frameCount: 0,
  averageFPS: 0
};

function measurePerformance() {
  performanceMetrics.frameCount++;
  const elapsed = performance.now() - performanceMetrics.startTime;
  performanceMetrics.averageFPS = (performanceMetrics.frameCount * 1000) / elapsed;
}
```

---

## 🎉 完成！

これで「おかおぺちぺち」がLIFFアプリとして完全に動作します！

### 最終的なURL構成

| 環境 | URL |
|------|-----|
| **開発環境** | `http://localhost:3000/` |
| **本番環境** | `https://ono5333.github.io/FaceTouch/` |
| **LIFF URL** | `https://liff.line.me/【LIFF_ID】` |

### 今後の機能拡張案

- 🏆 **ランキング機能**: スコアランキング表示
- 🎵 **効果音**: クリック時のサウンド
- 🌟 **アニメーション**: より派手なエフェクト
- 📊 **統計機能**: プレイ履歴の表示
- 🏅 **実績システム**: 特定条件でバッジ獲得
- 👥 **マルチプレイ**: 友達と同時プレイ

---

## 🛠️ トラブルシューティング

### よくある問題と解決方法

#### 1. LIFF URLにアクセスできない
```
原因: LIFF IDの設定ミス
解決: main.js内のLIFF IDを確認
```

#### 2. GitHub Pagesでビルドエラー
```
原因: GitHub Actions設定ミス
解決: .github/workflows/deploy.yml を確認
```

#### 3. ゲームが表示されない
```
原因: パスの設定ミス
解決: vite.config.js の base 設定を確認
```

#### 4. モバイルで動作しない
```
原因: レスポンシブ設定
解決: style.css のメディアクエリを確認
```

### サポート連絡先

何か問題が発生した場合は、GitHubのIssuesで報告してください：
`https://github.com/ono5333/FaceTouch/issues`

---

**🎮 Happy Gaming! 楽しいゲーム体験を！**
