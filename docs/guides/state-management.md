# 状態管理ガイド

## 概要

このドキュメントは、Pinia を使用した状態管理のアーキテクチャと設計原則を定義します。

---

## アーキテクチャ概要

### 状態管理の階層構造

```
┌─────────────────────────────────────────┐
│          UI コンポーネント               │
│  (pages/, components/)                  │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│          Composables                    │
│  (API 通信、ビジネスロジック)           │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│          Pinia Stores                   │
│  (グローバル状態管理)                   │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────────────────────────┐
│     LocalStorage / SessionStorage       │
│  (永続化レイヤー)                       │
└─────────────────────────────────────────┘
```

---

## Store 構成

### 現在の Store 一覧

#### 1. `stores/player.ts` - プレイヤー状態管理

**責務**:

- YouTube プレイヤーの状態管理
- 再生/停止/シーク操作
- 音量・ミュート制御
- エラーハンドリング

**主要な状態**:

```typescript
interface PlayerState {
  // YouTube Player インスタンス
  ytPlayer: YT.Player | null;

  // 現在の楽曲
  currentTrack: Song | null;
  currentVideoId: string | null;

  // 再生状態
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;

  // 時間管理
  currentTime: number;
  duration: number;

  // 音量
  volume: number;
  isMuted: boolean;

  // エラーハンドリング
  error: string | null;
  retryCount: number;

  // 制御フラグ
  shouldAutoPlay: boolean;
  userInteracted: boolean;
  transitionReason: "manual" | "auto-jump" | "auto-end" | "error" | null;

  // 未実装（今後追加予定）
  isShuffled: boolean;
  repeatMode: "none" | "all" | "once";
}
```

**主要なアクション**:

```typescript
interface PlayerActions {
  // プレイヤー制御
  setYtPlayer(player: YT.Player): void;
  play(): void;
  pause(): void;
  seek(time: number): void;

  // 楽曲管理
  setTrack(song: Song): void;
  clearTrack(): void;

  // 音量制御
  setVolume(volume: number): void;
  toggleMute(): void;

  // 状態更新
  setCurrentTime(time: number): void;
  setDuration(duration: number): void;
  setIsPlaying(playing: boolean): void;

  // エラーハンドリング
  setError(message: string): void;
  clearError(): void;
  incrementRetry(): void;
  resetRetry(): void;

  // 制御フラグ
  setUserInteracted(interacted: boolean): void;
  setTransitionReason(reason: string): void;
  setShouldAutoPlay(should: boolean): void;
}
```

#### 2. `stores/usePlayerQueue.ts` - 再生キュー管理

**責務**:

- 再生キューの管理
- 前後の楽曲への移動
- キューの追加/削除/並び替え
- 現在再生中のインデックス管理

**主要な状態**:

```typescript
interface QueueState {
  // 再生キュー
  queue: QueueItem[];
  nowPlayingIndex: number;

  // 未実装（今後追加予定）
  originalQueue: QueueItem[]; // シャッフル前の元キュー
  history: QueueItem[]; // 再生履歴
}

interface QueueItem extends Song {
  addedFrom?: "search" | "playlist" | "history";
  playlistId?: number;
}
```

**主要なアクション**:

```typescript
interface QueueActions {
  // キュー操作
  setQueue(songs: Song[]): void;
  addToQueue(song: Song): void;
  removeFromQueue(index: number): void;
  clearQueue(): void;

  // 再生制御
  play(index: number): void;
  next(): void;
  previous(): void;

  // 未実装（今後追加予定）
  shuffleQueue(): void;
  nextWithRepeat(): void;
  syncCurrentTrackIndex(): void;
}
```

**主要な Getters**:

```typescript
interface QueueGetters {
  nowPlaying: Song | null;
  hasNext: boolean;
  hasPrevious: boolean;
  queueLength: number;
}
```

#### 3. `stores/playlist.ts` - プレイリスト管理（未実装）

**責務**:

- プレイリストの CRUD 操作
- プレイリストと再生キューの連携

**予定している状態**:

```typescript
interface PlaylistState {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  loading: boolean;
  error: string | null;
}
```

---

## データフロー

### 1. 楽曲再生のフロー

```
[UI: SongRow.vue]
  ↓ emit('play-now', song)
[Container: SongList.vue]
  ↓ handlePlayNow(song)
[Store: usePlayerQueue]
  ↓ setQueue([song])
  ↓ play(0)
[Store: player]
  ← watchEffect(nowPlaying)
  ↓ playCurrentTrack()
[YouTube Player API]
  ↓ loadVideoById()
  ↓ onStateChange()
[Store: player]
  ↓ setIsPlaying(true)
[UI: 全コンポーネント]
  ← computed(() => player.isPlaying)
```

### 2. キュー操作のフロー

```
[UI: PlayerQueuePanel]
  ↓ queueStore.next()
[Store: usePlayerQueue]
  ↓ nowPlayingIndex++
  ↓ nowPlaying が変更される
[Watcher: GlobalYouTubePlayer]
  ← watch(nowPlaying)
  ↓ playCurrentTrack()
[Store: player]
  ↓ setTrack(newTrack)
  ↓ ytPlayer.loadVideoById()
```

---

## Store の設計原則

### 1. 状態の最小化

**原則**: 計算可能な値は Getter で定義し、State には最小限のデータのみ保持する。

```typescript
// ✅ Good
const usePlayerQueue = defineStore("playerQueue", {
  state: () => ({
    queue: [] as Song[],
    nowPlayingIndex: 0,
  }),
  getters: {
    nowPlaying: (state) => state.queue[state.nowPlayingIndex] || null,
    hasNext: (state) => state.nowPlayingIndex < state.queue.length - 1,
    hasPrevious: (state) => state.nowPlayingIndex > 0,
  },
});

// ❌ Bad: 冗長な状態
const usePlayerQueue = defineStore("playerQueue", {
  state: () => ({
    queue: [] as Song[],
    nowPlayingIndex: 0,
    nowPlaying: null, // ← 計算可能なので不要
    hasNext: false, // ← 計算可能なので不要
    hasPrevious: false, // ← 計算可能なので不要
  }),
});
```

### 2. アクションの単一責任

**原則**: 各アクションは 1 つの責務のみを持つ。

```typescript
// ✅ Good: 責務が明確
const actions = {
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(100, volume));
    if (this.ytPlayer) {
      this.ytPlayer.setVolume(this.volume);
    }
  },

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.ytPlayer) {
      if (this.isMuted) {
        this.ytPlayer.mute();
      } else {
        this.ytPlayer.unMute();
      }
    }
  },
};

// ❌ Bad: 複数の責務が混在
const actions = {
  updateAudioSettings(volume?: number, muted?: boolean) {
    if (volume !== undefined) {
      this.volume = volume;
      this.ytPlayer?.setVolume(volume);
    }
    if (muted !== undefined) {
      this.isMuted = muted;
      if (muted) {
        this.ytPlayer?.mute();
      } else {
        this.ytPlayer?.unMute();
      }
    }
  },
};
```

### 3. 非同期処理の適切な配置

**原則**: API 通信は Composables で行い、Store は結果を受け取るのみ。

```typescript
// ✅ Good: Composables で API 通信
// composables/useSongs.ts
export const useSongs = () => {
  const fetchSongs = async () => {
    const { data, error } = await useFetch("/api/songs");
    return { data, error };
  };
  return { fetchSongs };
};

// Store は結果を受け取る
// stores/songList.ts
const actions = {
  async loadSongs() {
    this.loading = true;
    const { data, error } = await useSongs().fetchSongs();
    if (data) {
      this.songs = data;
    }
    this.loading = false;
  },
};

// ❌ Bad: Store 内で直接 API 通信
const actions = {
  async loadSongs() {
    this.loading = true;
    const response = await fetch("/api/songs");
    this.songs = await response.json();
    this.loading = false;
  },
};
```

---

## 永続化戦略

### LocalStorage 連携

特定の状態を LocalStorage に保存し、リロード後も復元します。

#### 実装例: 音量設定の永続化

```typescript
// stores/player.ts
export const usePlayerStore = defineStore("player", {
  state: () => ({
    volume: 80,
    isMuted: false,
  }),

  actions: {
    setVolume(volume: number) {
      this.volume = volume;
      if (process.client) {
        localStorage.setItem("player_volume", volume.toString());
      }
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (process.client) {
        localStorage.setItem("player_muted", this.isMuted.toString());
      }
    },

    loadSettings() {
      if (process.client) {
        const savedVolume = localStorage.getItem("player_volume");
        if (savedVolume) {
          this.volume = parseInt(savedVolume, 10);
        }

        const savedMuted = localStorage.getItem("player_muted");
        if (savedMuted) {
          this.isMuted = savedMuted === "true";
        }
      }
    },
  },
});
```

#### 使用例

```vue
<script setup lang="ts">
  const player = usePlayerStore();

  onMounted(() => {
    player.loadSettings();
  });
</script>
```

### 永続化する状態の選定基準

**永続化すべき状態**:

- ✅ ユーザー設定（音量、リピートモード、シャッフル状態）
- ✅ UI 表示設定（テーマ、レイアウト設定）
- ✅ 再生キュー（オプション）

**永続化すべきでない状態**:

- ❌ 一時的な UI 状態（ローディング、エラーメッセージ）
- ❌ 再生位置（セキュリティ上の理由）
- ❌ API から取得したデータ（常に最新を取得すべき）

---

## コンポーネントでの使用方法

### 基本的な使用

```vue
<script setup lang="ts">
  // Store のインポート
  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  // リアクティブな値の取得
  const isPlaying = computed(() => playerStore.isPlaying);
  const currentTrack = computed(() => queueStore.nowPlaying);

  // アクションの実行
  const togglePlay = () => {
    if (playerStore.isPlaying) {
      playerStore.pause();
    } else {
      playerStore.play();
    }
  };
</script>

<template>
  <button @click="togglePlay">
    {{ isPlaying ? "停止" : "再生" }}
  </button>

  <div v-if="currentTrack">
    {{ currentTrack.title }}
  </div>
</template>
```

### Store の値の監視

```vue
<script setup lang="ts">
  const playerStore = usePlayerStore();

  // 値の変更を監視
  watch(
    () => playerStore.currentTrack,
    (newTrack, oldTrack) => {
      if (newTrack && newTrack !== oldTrack) {
        console.log("楽曲が変更されました:", newTrack.title);
      }
    }
  );

  // 複数の値を監視
  watch(
    [() => playerStore.isPlaying, () => playerStore.currentTime],
    ([isPlaying, currentTime]) => {
      if (isPlaying && currentTime > 0) {
        // 再生中の処理
      }
    }
  );
</script>
```

---

## Store 間の連携

### 1. Store から別の Store を参照

```typescript
// stores/usePlayerQueue.ts
export const usePlayerQueue = defineStore("playerQueue", {
  actions: {
    play(index: number) {
      this.nowPlayingIndex = index;

      // 別の Store にアクセス
      const playerStore = usePlayerStore();
      playerStore.setUserInteracted(true);
      playerStore.setShouldAutoPlay(true);
    },
  },
});
```

### 2. Watcher による連携

```vue
<!-- components/GlobalYouTubePlayer.vue -->
<script setup lang="ts">
  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  // キューの変更を監視してプレイヤーを更新
  watch(
    () => queueStore.nowPlaying,
    (newTrack, oldTrack) => {
      if (newTrack && newTrack !== oldTrack) {
        playCurrentTrack();
      }
    }
  );

  const playCurrentTrack = () => {
    const track = queueStore.nowPlaying;
    if (track) {
      playerStore.setTrack(track);
      // YouTube Player の操作
    }
  };
</script>
```

---

## 未実装機能の実装計画

### 1. シャッフル機能

#### State 追加

```typescript
// stores/player.ts
state: () => ({
  isShuffled: false,
  // ...
});
```

```typescript
// stores/usePlayerQueue.ts
state: () => ({
  originalQueue: [] as QueueItem[],
  // ...
});
```

#### Actions 追加

```typescript
// stores/player.ts
actions: {
  toggleShuffle() {
    this.isShuffled = !this.isShuffled;
    const queueStore = usePlayerQueue();
    queueStore.shuffleQueue();
  }
}

// stores/usePlayerQueue.ts
actions: {
  shuffleQueue() {
    const playerStore = usePlayerStore();

    if (!playerStore.isShuffled) {
      // 元のキューを保存
      this.originalQueue = [...this.queue];

      // Fisher-Yates アルゴリズム
      for (let i = this.queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
      }

      this.syncCurrentTrackIndex();
    } else {
      // 元のキューに戻す
      this.queue = [...this.originalQueue];
      this.syncCurrentTrackIndex();
    }
  },

  syncCurrentTrackIndex() {
    const playerStore = usePlayerStore();
    if (playerStore.currentTrack) {
      const index = this.queue.findIndex(
        item => item.id === playerStore.currentTrack?.id
      );
      if (index !== -1) {
        this.nowPlayingIndex = index;
      }
    }
  }
}
```

### 2. リピート機能

#### State 追加

```typescript
// stores/player.ts
state: () => ({
  repeatMode: "none" as "none" | "all" | "once",
  // ...
});
```

#### Actions 追加

```typescript
// stores/player.ts
actions: {
  cycleRepeatMode() {
    const modes = ['none', 'all', 'once'] as const;
    const currentIndex = modes.indexOf(this.repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.repeatMode = modes[nextIndex];
  }
}

// stores/usePlayerQueue.ts
actions: {
  nextWithRepeat() {
    const playerStore = usePlayerStore();

    if (this.hasNext) {
      this.next();
    } else if (playerStore.repeatMode === 'all') {
      this.nowPlayingIndex = 0; // 最初に戻る
    } else if (playerStore.repeatMode === 'once') {
      // 現在の曲を再再生
      playerStore.seek(0);
      if (!playerStore.isPlaying) {
        playerStore.play();
      }
    }
    // repeatMode === 'none' の場合は何もしない
  }
}
```

---

## デバッグとテスト

### Pinia Devtools の活用

```vue
<script setup lang="ts">
  // 開発環境でのみ有効化
  if (process.dev) {
    const playerStore = usePlayerStore();

    // Store の状態を監視
    playerStore.$subscribe((mutation, state) => {
      console.log("Store が更新されました:", mutation.type);
      console.log("新しい状態:", state);
    });

    // アクションの実行を監視
    playerStore.$onAction(({ name, args, after, onError }) => {
      console.log(`アクション "${name}" が実行されました:`, args);

      after((result) => {
        console.log(`アクション "${name}" が完了しました:`, result);
      });

      onError((error) => {
        console.error(`アクション "${name}" でエラー:`, error);
      });
    });
  }
</script>
```

### Store のテスト

```typescript
// stores/player.test.ts
import { setActivePinia, createPinia } from "pinia";
import { describe, test, expect, beforeEach } from "vitest";
import { usePlayerStore } from "@/stores/player";

describe("PlayerStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("初期状態が正しい", () => {
    const store = usePlayerStore();
    expect(store.isPlaying).toBe(false);
    expect(store.volume).toBe(80);
    expect(store.currentTrack).toBeNull();
  });

  test("音量を設定できる", () => {
    const store = usePlayerStore();
    store.setVolume(50);
    expect(store.volume).toBe(50);
  });

  test("音量は 0-100 の範囲に制限される", () => {
    const store = usePlayerStore();
    store.setVolume(150);
    expect(store.volume).toBe(100);

    store.setVolume(-10);
    expect(store.volume).toBe(0);
  });
});
```

---

## ベストプラクティス

### ✅ Do

1. **Store はグローバル状態のみ保持**

   - ローカル状態は `ref` や `reactive` を使用

2. **アクション内で状態を直接変更**

   - Pinia では mutations は不要

3. **Getters で派生状態を定義**

   - 計算可能な値は State に含めない

4. **型定義を明示**

   - TypeScript の恩恵を最大限活用

5. **Store を小さく保つ**
   - 責務ごとに Store を分割

### ❌ Don't

1. **コンポーネント内で State を直接変更しない**

   ```typescript
   // ❌ Bad
   playerStore.volume = 50;

   // ✅ Good
   playerStore.setVolume(50);
   ```

2. **Store 内で DOM 操作を行わない**

   ```typescript
   // ❌ Bad
   actions: {
     play() {
       document.getElementById('player').play();
     }
   }

   // ✅ Good
   actions: {
     play() {
       this.isPlaying = true;
       // DOM 操作はコンポーネントで
     }
   }
   ```

3. **Store 間の循環参照を避ける**
   - 適切な設計で回避

---

## 関連ドキュメント

- [コンポーネント設計ガイド](./component-design-guide.md)
- [API 仕様書](./api-specification.md)
- [実装計画](./implementation-plan.md)
- [Pinia 公式ドキュメント](https://pinia.vuejs.org/)
