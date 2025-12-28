# 旧プロジェクト再生制御システム解析レポート

## 概要

このドキュメントは、旧プロジェクト（inuinouta-front / Nuxt2 版 および inuinouta / Django 版）の再生制御システムの理論と実装を詳細に解析し、新プロジェクト（inuinouta-front-v3）での設計改善のベースとして活用する目的で作成されています。

## システム構成

### 1. 三層アーキテクチャ

旧システムは以下の三層構造で構成されています：

```
┌─────────────────────────────────────┐
│            UI層（Vue.js）            │
│  ・Control.vue                      │
│  ・SubControl.vue                   │
│  ・Body.vue                         │
└─────────────────────────────────────┘
            ↕ イベント通信
┌─────────────────────────────────────┐
│         制御層（Nuxt Plugins）       │
│  ・controller.js                    │
│  ・playlist.js                      │
│  ・utils.js                         │
└─────────────────────────────────────┘
            ↕ 直接制御
┌─────────────────────────────────────┐
│      YouTube Player層（原生JS）      │
│  ・youtube_playlist.js              │
│  ・site_pc.js                       │
└─────────────────────────────────────┘
```

### 2. 状態管理設計

#### Vuex Store 構造

**Controller Store (`store/controller.js`)**

```javascript
state: {
  player: null,           // YouTube Player インスタンス
  pausing: null,         // 一時停止中の楽曲
  playing: null,         // 再生中の楽曲
  playlist_name: null,   // 現在のプレイリスト名
  repeat_mode: 'off',    // リピートモード
  shuffle: false,        // シャッフル状態
  state_changed: false   // 状態変更フラグ
}
```

**Playlist Store (`store/playlist.js`)**

```javascript
state: {
  playing: null,    // 現在再生中のプレイリスト
  default: null,    // デフォルト（全曲）プレイリスト
  original: null,   // オリジナル楽曲プレイリスト
  shuffled: null,   // シャッフルプレイリスト
  video: null       // 動画楽曲プレイリスト
}
```

## 核心的制御理論

### 1. 楽曲状態管理の二重分離設計

旧システムの最も特徴的な設計は、楽曲の状態を **playing** と **pausing** の二つに明確に分離していることです：

```javascript
// controller.js - play_or_pause メソッド
play_or_pause: (song, position) => {
  const playing = store.getters["controller/playing"];
  const pausing = store.getters["controller/pausing"];

  // 再生中の曲 → 一時停止
  if (song == playing) {
    getPlayer().pauseVideo();
    store.commit("controller/setPlaying", null);
    store.commit("controller/setPausing", song);
    return;
  }

  // 停止中の曲 → 再生再開
  if (song == pausing) {
    getPlayer().playVideo();
    store.commit("controller/setPlaying", song);
    store.commit("controller/setPausing", null);
    return;
  }

  // 異なる曲 → 新規再生
  store.commit("playlist/setPosition", position);
  app.$controller.play(playing, song);
};
```

**設計意図**:

- **playing**: 現在アクティブに再生されている楽曲
- **pausing**: 一時停止状態だが、次に再生される候補の楽曲
- **null**: 完全に非選択状態

この設計により、ユーザーが同じ楽曲を再度クリックした場合の動作を明確に定義できています。

### 2. プレイリスト位置同期メカニズム

#### プレイリストクラスの設計

```javascript
class Playlist {
  constructor(name) {
    this.name = name;
    this.position = 0; // 現在位置
    this.list = []; // 楽曲IDリスト
    this.max_index = 0; // 最大インデックス
  }

  // 位置移動メソッド（循環構造）
  backwardPosition() {
    if (this.position === 0) {
      this.position = this.max_index; // 最後に戻る
    } else {
      this.position -= 1;
    }
    return this.list[this.position];
  }

  forwardPosition() {
    if (this.position === this.max_index) {
      this.position = 0; // 最初に戻る
    } else {
      this.position += 1;
    }
    return this.list[this.position];
  }
}
```

**重要な特徴**:

- プレイリストは循環構造（最後 → 最初、最初 → 最後）
- 位置管理は楽曲ではなくインデックスベース
- ID ベースでの位置検索機能（`setPositionById`）

### 3. 動画切り替え最適化ロジック

旧システムの非常に洗練された部分は、YouTube 動画の切り替え最適化です：

```javascript
play: (song_playing, song_requested) => {
  const video_id = song_playing ? song_playing.video : null;

  // 同一動画内でのシーク（高速）
  if (video_id === song_requested.video) {
    getPlayer().seekTo(song_requested.start_at);
    getPlayer().playVideo();
  }
  // 異なる動画の読み込み（通常速度）
  else {
    getPlayer().loadVideoById(song_requested.video, song_requested.start_at);
  }
};
```

**最適化効果**:

- 同一動画内のシークは数十ミリ秒で完了
- 異なる動画の読み込みは数秒かかる可能性
- この判定により、UX が大幅に向上

### 4. 時間ベース自動ジャンプシステム

#### autoJump 実装（Nuxt2 版）

```javascript
autoJump: async () => {
  const song = store.getters["controller/playing"];
  if (!song) return;

  const current_time = await getPlayer().getCurrentTime();
  if (Math.ceil(current_time) == song.end_at) {
    const repeat_mode = store.getters["controller/repeat_mode"];
    if (repeat_mode == "once") {
      app.$controller.play(song, song); // 同一曲リピート
      return;
    }
    app.$controller.next(); // 次曲へ
  }
};
```

#### autoJump 実装（Django/原生 JS 版）

```javascript
// Controller クラス内
autoJump() {
  let scene = this.getPlayingScene();
  if (Math.ceil(this.player.getCurrentTime()) == scene.end_at) {
    this.next();
  }
}

// 1秒間隔での実行
setInterval(intervalProcess, 1000);
```

**設計原理**:

- `Math.ceil()` による時刻の切り上げ比較
- 1 秒間隔の監視による確実な遷移
- リピートモードとの統合制御

### 5. シャッフル機能の高度な実装

#### Fisher-Yates アルゴリズム採用

```javascript
// 完全ランダムシャッフル
function shufflePlaylist(playlist) {
  let shuffled = playlist.slice();
  for (let i = shuffled.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

#### 現在再生中楽曲の位置保持

```javascript
setShuffled: () => {
  const playing_list = store.getters["playlist/playing"];
  const shuffled = playing_list.exportShuffledList();

  // 現在再生中の曲を先頭に移動
  const playing_song = store.getters["controller/playing"];
  const pausing_song = store.getters["controller/pausing"];
  const target = playing_song || pausing_song;

  const index = shuffled.findIndex((id) => id == target.id);
  shuffled.splice(index, 1); // 元の位置から削除
  shuffled.unshift(target.id); // 先頭に挿入

  const shuffled_list = new Playlist("shuffled");
  shuffled_list.importFromList(shuffled);
  store.commit("playlist/setShuffled", shuffled_list);
};
```

**設計思想**:

- シャッフル時も現在の楽曲は継続再生
- 完全ランダム性の保証
- シャッフル専用プレイリストの独立管理

## YouTube Player 統合設計

### 1. 二重層プレイヤー制御

```javascript
// 上位層（Nuxt Plugin）
function getPlayer() {
  return store.getters["controller/player"];
}

// 下位層（原生JavaScript）
class Controller {
  setPlayer(player) {
    this.player = player;
  }

  playScene(scene_id) {
    let scene = this.getScene(scene_id);
    // 同一動画内判定
    if (scene.video_id == scene_playing.video_id) {
      this.player.seekTo(scene.start_at, true);
      this.play();
    } else {
      this.player.loadVideoById(scene.video_id, scene.start_at);
    }
  }
}
```

### 2. 状態同期メカニズム

```javascript
// YouTube Player状態変更時のコールバック
function syncPlayingState(event) {
  if (event.data == YT.PlayerState.PLAYING) {
    controller.changeState(STATE_PLAYING);
    // UI更新
    obj.innerHTML = '<i class="far fa-pause-circle"></i>';
    playingState = "play";
  }
  if (event.data == YT.PlayerState.PAUSED) {
    controller.changeState(STATE_PAUSED);
    // UI更新
    obj.innerHTML = '<i class="far fa-play-circle"></i>';
    playingState = "pause";
  }
}
```

## エラーハンドリング戦略

### 1. 無効楽曲のスキップ機能

```javascript
// 再生不可能楽曲の自動スキップ
next() {
  let skip = true;
  let next_scene = null;
  while (skip) {
    next_scene = this.getNextScene();
    skip = next_scene.unplayable;  // 無効フラグチェック
    if (skip) {
      this.scenePointer++;
    }
  }
  this.playScene(next_scene.id);
}
```

### 2. 前の曲への復帰ロジック

```javascript
prev() {
  let scene = this.getPlayingScene();
  // 5秒以上再生済みの場合は頭出し
  if (Math.ceil(this.player.getCurrentTime()) > scene.start_at + 5) {
    this.playScene(scene.id);
    return;
  }
  // 5秒未満の場合は前の曲へ
  // ... (前曲移動ロジック)
}
```

## UX 配慮事項

### 1. 自動スクロール機能

```javascript
scrollToPlayingSong: () => {
  const playing = store.getters["controller/playing"];
  const pausing = store.getters["controller/pausing"];
  const targetSong = playing || pausing;

  const target = document.getElementById("song-row-" + targetSong.id);
  const targetRect = target.getBoundingClientRect();

  // 動画エリアの高さを考慮した計算
  const showVideo = store.getters["global/showVideoArea"];
  const barId = showVideo ? "show-hide-bar-open" : "show-hide-bar-close";
  const bar = document.getElementById(barId);
  const barRect = bar.getBoundingClientRect();

  const posY = window.pageYOffset + targetRect.top;
  const scrollTo = posY - barRect.top - barRect.height;

  window.scrollTo({ top: scrollTo, left: 0, behavior: "smooth" });
};
```

### 2. リアルタイム楽曲情報更新

```javascript
function updateSongInfo(video_id, song_title, video_title) {
  let song = controller.getPlayingScene();
  let video = data_videos[song.video_id];

  let playingThumb = document.getElementById("playing-thumb");
  let playingSongTitle = document.getElementById("navigation-song-title");
  let playingVideoTitle = document.getElementById("navigation-video-title");

  playingThumb.src =
    "https://inuinouta.s3.ap-northeast-1.amazonaws.com/images/thumbs/" +
    song.video_id +
    ".jpg";
  playingSongTitle.textContent = song.title + " / " + song.artist;
  playingVideoTitle.textContent = video.title;
}
```

## パフォーマンス最適化設計

### 1. 楽曲検索の高速化

```javascript
// インデックスベースの高速検索
setPlaylist(playlist) {
  this.playlist = playlist;
  this.scenePointer = 0;
  this.sceneIndex = {};  // ID→インデックスのマップ
  for (let i = 0; i < playlist.length; i++) {
    let scene = playlist[i];
    this.sceneIndex[scene.id] = i;
  }
}

getScene(scene_id) {
  let pointer = this.sceneIndex[scene_id];
  return this.playlist[pointer];
}
```

### 2. 状態変更の最小化

```javascript
// 不要な状態更新の回避
if (song == playing) {
  // 既に再生中の場合は一時停止のみ
  getPlayer().pauseVideo();
  // 状態変更は最小限
  store.commit("controller/setPlaying", null);
  store.commit("controller/setPausing", song);
  return;
}
```

## 新プロジェクトへの影響と改善点

### 1. 継承すべき設計原理

✅ **playing/pausing の二重状態管理**

- 新プロジェクトでも `nowPlaying` と明確な状態区分を採用

✅ **同一動画内シーク最適化**

- `currentVideoId` 比較による高速切り替えを継承

✅ **時間ベース自動ジャンプ**

- `Math.ceil()` による確実な時刻判定を継承

✅ **循環プレイリスト構造**

- `hasNext/hasPrevious` による境界チェックを改善

### 2. 改善された設計

⭐ **TypeScript 化による型安全性**

```typescript
interface QueueItem extends Song {
  addedFrom?: "search" | "playlist" | "history";
  playlistId?: number;
}
```

⭐ **Pinia による状態管理の簡素化**

```typescript
export const usePlayerQueue = defineStore("playerQueue", {
  state: () => ({
    queue: [] as QueueItem[],
    nowPlayingIndex: 0,
  }),
});
```

⭐ **Composition API による再利用性向上**

```vue
<script setup lang="ts">
  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();
</script>
```

⭐ **モバイル対応の強化**

```javascript
// CUED状態からの自動再生
if (newState === "CUED" && playerStore.shouldAutoPlay) {
  setTimeout(() => {
    playerStore.ytPlayer.playVideo();
  }, 100);
}
```

### 3. 新規追加された機能

🚀 **エラーリトライシステム**

- 3 回までのリトライ機能
- 3 秒間隔でのリトライ実行

🚀 **デバウンス機能**

- 50ms のデバウンス による競合状態防止

🚀 **遷移理由の追跡**

- `manual | auto-jump | auto-end | error` による詳細な制御

🚀 **レスポンシブ対応**

- モバイル・デスクトップの最適化 UI

## コンポーネント間連携アーキテクチャ

### 1. 旧プロジェクトのコンポーネント連携パターン

#### 中央集約型イベント管理

旧プロジェクトでは、Nuxt2 の`$emit`システムとグローバルイベントバスを活用した連携を採用していました：

```javascript
// Body.vue - 中央イベントハブ
this.$nuxt.$on('click-song', (song, pos) => {
  this.$controller.play_or_pause(song, pos)
})

// SongRow.vue - イベント発火
clickSong() {
  this.$nuxt.$emit('click-song', this.song, this.position)
}
```

#### 階層的 Emit 連携

```vue
<!-- Body.vue - 親コンポーネント -->
<Control
  @prev="$controller.prev"
  @play-or-pause="playOrPause"
  @next="$controller.next"
  @shuffle-on="shufflePlaylist"
  @shuffle-off="restorePlaylist"
/>

<!-- Control.vue - 子コンポーネント -->
<script>
  methods: {
    clickPrev() {
      this.$emit('prev')
    },
    clickPlayOrPause() {
      this.$emit('play-or-pause')
    },
    clickNext() {
      this.$emit('next')
    },
  }
</script>
```

#### Store 中心の状態同期

```javascript
// Control.vue - Vuex Gettersによる状態監視
computed: {
  song() {
    return (
      this.$store.getters['controller/playing'] ||
      this.$store.getters['controller/pausing']
    )
  },
  video() {
    return this.$store.getters['contents/videos'].get(this.song.video)
  },
  playing() {
    return this.$store.getters['controller/playing']
  },
}
```

#### Plugin 注入による機能呼び出し

```javascript
// Body.vue - プラグイン機能の直接呼び出し
methods: {
  playOrPause() {
    const selected_song =
      this.$store.getters['controller/playing'] ||
      this.$store.getters['controller/pausing']

    const position = this.$store.getters['playlist/position']
    this.$controller.play_or_pause(selected_song, position)
  },
  shufflePlaylist() {
    this.$playlist.setShuffled()
  }
}
```

### 2. 新プロジェクトのコンポーネント連携進化

#### Composition API + Pinia による宣言的連携

```vue
<!-- PlayerControls.vue - コンポーネント合成型 -->
<script setup lang="ts">
  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  // リアクティブな状態監視
  const currentTrack = computed(() => queueStore.nowPlaying);
  const isPlaying = computed(() => playerStore.isPlaying);
</script>

<template>
  <!-- 子コンポーネントに責務を委譲 -->
  <PlayerProgressBar />
  <PlayerTrackInfo />
  <PlayerControlButtons />
  <PlayerTimeDisplay />
  <PlayerExtraControls />
</template>
```

#### 型安全な Props/Emits 連携

```typescript
// SongRow.vue - TypeScript定義による安全性
interface Props {
  song: Song;
}

const props = defineProps<Props>();

// Emits - 明示的なイベント定義
const emit = defineEmits<{
  "play-now": [song: Song];
  "add-to-queue": [song: Song];
  "add-to-playlist": [song: Song];
}>();
```

#### Store Actions による直接操作

```vue
<!-- SongRow.vue - 直接的なStore操作 -->
<script setup>
  const queue = usePlayerQueue();
  const player = usePlayerStore();

  const playNow = () => {
    // ユーザーインタラクション記録
    player.setUserInteracted(true);

    // 新しいキューとして設定して即座に再生
    queue.setQueue([props.song]);
    queue.play(0);

    emit("play-now", props.song);
  };
</script>
```

#### ウォッチベースの自動同期

```vue
<!-- GlobalYouTubePlayer.vue - 自動的な状態同期 -->
<script setup>
  // キューの変更を監視
  watch(
    () => queueStore.nowPlaying,
    (newTrack, oldTrack) => {
      if (newTrack && newTrack !== oldTrack) {
        if (playerStore.transitionReason === null) {
          playerStore.setTransitionReason("manual");
        }
        playCurrentTrack();
      }
    },
    { immediate: true }
  );
</script>
```

### 3. コンポーネント設計パターンの比較

#### 旧プロジェクト: モノリシック設計

```vue
<!-- Control.vue - 単一責任の肥大化 -->
<template>
  <div class="control">
    <!-- 楽曲情報表示 -->
    <div class="control-left">
      <div class="song_thumb">
        <img :src="video.thumbnail_path" />
      </div>
      <div class="song_info">
        <div class="song_title">{{ song.title }}</div>
        <div class="song_artist">{{ song.artist }}</div>
      </div>
    </div>

    <!-- 再生コントロール -->
    <div class="control-middle">
      <span @click="clickPrev" class="icon">
        <li class="fa-thin fa-backward-step"></li>
      </span>
      <span @click="clickPlayOrPause" class="icon">
        <li v-if="playing" class="fa-thin fa-pause"></li>
        <li v-else class="fa-thin fa-play"></li>
      </span>
      <span @click="clickNext" class="icon">
        <li class="fa-thin fa-forward-step"></li>
      </span>
    </div>
  </div>
</template>
```

#### 新プロジェクト: マイクロコンポーネント設計

```vue
<!-- PlayerControls.vue - 責務分離による再利用性 -->
<template>
  <div class="player-controls">
    <!-- 各機能を独立したコンポーネントに分離 -->
    <PlayerProgressBar />

    <!-- デスクトップ版 -->
    <div class="desktop-layout">
      <PlayerTrackInfo />
      <PlayerControlButtons />
      <PlayerTimeDisplay />
      <PlayerExtraControls />
    </div>

    <!-- モバイル版 -->
    <div class="mobile-layout">
      <PlayerTrackInfo :is-mobile="true" />
      <PlayerControlButtons :is-mobile="true" />
      <PlayerTimeDisplay />
    </div>
  </div>
</template>
```

### 4. データ流通パターンの進化

#### 旧プロジェクト: 多方向データフロー

```
┌─────────┐    $emit     ┌─────────┐
│SongRow  │─────────────→│Body     │
└─────────┘              └─────────┘
                              │
                              ▼ $controller
                         ┌─────────┐
                         │Plugin   │
                         └─────────┘
                              │
                              ▼ commit
                         ┌─────────┐
                         │Store    │
                         └─────────┘
                              │
                              ▼ getters
                         ┌─────────┐
                         │Control  │
                         └─────────┘
```

#### 新プロジェクト: 一方向データフロー

```
┌─────────┐   actions    ┌─────────┐
│SongRow  │─────────────→│Store    │
└─────────┘              └─────────┘
                              │
                              ▼ reactive
                         ┌─────────┐
                         │All      │
                         │Components│
                         └─────────┘
```

### 5. イベントハンドリングの進化

#### 旧プロジェクト: 多段階イベント伝播

```javascript
// SongRow.vue → Body.vue → Controller Plugin → Store
clickSong() {
  this.$nuxt.$emit('click-song', this.song, this.position)
}

// Body.vue
this.$nuxt.$on('click-song', (song, pos) => {
  this.$controller.play_or_pause(song, pos)
})

// Controller Plugin
play_or_pause: (song, position) => {
  store.commit('playlist/setPosition', position)
  app.$controller.play(playing, song)
}
```

#### 新プロジェクト: 直接的 Store 操作

```typescript
// SongRow.vue - 直接的で明確な操作
const playNow = () => {
  player.setUserInteracted(true);
  queue.setQueue([props.song]);
  queue.play(0);
  emit("play-now", props.song);
};
```

### 6. 再利用性とテスタビリティの向上

#### 個別コンポーネントの独立性

```vue
<!-- PlayerVolumeControl.vue - 独立した機能コンポーネント -->
<script setup lang="ts">
  const playerStore = usePlayerStore();

  const volume = computed(() => playerStore.volume);
  const isMuted = computed(() => playerStore.isMuted);

  const onVolumeChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const newVolume = parseInt(input.value);
    playerStore.setVolume(newVolume);
  };
</script>
```

#### Props による設定の外部化

```typescript
// PlayerControlButtons.vue - 設定可能な再利用コンポーネント
interface Props {
  isMobile?: boolean;
}

defineProps<Props>();
```

## ギャップ分析と実装推奨事項（最終調査結果）

### 現状の詳細調査結果

新プロジェクトのコード詳細分析により、以下の実装状況が確認されました：

#### ✅ 実装済み機能

- 基本的な再生制御（再生/停止/前後）
- キュー管理（`usePlayerQueue.ts` - 基本的な前後移動）
- プレイヤー状態管理（`player.ts` - TypeScript 化済み）
- エラーハンドリング（リトライ機能 + `transitionReason` 追跡）
- モバイル対応の再生制御 UI
- ユーザーインタラクション追跡

#### ❌ 未実装・不完全機能

### 1. シャッフル機能（完全に未実装）

**旧システムの実装（充実）:**

```javascript
// controller.js - 状態管理
setShuffle(state, bool) {
  state.shuffle = bool
},

// playlist.js - Fisher-Yatesアルゴリズム
setShuffled() {
  this.shuffled_list = JSON.parse(JSON.stringify(this.playlist))
  for (let i = this.shuffled_list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[this.shuffled_list[i], this.shuffled_list[j]] = [this.shuffled_list[j], this.shuffled_list[i]]
  }
  this.position = this.shuffled_list.findIndex(item => item.id === this.playing_item.id)
}

// SubControl.vue - UI連携
clickShuffle() {
  this.$store.commit('controller/setShuffle', !this.isShuffle)
  if (this.isShuffle) {
    this.$playlist.setShuffled()
  }
}
```

**新システムの現状:**

- `PlayerControlButtons.vue` L47: シャッフルボタンの UI は存在
- しかしクリックハンドラーが未実装（`<button>` に `@click` なし）
- `player.ts`, `usePlayerQueue.ts` にシャッフル状態管理なし
- シャッフルされたキューを保持する仕組みなし

### 2. リピート機能（完全に未実装）

**旧システムの実装（充実）:**

```javascript
// controller.js - 3段階モード管理
state: {
  repeat_mode: 'none' // 'none', 'all', 'once'
},

// SubControl.vue - 循環的切り替え
changeRepeatMode() {
  switch (repeatMode) {
    case 'none':
      this.$store.commit('controller/setRepeatMode', 'all')
      break
    case 'all':
      this.$store.commit('controller/setRepeatMode', 'once')
      break
    case 'once':
      this.$store.commit('controller/setRepeatMode', 'none')
      break
  }
}

// 楽曲終了時の自動処理
onStateChange: (event) => {
  if (event.data === 0) { // 終了
    if (repeat_mode === 'once') {
      player.playVideo() // 同じ曲をリピート
    } else if (repeat_mode === 'all') {
      controller.next() // 次の曲（最後なら最初に戻る）
    }
  }
}
```

**新システムの現状:**

- `PlayerControlButtons.vue` L135: リピートボタンの UI は存在
- しかしクリックハンドラーが未実装
- リピートモード管理が存在しない
- 楽曲終了時のリピート処理が未実装

### 3. プレイリスト位置同期（部分的実装）

**旧システムの実装:**

```javascript
sync_playlist_position() {
  if (this.shuffle) {
    this.position = this.shuffled_list.findIndex(item => item.id === this.playing_item.id)
  } else {
    this.position = this.playlist.findIndex(item => item.id === this.playing_item.id)
  }
}
```

**新システムの現状:**

- 基本的なインデックス管理（`nowPlayingIndex`）は存在
- しかしシャッフル時の位置同期機能がない
- 外部からの楽曲変更時の同期処理が不完全

### 4. 時間ベース自動ジャンプ（確認できず）

**旧システムの実装:**

```javascript
let auto_jump_time = 30; // 30秒で自動ジャンプ
// 指定時間到達での自動次曲移動
```

**新システムの現状:**

- この機能の実装を確認できない

### 5. 楽曲終了時の自動遷移（不完全）

**新システムの現状:**

- `GlobalYouTubePlayer.vue` に基本的な終了処理はあるが、リピート・シャッフル対応が不十分

## 実装推奨事項（優先順位付き）

### 🚨 優先度 1: シャッフル・リピート機能の実装

#### ステップ 1: ストア拡張

**`player.ts` への追加:**

```typescript
state: () => ({
  // ...既存の状態
  isShuffled: false,
  repeatMode: 'none' as 'none' | 'all' | 'once',
}),

// 追加アクション
setShuffled(enabled: boolean) {
  this.isShuffled = enabled;
},
setRepeatMode(mode: 'none' | 'all' | 'once') {
  this.repeatMode = mode;
  console.log(`リピートモード変更: ${mode}`);
},
toggleShuffle() {
  this.isShuffled = !this.isShuffled;
},
cycleRepeatMode() {
  const modes = ['none', 'all', 'once'] as const;
  const currentIndex = modes.indexOf(this.repeatMode);
  const nextIndex = (currentIndex + 1) % modes.length;
  this.setRepeatMode(modes[nextIndex]);
}
```

#### ステップ 2: キューストア拡張

**`usePlayerQueue.ts` への追加:**

```typescript
state: () => ({
  // ...既存の状態
  originalQueue: [] as QueueItem[], // シャッフル前の元キュー
}),

// シャッフル機能
shuffleQueue() {
  const playerStore = usePlayerStore();

  if (!playerStore.isShuffled) {
    // 元のキューを保存
    this.originalQueue = [...this.queue];

    // Fisher-Yatesアルゴリズム
    for (let i = this.queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
    }

    // 現在再生中の曲のインデックスを更新
    this.syncCurrentTrackIndex();
  } else {
    // 元のキューに戻す
    this.queue = [...this.originalQueue];
    this.syncCurrentTrackIndex();
  }
},

// 現在再生中の曲のインデックスを同期
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
},

// リピート対応の次の曲
nextWithRepeat() {
  const playerStore = usePlayerStore();

  if (this.hasNext) {
    this.next();
  } else if (playerStore.repeatMode === 'all') {
    this.nowPlayingIndex = 0; // 最初に戻る
  } else if (playerStore.repeatMode === 'once') {
    // 現在の曲を再再生（インデックス変更なし）
    playerStore.seek(0);
    if (!playerStore.isPlaying) {
      playerStore.play();
    }
  }
  // repeatMode === 'none' の場合は何もしない（再生停止）
}
```

#### ステップ 3: UI 機能追加

**`PlayerControlButtons.vue` への追加:**

```typescript
// シャッフル・リピートハンドラー
const toggleShuffle = () => {
  playerStore.setUserInteracted(true);
  playerStore.toggleShuffle();
  queueStore.shuffleQueue();
};

const cycleRepeat = () => {
  playerStore.setUserInteracted(true);
  playerStore.cycleRepeatMode();
};

// 状態の取得
const isShuffled = computed(() => playerStore.isShuffled);
const repeatMode = computed(() => playerStore.repeatMode);

// アイコンクラスの計算
const shuffleClass = computed(() => ({
  "text-green-400": isShuffled.value,
  "text-gray-400 hover:text-white": !isShuffled.value,
}));

const repeatClass = computed(() => ({
  "text-green-400": repeatMode.value !== "none",
  "text-gray-400 hover:text-white": repeatMode.value === "none",
}));
```

**テンプレート更新:**

```vue
<!-- シャッフルボタン -->
<button
  v-if="!isMobile"
  @click="toggleShuffle"
  :class="[
    'p-2 hover:bg-gray-700 rounded-full transition-colors',
    shuffleClass,
  ]"
  :title="isShuffled ? 'シャッフルをオフ' : 'シャッフルをオン'"
>

<!-- リピートボタン -->
<button
  v-if="!isMobile"
  @click="cycleRepeat"
  :class="['p-2 hover:bg-gray-700 rounded-full transition-colors', repeatClass]"
  :title="`リピート: ${repeatMode === 'none' ? 'オフ' : repeatMode === 'all' ? 'すべて' : '1曲'}`"
>
  <!-- リピートモードに応じたアイコン -->
  <svg v-if="repeatMode === 'once'" ...><!-- リピート1のアイコン --></svg>
  <svg v-else ...><!-- 通常リピートアイコン --></svg>
</button>
```

#### ステップ 4: 楽曲終了時の処理更新

**`GlobalYouTubePlayer.vue` の終了処理:**

```typescript
const onPlayerStateChange = (event: any) => {
  if (event.data === 0) {
    // 終了
    playerStore.setTransitionReason("auto-end");

    const repeatMode = playerStore.repeatMode;

    if (repeatMode === "once") {
      // 同じ曲をリピート
      playerStore.seek(0);
      playerStore.play();
    } else {
      // 次の曲へ（all の場合は最初に戻る、none の場合は停止）
      queueStore.nextWithRepeat();
    }
  }
};
```

### 🔧 優先度 2: プレイリスト位置同期の強化

- 外部からの楽曲選択時の同期処理の改善
- シャッフル/通常モード切り替え時の位置調整

### 📈 優先度 3: その他機能の実装

- 時間ベース自動ジャンプ機能
- エラー発生時の自動スキップ処理
- より詳細なユーザー通知機能

### 実装作業の進め方

1. **第 1 段階** (約 2-3 時間): 基本的なシャッフル・リピート状態管理の実装
2. **第 2 段階** (約 1-2 時間): UI コンポーネントとの連携実装
3. **第 3 段階** (約 1 時間): 楽曲終了時のリピート処理実装
4. **第 4 段階** (約 2 時間): シャッフル時のキュー管理最適化
5. **第 5 段階** (約 1 時間): エラーハンドリングの強化

**総作業時間見積もり: 約 7-9 時間**

これらの実装により、新プロジェクトは旧システムの全機能を完全に置き換え、さらに TypeScript による型安全性、モバイル対応、パフォーマンス最適化を付加した、より堅牢なシステムとなります。
