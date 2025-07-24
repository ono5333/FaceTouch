import './style.css'

// PWA環境判定
const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
             window.navigator.standalone || 
             document.referrer.includes('android-app://');

const isLIFFContext = () => {
  return typeof liff !== 'undefined' && window.location.href.includes('line');
};

// LIFF初期化
document.addEventListener('DOMContentLoaded', async () => {
  console.log('環境判定:', { isPWA, isLIFFContext: isLIFFContext() });
  
  if (isLIFFContext()) {
    // LIFF環境での初期化
    try {
      await liff.init({
        liffId: process.env.LIFF_ID || '1234567890-abcdefgh'
      });
      
      if (liff.isLoggedIn()) {
        console.log('LIFF ログイン済み');
        initGame();
      } else {
        liff.login();
      }
    } catch (error) {
      console.error('LIFF初期化エラー:', error);
      initGame();
    }
  } else {
    // PWA/Web環境での初期化
    console.log('PWA/Web環境で起動');
    initGame();
  }
  
  // PWA インストールプロンプト処理
  setupPWAInstall();
});

// ゲーム設定
const GAME_CONFIG = {
  DURATION: 60, // 60秒
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  MAX_FACES: 100, // ラッシュモード用に最大100個に変更
  INITIAL_FACES: 10,
  FACE_SIZE: 60,
  MOVE_SPEED: 600, // ピクセル/秒 (6倍に増加)
  
  // ラッシュモード設定
  RUSH_MODE_THRESHOLD: 10, // 残り10秒
  RUSH_SPAWN_INTERVAL: 100, // ラッシュモード時: 0.1秒 = 100ms
  NORMAL_SPAWN_INTERVAL: 300, // 通常時: 0.3秒 = 300ms
  
  // 顔タイプ
  FACE_TYPES: {
    HAPPY: { emoji: '😊', points: 10, duration: 4000, color: '#FFD700' }, // 2秒→4秒
    NORMAL: { emoji: '😐', points: 5, duration: 4000, color: '#87CEEB' }, // 2秒→4秒
    SAD: { emoji: '😢', points: 2, duration: 4000, color: '#DDA0DD' }, // 2秒→4秒
    ANGRY: { emoji: '😠', points: -10, duration: 4000, color: '#FF6347' }, // 2秒→4秒
    DEVIL: { emoji: '😈', points: 'half', duration: 7000, color: '#8B0000' }, // 5秒→7秒
    ANGEL: { emoji: '😇', points: 'double', duration: 3000, color: '#FFFFFF' } // 1秒→3秒
  },
  
  // 特殊な顔の出現タイミング
  SPECIAL_TIMING: {
    DEVIL: [30, 50], // 30秒後と50秒後
    ANGEL: [30, 50]
  }
};

// ゲーム状態
let gameState = {
  isPlaying: false,
  score: 0,
  timeLeft: GAME_CONFIG.DURATION,
  faces: [],
  canvas: null,
  ctx: null,
  gameTimer: null,
  animationFrame: null,
  specialFacesShown: {
    devil: 0,
    angel: 0
  },
  rushMode: false,
  rushTimer: null,
  normalTimer: null,
  rushSpecialTimer: null
};

// Face クラス
class Face {
  constructor(type, x, y) {
    this.type = type;
    this.config = GAME_CONFIG.FACE_TYPES[type];
    this.x = x || Math.random() * (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.FACE_SIZE);
    this.y = y || Math.random() * (GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.FACE_SIZE);
    this.vx = (Math.random() - 0.5) * GAME_CONFIG.MOVE_SPEED;
    this.vy = (Math.random() - 0.5) * GAME_CONFIG.MOVE_SPEED;
    this.createdAt = Date.now();
    this.size = GAME_CONFIG.FACE_SIZE;
    this.isClicked = false;
  }

  update(deltaTime) {
    if (this.isClicked) return;

    // 位置更新
    this.x += this.vx * deltaTime / 1000;
    this.y += this.vy * deltaTime / 1000;

    // 境界での跳ね返り
    if (this.x <= 0 || this.x >= GAME_CONFIG.CANVAS_WIDTH - this.size) {
      this.vx *= -1;
      this.x = Math.max(0, Math.min(this.x, GAME_CONFIG.CANVAS_WIDTH - this.size));
    }
    if (this.y <= 0 || this.y >= GAME_CONFIG.CANVAS_HEIGHT - this.size) {
      this.vy *= -1;
      this.y = Math.max(0, Math.min(this.y, GAME_CONFIG.CANVAS_HEIGHT - this.size));
    }
  }

  draw(ctx) {
    if (this.isClicked) return;

    // 背景円
    ctx.fillStyle = this.config.color;
    ctx.beginPath();
    ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, Math.PI * 2);
    ctx.fill();

    // 顔の絵文字
    ctx.font = `${this.size * 0.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      this.config.emoji,
      this.x + this.size/2,
      this.y + this.size/2
    );

    // 残り時間インジケーター（特殊な顔のみ）
    if (this.type === 'DEVIL' || this.type === 'ANGEL') {
      const elapsed = Date.now() - this.createdAt;
      const progress = elapsed / this.config.duration;
      const barWidth = this.size;
      const barHeight = 4;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(this.x, this.y - 10, barWidth, barHeight);
      
      ctx.fillStyle = progress > 0.7 ? '#ff0000' : '#00ff00';
      ctx.fillRect(this.x, this.y - 10, barWidth * (1 - progress), barHeight);
    }
  }

  isExpired() {
    return Date.now() - this.createdAt > this.config.duration;
  }

  contains(x, y) {
    const centerX = this.x + this.size/2;
    const centerY = this.y + this.size/2;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    return distance <= this.size/2;
  }

  onClick() {
    this.isClicked = true;
    return this.config.points;
  }
}

// ゲーム初期化
function initGame() {
  gameState.canvas = document.getElementById('game-canvas');
  gameState.ctx = gameState.canvas.getContext('2d');
  
  // レスポンシブ対応
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // イベントリスナー設定
  setupEventListeners();
  
  console.log('ゲーム初期化完了');
}

function resizeCanvas() {
  const container = gameState.canvas.parentElement;
  const containerWidth = container.clientWidth;
  const aspectRatio = GAME_CONFIG.CANVAS_HEIGHT / GAME_CONFIG.CANVAS_WIDTH;
  
  if (containerWidth < GAME_CONFIG.CANVAS_WIDTH) {
    gameState.canvas.style.width = '100%';
    gameState.canvas.style.height = `${containerWidth * aspectRatio}px`;
  } else {
    gameState.canvas.style.width = `${GAME_CONFIG.CANVAS_WIDTH}px`;
    gameState.canvas.style.height = `${GAME_CONFIG.CANVAS_HEIGHT}px`;
  }
}

function setupEventListeners() {
  // ボタンイベント
  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('end-btn').addEventListener('click', endGame);
  document.getElementById('replay-btn').addEventListener('click', startGame);
  document.getElementById('quit-btn').addEventListener('click', () => {
    hideResultScreen();
    resetGame();
  });
  document.getElementById('share-btn').addEventListener('click', shareResult);
  
  // キャンバスクリックイベント
  gameState.canvas.addEventListener('click', handleCanvasClick);
}

function handleCanvasClick(event) {
  if (!gameState.isPlaying) return;
  
  const rect = gameState.canvas.getBoundingClientRect();
  const scaleX = GAME_CONFIG.CANVAS_WIDTH / rect.width;
  const scaleY = GAME_CONFIG.CANVAS_HEIGHT / rect.height;
  
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  
  // クリックされた顔を探す
  for (let i = gameState.faces.length - 1; i >= 0; i--) {
    const face = gameState.faces[i];
    if (face.contains(x, y) && !face.isClicked) {
      const points = face.onClick();
      updateScore(points);
      
      // 視覚的フィードバック
      showClickEffect(x, y, points);
      
      // 顔を削除
      gameState.faces.splice(i, 1);
      
      // 新しい顔を追加（最大数まで）
      addSingleNewFace();
      
      break;
    }
  }
}

function showClickEffect(x, y, points) {
  const effect = document.createElement('div');
  effect.style.position = 'absolute';
  effect.style.left = `${x}px`;
  effect.style.top = `${y}px`;
  effect.style.color = points > 0 ? '#00ff00' : '#ff0000';
  effect.style.fontSize = '24px';
  effect.style.fontWeight = 'bold';
  effect.style.pointerEvents = 'none';
  effect.style.zIndex = '1000';
  effect.textContent = points > 0 ? `+${points}` : `${points}`;
  effect.classList.add('bounce');
  
  gameState.canvas.parentElement.appendChild(effect);
  
  setTimeout(() => {
    effect.remove();
  }, 1000);
}

function updateScore(points) {
  if (typeof points === 'number') {
    gameState.score += points;
  } else if (points === 'half') {
    gameState.score = Math.floor(gameState.score / 2);
  } else if (points === 'double') {
    gameState.score *= 2;
  }
  
  gameState.score = Math.max(0, gameState.score); // 負の値を防ぐ
  document.getElementById('score').textContent = gameState.score;
}

function startGame() {
  console.log('startGame開始');
  resetGame();
  console.log('resetGame完了');
  
  gameState.isPlaying = true;
  gameState.timeLeft = GAME_CONFIG.DURATION;
  
  // UI更新
  document.getElementById('start-btn').style.display = 'none';
  document.getElementById('end-btn').style.display = 'inline-block';
  hideResultScreen();
  
  // 初期の顔を生成（resetGameの後に実行）
  generateInitialFaces();
  console.log('generateInitialFaces完了、現在の顔数:', gameState.faces.length);
  
  // ゲームタイマー開始
  startGameTimer();
  console.log('ゲームタイマー開始');
  
  // 通常モードでの顔追加タイマー開始
  startNormalFaceTimer();
  console.log('通常顔追加タイマー開始');
  
  // ゲームループ開始
  gameState.lastTime = performance.now();
  console.log('ゲームループ開始、最初の描画実行');
  
  // 最初の描画を即座に実行
  render();
  
  gameLoop();
  
  console.log('ゲーム開始完了');
}

function generateInitialFaces() {
  console.log('初期の顔を生成中...', GAME_CONFIG.INITIAL_FACES, '個');
  for (let i = 0; i < GAME_CONFIG.INITIAL_FACES; i++) {
    const types = ['HAPPY', 'NORMAL', 'SAD', 'ANGRY'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    gameState.faces.push(new Face(randomType));
  }
  console.log('生成完了。現在の顔数:', gameState.faces.length);
}

function startGameTimer() {
  gameState.gameTimer = setInterval(() => {
    gameState.timeLeft--;
    document.getElementById('timer').textContent = gameState.timeLeft;
    
    // 特殊な顔の出現チェック
    checkSpecialFaces();
    
    // ラッシュモード開始チェック
    if (gameState.timeLeft <= GAME_CONFIG.RUSH_MODE_THRESHOLD && !gameState.rushMode) {
      startRushMode();
      // 通常タイマーを停止
      if (gameState.normalTimer) {
        clearInterval(gameState.normalTimer);
        gameState.normalTimer = null;
      }
    }
    
    if (gameState.timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function checkSpecialFaces() {
  const elapsed = GAME_CONFIG.DURATION - gameState.timeLeft;
  
  // 悪魔の顔
  if (GAME_CONFIG.SPECIAL_TIMING.DEVIL.includes(elapsed) && 
      gameState.specialFacesShown.devil < GAME_CONFIG.SPECIAL_TIMING.DEVIL.length) {
    gameState.faces.push(new Face('DEVIL'));
    gameState.specialFacesShown.devil++;
  }
  
  // 天使の顔
  if (GAME_CONFIG.SPECIAL_TIMING.ANGEL.includes(elapsed) && 
      gameState.specialFacesShown.angel < GAME_CONFIG.SPECIAL_TIMING.ANGEL.length) {
    gameState.faces.push(new Face('ANGEL'));
    gameState.specialFacesShown.angel++;
  }
}

function addNewFaces() {
  // 最大数に達していなければ新しい顔を追加
  if (gameState.faces.length < GAME_CONFIG.MAX_FACES && Math.random() < 0.3) {
    const types = ['HAPPY', 'NORMAL', 'SAD', 'ANGRY'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    gameState.faces.push(new Face(randomType));
  }
}

function addSingleNewFace() {
  // 最大数に達していなければ新しい顔を1つ追加
  if (gameState.faces.length < GAME_CONFIG.MAX_FACES) {
    const types = ['HAPPY', 'NORMAL', 'SAD', 'ANGRY'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    gameState.faces.push(new Face(randomType));
  }
}

function addNewFacesNormal() {
  // 通常モードでの旧関数（削除予定）
  if (gameState.faces.length < GAME_CONFIG.MAX_FACES && Math.random() < 0.3) {
    const types = ['HAPPY', 'NORMAL', 'SAD', 'ANGRY'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    gameState.faces.push(new Face(randomType));
  }
}

function startNormalFaceTimer() {
  // 通常モードでの0.3秒ごとの顔追加
  gameState.normalTimer = setInterval(() => {
    if (!gameState.rushMode && gameState.isPlaying && gameState.faces.length < GAME_CONFIG.MAX_FACES) {
      if (Math.random() < 0.3) { // 30%の確率で追加
        const types = ['HAPPY', 'NORMAL', 'SAD', 'ANGRY'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        gameState.faces.push(new Face(randomType));
      }
    }
  }, GAME_CONFIG.NORMAL_SPAWN_INTERVAL);
}

function startRushMode() {
  gameState.rushMode = true;
  console.log('ラッシュモード開始！');
  
  // 0.1秒ごとに顔を追加
  gameState.rushTimer = setInterval(() => {
    if (gameState.faces.length < GAME_CONFIG.MAX_FACES && gameState.isPlaying) {
      const types = ['HAPPY', 'NORMAL', 'SAD', 'ANGRY'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      gameState.faces.push(new Face(randomType));
    }
  }, GAME_CONFIG.RUSH_SPAWN_INTERVAL);
  
  // ラッシュモード中の特殊顔（天使・悪魔）を2秒毎に追加
  gameState.rushSpecialTimer = setInterval(() => {
    if (gameState.isPlaying && gameState.faces.length < GAME_CONFIG.MAX_FACES) {
      // 50%の確率で天使か悪魔を選択
      const specialType = Math.random() < 0.5 ? 'ANGEL' : 'DEVIL';
      gameState.faces.push(new Face(specialType));
      console.log(`ラッシュモード特殊顔追加: ${specialType}`);
    }
  }, 2000); // 2秒毎
}

function gameLoop(currentTime) {
  if (!gameState.isPlaying) {
    console.log('ゲームが停止中のためループ終了');
    return;
  }
  
  const deltaTime = currentTime - gameState.lastTime;
  gameState.lastTime = currentTime;
  
  // 顔の更新
  gameState.faces.forEach(face => face.update(deltaTime));
  
  // 期限切れの顔を削除
  const beforeCount = gameState.faces.length;
  gameState.faces = gameState.faces.filter(face => !face.isExpired());
  const afterCount = gameState.faces.length;
  
  if (beforeCount !== afterCount) {
    console.log(`期限切れで削除: ${beforeCount} → ${afterCount}`);
  }
  
  // 描画
  render();
  
  gameState.animationFrame = requestAnimationFrame(gameLoop);
}

function render() {
  // キャンバスクリア
  gameState.ctx.clearRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
  
  // デバッグ: 描画対象の顔数を表示
  console.log('描画中の顔数:', gameState.faces.length);
  
  // 顔の描画
  gameState.faces.forEach((face, index) => {
    console.log(`顔${index}: タイプ=${face.type}, 位置=(${face.x}, ${face.y}), クリック済み=${face.isClicked}`);
    face.draw(gameState.ctx);
  });
}

function endGame() {
  gameState.isPlaying = false;
  
  // タイマーとアニメーション停止
  if (gameState.gameTimer) {
    clearInterval(gameState.gameTimer);
    gameState.gameTimer = null;
  }
  if (gameState.rushTimer) {
    clearInterval(gameState.rushTimer);
    gameState.rushTimer = null;
  }
  if (gameState.normalTimer) {
    clearInterval(gameState.normalTimer);
    gameState.normalTimer = null;
  }
  if (gameState.rushSpecialTimer) {
    clearInterval(gameState.rushSpecialTimer);
    gameState.rushSpecialTimer = null;
  }
  if (gameState.animationFrame) {
    cancelAnimationFrame(gameState.animationFrame);
    gameState.animationFrame = null;
  }
  
  // UI更新
  document.getElementById('start-btn').style.display = 'inline-block';
  document.getElementById('end-btn').style.display = 'none';
  
  // 結果表示
  showResultScreen();
  
  console.log('ゲーム終了 - 最終スコア:', gameState.score);
}

function showResultScreen() {
  document.getElementById('final-score').textContent = gameState.score;
  document.getElementById('result-screen').style.display = 'block';
  document.getElementById('result-screen').classList.add('fade-in-up');
}

function hideResultScreen() {
  document.getElementById('result-screen').style.display = 'none';
  document.getElementById('result-screen').classList.remove('fade-in-up');
}

function resetGame() {
  gameState.score = 0;
  gameState.timeLeft = GAME_CONFIG.DURATION;
  gameState.faces = [];
  gameState.specialFacesShown = { devil: 0, angel: 0 };
  gameState.rushMode = false;
  
  // タイマーもクリア
  if (gameState.rushTimer) {
    clearInterval(gameState.rushTimer);
    gameState.rushTimer = null;
  }
  if (gameState.normalTimer) {
    clearInterval(gameState.normalTimer);
    gameState.normalTimer = null;
  }
  if (gameState.rushSpecialTimer) {
    clearInterval(gameState.rushSpecialTimer);
    gameState.rushSpecialTimer = null;
  }
  
  document.getElementById('score').textContent = '0';
  document.getElementById('timer').textContent = GAME_CONFIG.DURATION;
  
  if (gameState.ctx) {
    gameState.ctx.clearRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
  }
}

async function shareResult() {
  const message = `🎮 おかおぺちぺち 🎮\n\n📊 最終スコア: ${gameState.score}点\n\n一緒にプレイしませんか？\n\n#おかおぺちぺち #１分ゲーム #Stableソフト`;
  
  try {
    // LIFF環境での共有
    if (isLIFFContext() && typeof liff !== 'undefined' && liff.isLoggedIn()) {
      await liff.shareTargetPicker([{
        type: 'text',
        text: message
      }]);
      console.log('LIFF経由でシェアしました');
      return;
    }
    
    // Web Share API (PWA/モバイルブラウザ)
    if (navigator.share) {
      await navigator.share({
        title: 'おかおぺちぺち - ゲーム結果',
        text: message,
        url: window.location.href
      });
      console.log('Web Share APIでシェアしました');
      return;
    }
    
    // クリップボード API フォールバック
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(message);
      alert('結果をクリップボードにコピーしました！\nSNSに貼り付けてシェアしてください。');
      return;
    }
    
    // 最終フォールバック
    const textArea = document.createElement('textarea');
    textArea.value = message;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('結果をコピーしました！\nSNSに貼り付けてシェアしてください。');
    
  } catch (error) {
    console.error('シェアエラー:', error);
    // 最終フォールバック: アラートで表示
    alert(`🎮 ゲーム結果 🎮\n\nスコア: ${gameState.score}点\n\nスクリーンショットを撮ってシェアしてください！\n\n#おかおぺちぺち #１分ゲーム #Stableソフト`);
  }
}

// PWAインストール処理
function setupPWAInstall() {
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWAインストールプロンプト準備完了');
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });
  
  function showInstallButton() {
    // インストールボタンを動的に作成
    if (document.getElementById('install-btn')) return; // 既に存在する場合はスキップ
    
    const installBtn = document.createElement('button');
    installBtn.id = 'install-btn';
    installBtn.textContent = '📱 アプリとしてインストール';
    installBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 25px;
      font-size: 14px;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    `;
    
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('PWAインストール結果:', outcome);
        deferredPrompt = null;
        installBtn.remove();
      }
    });
    
    document.body.appendChild(installBtn);
    
    // 5秒後に自動で非表示
    setTimeout(() => {
      if (installBtn.parentNode) {
        installBtn.style.opacity = '0.7';
      }
    }, 5000);
  }
  
  window.addEventListener('appinstalled', () => {
    console.log('PWA インストール完了');
    const installBtn = document.getElementById('install-btn');
    if (installBtn) installBtn.remove();
  });
}
