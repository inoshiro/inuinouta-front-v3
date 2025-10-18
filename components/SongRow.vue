<template>
  <div :class="rowClasses">
    <!-- モバイル表示 -->
    <div class="block md:hidden">
      <div class="flex items-stretch min-h-[88px]">
        <!-- サムネイル（モバイル） -->
        <div
          class="flex-shrink-0 w-12 h-9 my-auto ml-3 relative cursor-pointer"
          @click="clickSong"
        >
          <div
            class="w-full h-full bg-gray-200 rounded border border-gray-300 flex items-center justify-center overflow-hidden"
          >
            <img
              v-if="song.video.thumbnail_path"
              :src="song.video.thumbnail_path"
              :alt="song.title"
              class="w-full h-full object-cover"
              loading="lazy"
              @error="handleImageError"
            />
            <span v-else class="text-xs text-gray-400">🎵</span>
          </div>
          <!-- 再生状態インジケーター -->
          <div
            v-if="isActivelyPlaying"
            class="absolute inset-0 flex items-center justify-center bg-black/80 rounded"
          >
            <div class="playing-indicator">
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
            </div>
          </div>
          <div
            v-else-if="isPaused"
            class="absolute inset-0 flex items-center justify-center bg-black/80 rounded"
          >
            <svg
              class="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>

        <!-- 楽曲情報（モバイル） -->
        <div class="flex-1 min-w-0 cursor-pointer py-3 px-3" @click="clickSong">
          <h3 class="text-sm font-medium text-gray-900 truncate mb-1">
            {{ song.title }}
          </h3>
          <p class="text-xs text-gray-500 truncate mb-1">
            {{ song.artist }}
          </p>
          <!-- バッジとアクション（モバイル） -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span
                v-if="song.is_original"
                class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                オリジナル
              </span>
            </div>
            <!-- モバイル用アクション -->
            <div class="flex items-center space-x-2" @click.stop>
              <button
                title="再生"
                class="p-3 text-gray-400 hover:text-blue-600 rounded-full"
                @click.stop="playNow"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
              <button
                title="キューに追加"
                class="p-3 text-gray-400 hover:text-green-600 rounded-full"
                @click.stop="addToQueue"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
              <a
                :href="youtubeUrl"
                target="_blank"
                rel="noopener noreferrer"
                title="YouTubeで開く"
                class="p-3 text-gray-400 hover:text-red-600 rounded-full"
                @click.stop
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- 詳細ページへの遷移領域（モバイル） -->
        <NuxtLink
          :to="`/songs/${song.id}`"
          class="flex-shrink-0 self-stretch flex items-center justify-center w-12 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border-l border-gray-200"
          @click.stop
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </NuxtLink>
      </div>
    </div>

    <!-- デスクトップ表示 -->
    <div class="hidden md:flex items-stretch p-0 min-h-[80px]">
      <!-- サムネイル -->
      <div
        class="flex-shrink-0 w-16 h-12 my-auto ml-4 mr-4 relative cursor-pointer"
        @click="clickSong"
      >
        <div
          class="w-full h-full bg-gray-200 rounded border border-gray-300 flex items-center justify-center overflow-hidden"
        >
          <img
            v-if="song.video.thumbnail_path"
            :src="song.video.thumbnail_path"
            :alt="song.title"
            class="w-full h-full object-cover"
            loading="lazy"
            @error="handleImageError"
          />
          <span v-else class="text-xs text-gray-400">🎵</span>
        </div>
        <!-- 再生状態インジケーター -->
        <div
          v-if="isActivelyPlaying"
          class="absolute inset-0 flex items-center justify-center bg-black/80 rounded"
        >
          <div class="playing-indicator">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          </div>
        </div>
        <div
          v-else-if="isPaused"
          class="absolute inset-0 flex items-center justify-center bg-black/80 rounded"
        >
          <svg
            class="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>

      <!-- 楽曲情報 -->
      <div class="flex-1 min-w-0 cursor-pointer py-4" @click="clickSong">
        <div class="flex items-center space-x-2 mb-1">
          <h3 class="text-sm font-medium text-gray-900 truncate">
            {{ song.title }}
          </h3>
          <span
            v-if="song.is_original"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
          >
            オリジナル
          </span>
        </div>
        <p class="text-sm text-gray-500 truncate">
          {{ song.artist }}
        </p>
        <div class="flex items-center space-x-4 mt-1">
          <a
            :href="youtubeUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-blue-600 hover:text-blue-800"
            @click.stop
          >
            YouTube で開く
          </a>
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="flex-shrink-0 flex items-center space-x-3 py-4 pr-4" @click.stop>
        <!-- 今すぐ再生ボタン -->
        <button
          title="今すぐ再生"
          class="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-150"
          @click.stop="playNow"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <!-- キューに追加ボタン -->
        <button
          title="キューに追加"
          class="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors duration-150"
          @click.stop="addToQueue"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>

        <!-- プレイリストに追加ボタン -->
        <button
          title="プレイリストに追加"
          class="p-3 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors duration-150"
          @click.stop="$emit('add-to-playlist', song)"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </button>
      </div>

      <!-- 詳細ページへの遷移領域（デスクトップ） -->
      <NuxtLink
        :to="`/songs/${song.id}`"
        class="flex-shrink-0 self-stretch flex items-center justify-center w-16 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border-l border-gray-200"
        @click.stop
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
  import { computed } from "vue";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";
  import { usePlayerStore } from "~/stores/player";

  // Props
  const props = defineProps({
    song: {
      type: Object,
      required: true,
    },
  });

  // Stores
  const queue = usePlayerQueue();
  const player = usePlayerStore();

  // Emits（外部との互換性を保持）
  const emit = defineEmits(["play-now", "add-to-queue", "add-to-playlist"]);

  // 直接再生（前プロジェクトのclickSongを参考）
  const playNow = () => {
    // ユーザーインタラクション記録（モバイル対応強化）
    player.setUserInteracted(true);

    // 新しいキューとして設定して即座に再生
    queue.setQueue([props.song]);
    queue.play(0);
    emit("play-now", props.song);

    // 再生コマンドを確実に実行（旧プロジェクトの手法）
    setTimeout(() => {
      if (player.ytPlayer && player.isPlayerReady) {
        player.play();
      }
    }, 100);
  };

  // サムネイル・曲情報クリック時の再生（前プロジェクトスタイル）
  const clickSong = () => {
    console.log("Song clicked:", props.song.title);
    playNow();
  };

  // キューに追加
  const addToQueue = () => {
    console.log("Adding to queue:", props.song.title);
    queue.addToQueue(props.song);
    emit("add-to-queue", props.song);
  };

  // 現在再生中の楽曲かどうか（シンプルな判定）
  const isCurrentlyPlaying = computed(() => {
    return queue.nowPlaying?.id === props.song.id;
  });

  // 再生中且つ実際に音楽が流れているかどうか
  const isActivelyPlaying = computed(() => {
    return isCurrentlyPlaying.value && player.isPlaying;
  });

  // 一時停止中かどうか
  const isPaused = computed(() => {
    return (
      isCurrentlyPlaying.value &&
      !player.isPlaying &&
      player.playerState === "PAUSED"
    );
  });

  // 計算プロパティ（メモ化）
  const youtubeUrl = computed(() => {
    const base = "https://youtube.com/watch?";
    const params = new URLSearchParams();
    params.append("v", props.song.video.id);
    if (props.song.start_at) {
      params.append("t", props.song.start_at.toString());
    }
    return base + params.toString();
  });

  // CSS動的クラス（前プロジェクトのようにシンプルに）
  const rowClasses = computed(() => [
    "song-row border-b border-gray-200 transition-colors duration-150",
    isCurrentlyPlaying.value
      ? "bg-blue-50 hover:bg-blue-100 -active"
      : "bg-white hover:bg-gray-50",
  ]);

  // 画像読み込みエラーハンドリング
  const handleImageError = (event) => {
    event.target.style.display = "none";
  };
</script>

<style scoped>
  /* GPU 加速の最適化 */
  .song-row {
    transform: translateZ(0);
    will-change: background-color;
    contain: layout style paint;
    /* 高さを明示的に設定してレイアウトシフトを防ぐ */
    min-height: 80px; /* デスクトップ */
  }

  /* 前プロジェクトのようなアクティブ状態の強調 */
  .song-row.-active {
    background-color: rgb(239 246 255) !important; /* bg-blue-50 */
    border-color: rgb(147 197 253); /* border-blue-300 */
  }

  /* 再生中インジケーター（前プロジェクトスタイル） */
  .playing-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1px;
  }

  .playing-indicator .bar {
    width: 2px;
    height: 8px;
    background: white;
    animation: playing-animation 1s ease-in-out infinite;
  }

  .playing-indicator .bar:nth-child(1) {
    animation-delay: 0s;
  }

  .playing-indicator .bar:nth-child(2) {
    animation-delay: 0.2s;
  }

  .playing-indicator .bar:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes playing-animation {
    0%,
    100% {
      height: 4px;
    }
    50% {
      height: 12px;
    }
  }

  /* 画像の最適化 */
  .song-row img {
    transform: translateZ(0);
    will-change: auto;
  }

  /* ボタンのアニメーション最適化 */
  .song-row button {
    transform: translateZ(0);
    will-change: color, background-color;
  }

  /* モバイルでの高さ調整 */
  @media (max-width: 768px) {
    .song-row {
      min-height: 88px; /* モバイル */
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }

    .song-row button {
      min-height: 52px;
      min-width: 52px;
    }
  }

  /* デスクトップでの調整 */
  @media (min-width: 769px) {
    .song-row {
      min-height: 80px;
    }

    /* パディングの調整 */
    .song-row .hidden.md\\:flex {
      padding: 1rem; /* p-4 相当 */
    }
  }

  /* コンテンツが切れないようにするための調整 */
  .song-row .flex-1 {
    min-width: 0;
    overflow: hidden;
  }

  .song-row .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ボーダーの調整 */
  .song-row:last-child {
    border-bottom: none;
  }
</style>
