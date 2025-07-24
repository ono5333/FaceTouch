# PWA + LIFF ハイブリッド環境セットアップ

## 環境構成

この環境は以下の3つのモードで動作します：

### 1. LIFF環境 (LINE内ブラウザ)
- LINE公式アカウントから起動
- LIFF SDK使用
- LINE固有の共有機能

### 2. PWA環境 (スタンドアロン)
- ホーム画面にインストール済み
- オフライン動作
- Web Share API使用

### 3. Web環境 (通常ブラウザ)
- ブラウザから直接アクセス
- PWAインストールプロンプト表示
- クリップボード共有

## セットアップ手順

### 1. 依存関係インストール
```bash
npm install
```

### 2. PWAアイコン作成
```bash
# ブラウザで icon-generator.html を開いてアイコンをダウンロード
start public/icon-generator.html

# または手動でアイコンを配置
# public/pwa-192x192.png
# public/pwa-512x512.png
```

### 3. 開発サーバー起動
```bash
npm run dev
```

### 4. PWAテスト
```bash
npm run build
npm run preview
```

## 公開方法

### LIFF用
1. `vite.config.js` の `base` を LIFF URL に設定
2. `npm run build`
3. GitHub Pages または任意のホスティングにデプロイ
4. LINE Developers Console で LIFF URL設定

### PWA用
1. `npm run build-pwa`
2. GitHub Pages または PWA対応ホスティングにデプロイ
3. ユーザーにブラウザからアクセスしてもらい、インストールプロンプトを表示

## 特徴

- **自動環境判定**: LIFF、PWA、Webを自動判定
- **適応的共有**: 環境に応じて最適な共有方法を選択
- **オフライン対応**: PWA環境でのキャッシュ機能
- **インストール促進**: PWAインストールボタンの自動表示
- **レスポンシブ**: 全デバイス対応

## 環境別機能

| 機能 | LIFF | PWA | Web |
|------|------|-----|-----|
| ゲーム本体 | ✅ | ✅ | ✅ |
| LINE共有 | ✅ | ❌ | ❌ |
| Web Share API | ❌ | ✅ | ✅* |
| オフライン動作 | ❌ | ✅ | ❌ |
| インストール | ❌ | ✅ | ✅ |
| プッシュ通知 | ❌ | ✅ | ❌ |

*モバイルブラウザのみ
