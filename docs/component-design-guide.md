# コンポーネント設計ガイド

## 概要

このドキュメントは、Nuxt 4 + Vue 3 + TypeScript 環境でのコンポーネント設計原則とベストプラクティスを定義します。

---

## 基本原則

### 1. 単一責任の原則（SRP）

各コンポーネントは**1 つの責務**のみを持つべきです。

**良い例**:

```vue
<!-- PlayerControlButtons.vue - 再生制御ボタンのみ -->
<template>
  <div class="control-buttons">
    <button @click="prev">前へ</button>
    <button @click="togglePlay">再生/停止</button>
    <button @click="next">次へ</button>
  </div>
</template>
```

**悪い例**:

```vue
<!-- Player.vue - 責務が多すぎる -->
<template>
  <div>
    <!-- プログレスバー -->
    <!-- 楽曲情報 -->
    <!-- 制御ボタン -->
    <!-- 音量調整 -->
    <!-- キュー管理 -->
  </div>
</template>
```

### 2. コンポーネントの分類

#### プレゼンテーショナルコンポーネント

**特徴**:

- 見た目の表示に専念
- Props で データを受け取る
- Emit でイベントを通知
- 状態管理（Pinia）に依存しない
- 再利用性が高い

**例**: `SongRow.vue`, `BasePagination.vue`, `SearchableSelect.vue`

```vue
<script setup lang="ts">
  interface Props {
    song: Song;
    isPlaying?: boolean;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    "play-now": [song: Song];
    "add-to-queue": [song: Song];
  }>();
</script>

<template>
  <div class="song-row">
    <img :src="song.thumbnail" />
    <span>{{ song.title }}</span>
    <button @click="emit('play-now', song)">再生</button>
  </div>
</template>
```

#### コンテナコンポーネント

**特徴**:

- ビジネスロジックを持つ
- Pinia Store や Composables を使用
- API 通信を行う
- 子コンポーネントにデータを渡す
- ページコンポーネントが該当することが多い

**例**: `pages/songs/index.vue`, `PlayerQueuePanel.vue`

```vue
<script setup lang="ts">
  const { songs, loading, error, searchSongs } = useSongs();
  const playerQueue = usePlayerQueue();

  const handlePlayNow = (song: Song) => {
    playerQueue.setQueue([song]);
    playerQueue.play(0);
  };
</script>

<template>
  <div>
    <SongList :songs="songs" :loading="loading" @play-now="handlePlayNow" />
  </div>
</template>
```

---

## 命名規則

### コンポーネント名

- **PascalCase** を使用
- **複数単語** で構成（Vue の推奨）
- **接頭辞** で種類を明示

```
✅ Good:
- PlayerControlButtons.vue
- SongList.vue
- BasePagination.vue
- TheHeader.vue (単一インスタンス)

❌ Bad:
- Player.vue (単語が1つ)
- songList.vue (camelCase)
- song-list.vue (kebab-case)
```

### Props 名

- **camelCase** を使用（テンプレートでは kebab-case）
- **型を明示**
- **boolean は `is`, `has`, `should` で始める**

```typescript
interface Props {
  songTitle: string; // ✅
  isPlaying: boolean; // ✅
  hasNextTrack: boolean; // ✅
  shouldAutoPlay: boolean; // ✅
  maxItems?: number; // ✅ Optional

  // ❌ Bad
  playing: boolean; // 真偽値だが is/has がない
  song_title: string; // snake_case
  SongTitle: string; // PascalCase
}
```

### イベント名

- **kebab-case** を使用
- **動詞-名詞** の形式
- **過去形を避ける**（`clicked` ではなく `click`）

```typescript
const emit = defineEmits<{
  "play-now": [song: Song]; // ✅
  "add-to-queue": [song: Song]; // ✅
  "update-volume": [volume: number]; // ✅
  "toggle-shuffle": []; // ✅

  // ❌ Bad
  playNow: [song: Song]; // camelCase
  played: [song: Song]; // 過去形
  click: []; // 曖昧
}>();
```

---

## Props と Emits の設計

### Props のベストプラクティス

#### 1. 型定義を明示する

```typescript
// ✅ Good: interface で明示
interface Props {
  song: Song;
  isPlaying?: boolean;
  maxWidth?: string;
}

const props = defineProps<Props>();

// ❌ Bad: 型がない
const props = defineProps({
  song: Object,
  isPlaying: Boolean,
});
```

#### 2. デフォルト値の設定

```typescript
interface Props {
  isPlaying?: boolean;
  maxItems?: number;
}

const props = withDefaults(defineProps<Props>(), {
  isPlaying: false,
  maxItems: 50,
});
```

#### 3. 複雑なオブジェクトは型定義を参照

```typescript
import type { Song } from "@/types/song";

interface Props {
  songs: Song[]; // ✅ 型定義ファイルから参照
}
```

### Emits のベストプラクティス

#### 1. イベントの型を明示

```typescript
const emit = defineEmits<{
  "play-now": [song: Song];
  "add-to-queue": [song: Song, addedFrom: "search" | "playlist"];
  "update:modelValue": [value: string];
}>();

// 使用例
emit("play-now", song);
emit("add-to-queue", song, "search");
```

#### 2. v-model のカスタマイズ

```vue
<script setup lang="ts">
  interface Props {
    modelValue: string;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    "update:modelValue": [value: string];
  }>();
</script>

<template>
  <input
    :value="modelValue"
    @input="
      emit('update:modelValue', ($event.target as HTMLInputElement).value)
    "
  />
</template>
```

---

## コンポーネントの粒度

### マイクロコンポーネント vs モノリシックコンポーネント

#### マイクロコンポーネント（推奨）

**特徴**:

- 1 つの機能に特化
- 再利用性が高い
- テストしやすい
- 保守しやすい

**例**: プレイヤーコントロールの分割

```
PlayerControls.vue
├── PlayerProgressBar.vue      (プログレスバー)
├── PlayerTrackInfo.vue        (楽曲情報)
├── PlayerControlButtons.vue   (再生制御)
├── PlayerTimeDisplay.vue      (時間表示)
├── PlayerVolumeControl.vue    (音量制御)
└── PlayerExtraControls.vue    (追加機能)
```

#### モノリシックコンポーネント（避けるべき）

**問題点**:

- 1 つのファイルが数百行
- 複数の責務が混在
- 再利用が困難
- テストが複雑

```
❌ Player.vue (800行)
   - すべての機能が1つのファイルに
```

### 分割の判断基準

以下の場合は**分割を検討**:

1. **ファイルが 200 行を超える**
2. **複数の独立した機能がある**
3. **同じコードが他でも使える**
4. **テストが複雑になる**

---

## コンポーネント間の通信

### 1. Props/Emits（親子関係）

**使用場面**: 直接の親子関係

```vue
<!-- 親: SongList.vue -->
<SongRow
  v-for="song in songs"
  :key="song.id"
  :song="song"
  @play-now="handlePlay"
/>

<!-- 子: SongRow.vue -->
<script setup lang="ts">
  const emit = defineEmits<{
    "play-now": [song: Song];
  }>();
</script>
```

### 2. Pinia Store（グローバル状態）

**使用場面**: 複数コンポーネント間で共有する状態

```typescript
// stores/player.ts
export const usePlayerStore = defineStore("player", {
  state: () => ({
    isPlaying: false,
    currentTrack: null as Song | null,
  }),
  actions: {
    play() {
      this.isPlaying = true;
    },
    pause() {
      this.isPlaying = false;
    },
  },
});

// 任意のコンポーネントから
const player = usePlayerStore();
player.play();
```

### 3. Provide/Inject（深い階層）

**使用場面**: 祖先-子孫間でデータ共有（使用頻度は低い）

```vue
<!-- 祖先: Layout.vue -->
<script setup>
  provide("theme", "dark");
</script>

<!-- 子孫: Button.vue -->
<script setup>
  const theme = inject("theme");
</script>
```

### 4. Composables（ロジックの共有）

**使用場面**: 複数コンポーネントで再利用するロジック

```typescript
// composables/useDebounce.ts
export const useDebounce = (fn: Function, delay: number) => {
  const timeoutId = ref<NodeJS.Timeout>();

  return (...args: any[]) => {
    clearTimeout(timeoutId.value);
    timeoutId.value = setTimeout(() => fn(...args), delay);
  };
};

// コンポーネント内で使用
const debouncedSearch = useDebounce(searchSongs, 300);
```

---

## レスポンシブデザイン対応

### Tailwind CSS のブレークポイント

```vue
<template>
  <!-- モバイルファースト -->
  <div class="p-2 sm:p-4 md:p-6 lg:p-8">
    <!-- モバイル: p-2, タブレット: p-4, デスクトップ: p-6, 大画面: p-8 -->
  </div>

  <!-- 条件付き表示 -->
  <div class="block md:hidden">
    <!-- モバイルのみ表示 -->
  </div>

  <div class="hidden md:block">
    <!-- タブレット以上で表示 -->
  </div>
</template>
```

### useMediaQuery の活用

```vue
<script setup lang="ts">
  const isMobile = computed(() => {
    if (process.client) {
      return window.innerWidth < 768;
    }
    return false;
  });

  // または専用 composable を作成
  const { isMobile, isTablet, isDesktop } = useBreakpoints();
</script>

<template>
  <PlayerControlButtons :is-mobile="isMobile" />
</template>
```

---

## パフォーマンス最適化

### 1. computed の活用

```vue
<script setup lang="ts">
  // ✅ Good: computed でキャッシュ
  const filteredSongs = computed(() =>
    songs.value.filter((song) => song.is_original)
  );

  // ❌ Bad: 毎回再計算
  const filteredSongs = songs.value.filter((song) => song.is_original);
</script>
```

### 2. v-show vs v-if

```vue
<template>
  <!-- 頻繁に切り替わる場合: v-show -->
  <div v-show="isPlaying">再生中</div>

  <!-- 条件がほとんど変わらない場合: v-if -->
  <div v-if="hasPermission">管理画面</div>
</template>
```

### 3. v-for の key

```vue
<template>
  <!-- ✅ Good: 一意な key -->
  <SongRow v-for="song in songs" :key="song.id" :song="song" />

  <!-- ❌ Bad: index を key に使用 -->
  <SongRow v-for="(song, index) in songs" :key="index" :song="song" />
</template>
```

### 4. 遅延読み込み

```vue
<script setup lang="ts">
  // 重いコンポーネントを遅延読み込み
  const PlayerQueuePanel = defineAsyncComponent(
    () => import("@/components/PlayerQueuePanel.vue")
  );
</script>
```

---

## アクセシビリティ

### 1. セマンティック HTML

```vue
<template>
  <!-- ✅ Good -->
  <button @click="play">再生</button>
  <nav>...</nav>
  <main>...</main>

  <!-- ❌ Bad -->
  <div @click="play">再生</div>
  <div class="nav">...</div>
  <div class="main">...</div>
</template>
```

### 2. ARIA 属性

```vue
<template>
  <button
    @click="togglePlay"
    :aria-label="isPlaying ? '一時停止' : '再生'"
    :aria-pressed="isPlaying"
  >
    <PlayIcon v-if="!isPlaying" />
    <PauseIcon v-else />
  </button>
</template>
```

### 3. キーボード操作

```vue
<template>
  <div tabindex="0" @keydown.enter="play" @keydown.space.prevent="play">
    楽曲行
  </div>
</template>
```

---

## エラーハンドリング

### 1. Props のバリデーション

```typescript
interface Props {
  song: Song;
  volume?: number;
}

const props = defineProps<Props>();

// 追加のバリデーション
watchEffect(() => {
  if (props.volume !== undefined && (props.volume < 0 || props.volume > 100)) {
    console.warn("volume は 0-100 の範囲である必要があります");
  }
});
```

### 2. null/undefined チェック

```vue
<script setup lang="ts">
  const player = usePlayerStore();

  const currentTrack = computed(() => player.currentTrack);
</script>

<template>
  <!-- ✅ Good: null チェック -->
  <div v-if="currentTrack">
    {{ currentTrack.title }}
  </div>

  <!-- ✅ Good: オプショナルチェイニング -->
  <div>{{ currentTrack?.title ?? "未選択" }}</div>
</template>
```

---

## テスタビリティ

### 1. Pure Functions

```typescript
// ✅ テストしやすい: 純粋関数
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// テスト
expect(formatDuration(125)).toBe("2:05");
```

### 2. Props での依存注入

```vue
<script setup lang="ts">
  // ✅ テストしやすい: Store を直接使わず Props で受け取る
  interface Props {
    isPlaying: boolean;
    currentTrack: Song | null;
  }

  const props = defineProps<Props>();
</script>
```

---

## 実装例

### 完全な実装例: 楽曲行コンポーネント

```vue
<!-- components/SongRow.vue -->
<script setup lang="ts">
  import type { Song } from "@/types/song";

  /**
   * Props 定義
   */
  interface Props {
    song: Song;
    isPlaying?: boolean;
    showVideo?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    isPlaying: false,
    showVideo: true,
  });

  /**
   * Emits 定義
   */
  const emit = defineEmits<{
    "play-now": [song: Song];
    "add-to-queue": [song: Song];
    "add-to-playlist": [song: Song];
  }>();

  /**
   * Computed
   */
  const thumbnailUrl = computed(() => {
    if (!props.song.video?.url) return "/images/default-thumbnail.jpg";
    const videoId = extractYouTubeId(props.song.video.url);
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  });

  const duration = computed(() => {
    if (!props.song.start_at || !props.song.end_at) return "";
    const seconds = props.song.end_at - props.song.start_at;
    return formatDuration(seconds);
  });

  /**
   * Methods
   */
  const handlePlayNow = () => {
    emit("play-now", props.song);
  };

  const handleAddToQueue = () => {
    emit("add-to-queue", props.song);
  };

  /**
   * Utils
   */
  const extractYouTubeId = (url: string): string => {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : "";
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
</script>

<template>
  <div
    class="song-row flex items-center gap-4 p-3 hover:bg-gray-700 rounded-lg transition-colors"
    :class="{ 'bg-gray-700': isPlaying }"
  >
    <!-- サムネイル -->
    <img
      v-if="showVideo"
      :src="thumbnailUrl"
      :alt="`${song.title} サムネイル`"
      class="w-20 h-12 object-cover rounded"
    />

    <!-- 楽曲情報 -->
    <div class="flex-1 min-w-0">
      <h3 class="text-sm font-medium truncate">
        {{ song.title }}
      </h3>
      <p class="text-xs text-gray-400 truncate">
        {{ song.artist }}
      </p>
    </div>

    <!-- 再生時間 -->
    <span class="text-xs text-gray-400">
      {{ duration }}
    </span>

    <!-- アクションボタン -->
    <div class="flex gap-2">
      <button
        @click="handlePlayNow"
        :aria-label="`${song.title} を再生`"
        class="p-2 hover:bg-gray-600 rounded-full transition-colors"
      >
        <PlayIcon class="w-5 h-5" />
      </button>

      <button
        @click="handleAddToQueue"
        :aria-label="`${song.title} をキューに追加`"
        class="p-2 hover:bg-gray-600 rounded-full transition-colors"
      >
        <PlusIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
```

---

## チェックリスト

新しいコンポーネントを作成する際のチェックリスト:

- [ ] コンポーネント名は PascalCase で複数単語か？
- [ ] Props の型定義は明示されているか？
- [ ] Emits の型定義は明示されているか？
- [ ] 単一責任の原則を守っているか？
- [ ] 適切な粒度に分割されているか？
- [ ] null/undefined チェックは適切か？
- [ ] レスポンシブ対応は適切か？
- [ ] アクセシビリティは考慮されているか？
- [ ] パフォーマンス最適化は適切か？
- [ ] テストしやすい設計か？

---

## 関連ドキュメント

- [状態管理ガイド](./state-management-guide.md)
- [API 仕様書](./api-specification.md)
- [エラーハンドリングガイド](./error-handling-guide.md)
- [Vue 3 公式ドキュメント](https://ja.vuejs.org/)
- [Nuxt 4 公式ドキュメント](https://nuxt.com/)
