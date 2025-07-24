# React Native Expoでの移植ガイド

## Expo Go での開発・テスト (完全無料)

### 1. 新プロジェクト作成
```bash
npx create-expo-app おかおぺちぺち
cd おかおぺちぺち
```

### 2. 必要な依存関係
```bash
npx expo install react-native-svg
npx expo install expo-gl expo-gl-cpp
npx expo install expo-sharing
npx expo install expo-clipboard
```

### 3. ゲームコンポーネント例

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

const FaceClickGame = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [faces, setFaces] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height - 200;

  // ゲームロジックをここに移植
  // Canvas APIの代わりにSVGやAnimated APIを使用

  return (
    <View style={{ flex: 1, backgroundColor: '#ff6b6b' }}>
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>
          🎮 おかおぺちぺち
        </Text>
        <Text style={{ fontSize: 18, color: 'white' }}>
          スコア: {score} | 残り時間: {timeLeft}秒
        </Text>
      </View>
      
      <View style={{ flex: 1, backgroundColor: 'white', margin: 10, borderRadius: 10 }}>
        <Svg width={screenWidth - 20} height={screenHeight}>
          {faces.map((face, index) => (
            <Circle
              key={index}
              cx={face.x}
              cy={face.y}
              r={30}
              fill={face.color}
              onPress={() => handleFaceClick(face.id)}
            />
          ))}
        </Svg>
      </View>
      
      <View style={{ padding: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: isPlaying ? '#ff4757' : '#2ed573',
            padding: 15,
            borderRadius: 25,
            alignItems: 'center'
          }}
          onPress={isPlaying ? endGame : startGame}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
            {isPlaying ? 'ゲーム終了' : 'ゲーム開始'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FaceClickGame;
```

## Expo Goでのテスト
1. スマホにExpo Goアプリをインストール
2. `npx expo start` でQRコード表示
3. スマホでQRコードをスキャン
4. 即座にアプリをテスト可能

## アプリストア公開 (EAS Build使用)
```bash
# EAS CLI インストール
npm install -g @expo/eas-cli

# EAS設定
eas build:configure

# iOS/Android ビルド
eas build --platform ios
eas build --platform android

# アプリストア提出
eas submit --platform ios
eas submit --platform android
```

## 料金
- 開発・テスト: 完全無料
- アプリストア公開: $99/月 (EAS Build使用時)
  または手動ビルドで無料
