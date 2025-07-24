# Capacitorを使ったネイティブアプリ化手順

## 1. Capacitorのインストール

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
```

## 2. Capacitorの初期化

```bash
npx cap init おかおぺちぺち jp.stablesoft.okaopetipeti
```

## 3. プラットフォーム追加

```bash
# iOS
npx cap add ios

# Android
npx cap add android
```

## 4. ビルドと同期

```bash
# Webアプリをビルド
npm run build

# プラットフォームに同期
npx cap sync
```

## 5. ネイティブ開発環境で開く

```bash
# iOS (Xcode必要)
npx cap open ios

# Android (Android Studio必要)
npx cap open android
```

## 必要な設定ファイル

### capacitor.config.ts
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'jp.stablesoft.okaopetipeti',
  appName: 'おかおぺちぺち',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ff6b6b",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    }
  }
};

export default config;
```

## アプリストア公開準備

### iOS App Store
1. Apple Developer Program登録 (年間$99)
2. App Store Connect設定
3. Xcodeでアーカイブ＆アップロード
4. App Store審査提出

### Google Play Store
1. Google Play Console登録 (一回$25)
2. アプリ署名設定
3. APK/AABアップロード
4.審査提出

## 料金
- Apple Developer: $99/年
- Google Play: $25 (一回のみ)
