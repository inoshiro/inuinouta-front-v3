# 旧プロジェクト設計思想の継承実装計画

## 概要

このドキュメントは、旧プロジェクト（inuinouta-front / Nuxt2 版）の優れた設計思想を新プロジェクト（inuinouta-front-v3）に取り込むための具体的な実装計画を定義します。分析済みの設計思想を実際のコードレベルで実装し、現代的な技術スタック（TypeScript、Composition API、Pinia）との融合を図ります。

## 実装目標

### 主要目標

1. 旧システムの優秀な機能（シャッフル、リピート、プレイリスト同期）の完全実装
2. TypeScript による型安全性の確保
3. モバイル・デスクトップ両対応のレスポンシブ UI
4. パフォーマンス最適化の継承と向上
5. 保守性・テスタビリティの向上

### 品質目標

- **機能完全性**: 旧システム機能の 100%再現
- **パフォーマンス**: 同一動画シーク時間 < 50ms
- **TypeScript カバレッジ**: 100%
- **レスポンシブ対応**: モバイル・デスクトップ完全対応

## フェーズ別実装計画

### Phase 1: コア状態管理の実装 (優先度: 🚨 最高)

#### 1.1 プレイヤーストアの拡張

**対象ファイル**: `stores/player.ts`

**実装内容**:

```typescript
// 追加する状態定義
interface PlayerState {
  // ...既存の状態
  isShuffled: boolean;
  repeatMode: "none" | "all" | "once";
  originalQueue: QueueItem[]; // シャッフル前の元キュー保存
}

// 追加するアクション
interface PlayerActions {
  setShuffled(enabled: boolean): void;
  setRepeatMode(mode: RepeatMode): void;
  toggleShuffle(): void;
  cycleRepeatMode(): void;
}
```

**設計原則**:

- 旧システムの `controller/setShuffle`, `controller/setRepeatMode` の思想を継承
- TypeScript による型安全性を確保
- Pinia の reactivity を活用したリアルタイム状態同期

#### 1.2 キューストアの高度化

**対象ファイル**: `stores/usePlayerQueue.ts`

**実装内容**:

```typescript
// Fisher-Yates シャッフルアルゴリズムの実装
shuffleQueue(): void {
  if (!this.isShuffled) {
    // 元のキューを保存（旧システムの設計思想を継承）
    this.originalQueue = [...this.queue];

    // Fisher-Yates アルゴリズム
    for (let i = this.queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
    }

    this.syncCurrentTrackIndex();
  } else {
    // 元のキューに復元
    this.queue = [...this.originalQueue];
    this.syncCurrentTrackIndex();
  }
}

// 現在再生中楽曲の位置保持（旧システムの核心機能）
syncCurrentTrackIndex(): void {
  const currentTrack = usePlayerStore().currentTrack;
  if (currentTrack) {
    const index = this.queue.findIndex(item => item.id === currentTrack.id);
    if (index !== -1) {
      this.nowPlayingIndex = index;
    }
  }
}
```

**設計原則**:

- 旧システムの `setShuffled` メソッドの思想を完全継承
- 現在再生中楽曲の位置保持を確実に実行
- シャッフル前後での状態一貫性を保証

#### 作業見積もり

- **所要時間**: 3-4 時間
- **担当者**: フロントエンド開発者
- **テスト項目**: 状態変更の正確性、リアクティビティの確認

### Phase 2: UI コンポーネントの機能実装 (優先度: 🔥 高)

#### 2.1 PlayerControlButtons の機能追加

**対象ファイル**: `components/PlayerControlButtons.vue`

**実装内容**:

```vue
<script setup lang="ts">
  // シャッフル・リピート制御ロジック
  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  const toggleShuffle = () => {
    playerStore.setUserInteracted(true);
    playerStore.toggleShuffle();
    queueStore.shuffleQueue();
  };

  const cycleRepeat = () => {
    playerStore.setUserInteracted(true);
    playerStore.cycleRepeatMode();
  };

  // 視覚的フィードバック（旧システムの UX を継承）
  const shuffleClass = computed(() => ({
    "text-green-400 scale-105": playerStore.isShuffled,
    "text-gray-400 hover:text-white": !playerStore.isShuffled,
  }));

  const repeatClass = computed(() => ({
    "text-green-400 scale-105": playerStore.repeatMode !== "none",
    "text-gray-400 hover:text-white": playerStore.repeatMode === "none",
  }));
</script>

<template>
  <!-- シャッフルボタン (デスクトップ) -->
  <button
    v-if="!isMobile"
    @click="toggleShuffle"
    :class="['control-button', shuffleClass]"
    :title="playerStore.isShuffled ? 'シャッフルをオフ' : 'シャッフルをオン'"
  >
    <ShuffleIcon :class="{ 'animate-pulse': playerStore.isShuffled }" />
  </button>

  <!-- リピートボタン (デスクトップ) -->
  <button
    v-if="!isMobile"
    @click="cycleRepeat"
    :class="['control-button', repeatClass]"
    :title="repeatModeLabel"
  >
    <RepeatIcon v-if="playerStore.repeatMode !== 'once'" />
    <RepeatOneIcon v-else />
  </button>
</template>
```

**設計原則**:

- 旧システムの `SubControl.vue` の UX パターンを継承
- モバイル・デスクトップでの適切な表示制御
- 視覚的フィードバックによる状態の明確化

#### 2.2 モバイル対応の特別実装

**実装内容**:

```vue
<!-- モバイル専用コントロールパネル -->
<div v-if="isMobile" class="mobile-extra-controls">
  <PlayerMobileExtraPanel 
    :shuffle="playerStore.isShuffled"
    :repeat="playerStore.repeatMode"
    @toggle-shuffle="toggleShuffle"
    @cycle-repeat="cycleRepeat"
  />
</div>
```

**設計原則**:

- モバイル UI の制約を考慮した設計
- アクセシビリティの確保
- タッチインターフェースに最適化

#### 作業見積もり

- **所要時間**: 2-3 時間
- **担当者**: フロントエンド開発者 + UI/UX デザイナー
- **テスト項目**: クリック動作、視覚的フィードバック、レスポンシブ対応

### Phase 3: 楽曲遷移ロジックの高度化 (優先度: 🔧 中高)

#### 3.1 楽曲終了時の処理改善

**対象ファイル**: `components/GlobalYouTubePlayer.vue`

**実装内容**:

```typescript
const onPlayerStateChange = (event: any) => {
  // 楽曲終了時の高度な制御（旧システムの autoJump 思想を継承）
  if (event.data === YT.PlayerState.ENDED) {
    playerStore.setTransitionReason("auto-end");

    const repeatMode = playerStore.repeatMode;

    switch (repeatMode) {
      case "once":
        // 同一曲リピート（旧システムと同様）
        playerStore.seek(0);
        setTimeout(() => {
          playerStore.play();
        }, 100);
        break;

      case "all":
        // プレイリスト全体のリピート
        if (queueStore.hasNext) {
          queueStore.next();
        } else {
          queueStore.play(0); // 最初に戻る
        }
        break;

      case "none":
      default:
        // 通常の次曲移動（最後なら停止）
        if (queueStore.hasNext) {
          queueStore.next();
        } else {
          playerStore.pause();
          playerStore.setCurrentTime(0);
        }
        break;
    }
  }
};
```

**設計原則**:

- 旧システムの `autoJump` 機能の完全再現
- リピートモードごとの適切な動作分岐
- エラーハンドリングの組み込み

#### 3.2 時間ベース自動ジャンプの実装

**実装内容**:

```typescript
// 楽曲の開始・終了時刻による自動ジャンプ
const autoJump = () => {
  const currentTrack = queueStore.nowPlaying;
  if (!currentTrack || !playerStore.ytPlayer) return;

  const currentTime = Math.ceil(playerStore.currentTime);

  // 楽曲終了時刻に達した場合の自動ジャンプ
  if (currentTrack.end_at && currentTime >= currentTrack.end_at) {
    const repeatMode = playerStore.repeatMode;

    if (repeatMode === "once") {
      // 同一曲の開始位置に戻る
      playerStore.seek(currentTrack.start_at || 0);
      return;
    }

    // 次の曲に移動
    onPlayerStateChange({ data: YT.PlayerState.ENDED });
  }
};

// 1秒間隔での監視（旧システムと同じ設計）
setInterval(autoJump, 1000);
```

**設計原則**:

- 旧システムの `Math.ceil()` による時刻判定を継承
- 1 秒間隔の確実な監視
- リピートモードとの統合制御

#### 作業見積もり

- **所要時間**: 2-3 時間
- **担当者**: フロントエンド開発者
- **テスト項目**: 楽曲遷移の正確性、リピート動作、時間ベース制御

### Phase 4: パフォーマンス最適化の実装 (優先度: 📈 中)

#### 4.1 同一動画内シーク最適化

**対象ファイル**: `components/GlobalYouTubePlayer.vue`

**実装内容**:

```typescript
const playCurrentTrack = async () => {
  const currentTrack = queueStore.nowPlaying;
  if (!currentTrack || !playerStore.ytPlayer) return;

  const newVideoId = extractYouTubeId(currentTrack.video?.url || "");
  const currentVideoId = playerStore.currentVideoId;

  // 同一動画内シーク最適化（旧システムの核心機能）
  if (newVideoId === currentVideoId && currentVideoId) {
    console.log("🚀 同一動画内シーク実行");

    // 高速シーク（数十ミリ秒で完了）
    playerStore.ytPlayer.seekTo(currentTrack.start_at || 0, true);

    if (playerStore.shouldAutoPlay) {
      playerStore.ytPlayer.playVideo();
    }
  } else {
    console.log("🔄 新しい動画を読み込み");

    // 新動画の読み込み（通常速度）
    playerStore.ytPlayer.loadVideoById(newVideoId, currentTrack.start_at || 0);
  }

  // 状態の同期
  playerStore.setTrack(currentTrack);
};
```

**設計原則**:

- 旧システムの動画切り替え最適化ロジックを完全継承
- 同一動画内シークによる高速切り替え（<50ms）
- ログ出力による動作確認

#### 4.2 楽曲検索の高速化

**対象ファイル**: `stores/usePlayerQueue.ts`

**実装内容**:

```typescript
interface QueueState {
  queue: QueueItem[];
  nowPlayingIndex: number;
  songIndex: Map<number, number>; // ID→インデックスの高速マップ
}

// インデックスマップの構築（旧システムの setPlaylist 思想）
const buildIndex = () => {
  state.songIndex.clear();
  state.queue.forEach((song, index) => {
    state.songIndex.set(song.id, index);
  });
};

// 高速楽曲検索
const findSongIndex = (songId: number): number => {
  return state.songIndex.get(songId) ?? -1;
};
```

**設計原則**:

- 旧システムの `sceneIndex` による高速検索を継承
- Map による O(1) 検索パフォーマンス
- メモリ効率の最適化

#### 作業見積もり

- **所要時間**: 2 時間
- **担当者**: フロントエンド開発者
- **テスト項目**: シーク速度測定、検索パフォーマンステスト

### Phase 5: UX 向上機能の実装 (優先度: 🎨 中低)

#### 5.1 自動スクロール機能

**対象ファイル**: `composables/useAutoScroll.ts`

**実装内容**:

```typescript
export const useAutoScroll = () => {
  const scrollToPlayingSong = (songId: number) => {
    const target = document.getElementById(`song-row-${songId}`);
    if (!target) return;

    const targetRect = target.getBoundingClientRect();

    // プレイヤーコントロールの高さを考慮（旧システムの設計思想）
    const playerControl = document.querySelector(".player-controls");
    const controlHeight = playerControl?.getBoundingClientRect().height || 0;

    const scrollTo = window.pageYOffset + targetRect.top - controlHeight - 20;

    window.scrollTo({
      top: scrollTo,
      left: 0,
      behavior: "smooth",
    });
  };

  return { scrollToPlayingSong };
};
```

**設計原則**:

- 旧システムの `scrollToPlayingSong` 機能を継承
- レスポンシブ対応の高さ計算
- スムーズアニメーション

#### 5.2 リアルタイム楽曲情報更新

**対象ファイル**: `components/PlayerTrackInfo.vue`

**実装内容**:

```vue
<script setup lang="ts">
  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  // リアルタイム情報の監視
  const currentTrack = computed(() => queueStore.nowPlaying);
  const currentVideo = computed(() => currentTrack.value?.video);

  // サムネイルURL の自動生成
  const thumbnailUrl = computed(() => {
    if (!currentVideo.value?.url) return "/images/default-thumbnail.jpg";

    const videoId = extractYouTubeId(currentVideo.value.url);
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  });

  // 楽曲情報の自動更新（旧システムの updateSongInfo 思想）
  watch(
    [currentTrack, currentVideo],
    ([newTrack, newVideo]) => {
      if (newTrack && newVideo) {
        // メタデータの更新
        if ("mediaSession" in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: newTrack.title,
            artist: newTrack.artist,
            album: newVideo.title,
            artwork: [
              { src: thumbnailUrl.value, sizes: "320x320", type: "image/jpeg" },
            ],
          });
        }
      }
    },
    { immediate: true }
  );
</script>
```

**設計原則**:

- 旧システムの楽曲情報更新ロジックを継承
- Media Session API による OS レベル統合
- リアクティブな情報同期

#### 作業見積もり

- **所要時間**: 2-3 時間
- **担当者**: フロントエンド開発者
- **テスト項目**: スクロール動作、情報更新の確認

## 品質保証計画

### テスト戦略

#### 単体テスト

```typescript
// stores/player.test.ts
describe("PlayerStore", () => {
  test("シャッフル状態の切り替え", () => {
    const store = usePlayerStore();
    expect(store.isShuffled).toBe(false);

    store.toggleShuffle();
    expect(store.isShuffled).toBe(true);
  });

  test("リピートモードの循環", () => {
    const store = usePlayerStore();
    expect(store.repeatMode).toBe("none");

    store.cycleRepeatMode();
    expect(store.repeatMode).toBe("all");

    store.cycleRepeatMode();
    expect(store.repeatMode).toBe("once");

    store.cycleRepeatMode();
    expect(store.repeatMode).toBe("none");
  });
});
```

#### 統合テスト

```typescript
// integration/player-queue.test.ts
describe("Player & Queue Integration", () => {
  test("シャッフル時の楽曲位置同期", async () => {
    const playerStore = usePlayerStore();
    const queueStore = usePlayerQueue();

    // テストキューの設定
    queueStore.setQueue(mockSongs);
    queueStore.play(2); // 3番目の曲を再生

    // シャッフル実行
    playerStore.setShuffled(true);
    queueStore.shuffleQueue();

    // 現在再生中の曲が正しく保持されているか
    expect(queueStore.nowPlaying.id).toBe(mockSongs[2].id);
  });
});
```

#### E2E テスト

```typescript
// e2e/player-controls.spec.ts
test("シャッフル・リピート機能の動作確認", async ({ page }) => {
  await page.goto("/songs");

  // シャッフルボタンのクリック
  await page.click('[data-testid="shuffle-button"]');
  await expect(page.locator('[data-testid="shuffle-button"]')).toHaveClass(
    /text-green-400/
  );

  // リピートボタンの循環確認
  await page.click('[data-testid="repeat-button"]');
  await expect(page.locator('[data-testid="repeat-button"]')).toHaveAttribute(
    "title",
    /すべて/
  );
});
```

### パフォーマンステスト

#### 測定項目

1. **同一動画シーク時間**: < 50ms
2. **楽曲検索時間**: < 1ms (1000 曲のキューで)
3. **UI 反応時間**: < 100ms
4. **メモリ使用量**: キュー 1000 曲で < 50MB

#### 測定方法

```typescript
// performance/seek-time.test.ts
test("同一動画シーク時間の測定", async () => {
  const startTime = performance.now();

  // 同一動画内の楽曲に切り替え
  await playerStore.ytPlayer.seekTo(120, true);

  const endTime = performance.now();
  const seekTime = endTime - startTime;

  expect(seekTime).toBeLessThan(50);
});
```

## リリース計画

### Phase 別リリース

#### v1.1.0: コア機能リリース (Phase 1-2)

- **リリース日**: 実装開始から 2 週間後
- **含まれる機能**:
  - シャッフル・リピート基本機能
  - UI コントロールの実装
  - 基本的な楽曲遷移

#### v1.2.0: 高度機能リリース (Phase 3-4)

- **リリース日**: v1.1.0 から 1 週間後
- **含まれる機能**:
  - 時間ベース自動ジャンプ
  - パフォーマンス最適化
  - 楽曲終了時の高度制御

#### v1.3.0: UX 向上リリース (Phase 5)

- **リリース日**: v1.2.0 から 1 週間後
- **含まれる機能**:
  - 自動スクロール
  - リアルタイム情報更新
  - Media Session 統合

### ロールバック計画

各 Phase で問題が発生した場合の迅速なロールバック手順を準備:

```bash
# Phase 1 でのロールバック
git revert <phase1-commit>
npm run build
npm run deploy

# 設定ファイルの復元
cp stores/player.ts.backup stores/player.ts
```

## 成功指標

### 機能指標

- ✅ シャッフル機能: 完全動作
- ✅ リピート機能: 3 モード完全動作
- ✅ 楽曲遷移: エラー率 < 1%
- ✅ UI 反応性: 100ms 以内

### ユーザビリティ指標

- 🎯 ユーザー満足度: > 90%
- 🎯 機能発見率: > 80%
- 🎯 エラー報告数: < 5 件/月

### 技術指標

- 🔧 TypeScript カバレッジ: 100%
- 🔧 テストカバレッジ: > 90%
- 🔧 パフォーマンス目標: 100% 達成

## まとめ

この実装計画により、旧プロジェクトの優れた設計思想を現代的な技術スタックに完全に移植し、さらなる向上を図ることができます。段階的な実装とテストにより、リスクを最小化しながら確実に機能を追加していきます。

**総開発期間**: 約 4 週間
**総工数**: 約 60-80 時間
**期待効果**: 機能完全性 100% + パフォーマンス向上 + 保守性向上
