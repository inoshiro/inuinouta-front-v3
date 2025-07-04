<template>
  <div :class="rowClasses">
    <!-- モバイル表示 -->
    <div class="block md:hidden p-3 min-h-[88px]">
      <div class="flex items-start space-x-3">
        <!-- サムネイル（モバイル） -->
        <div class="flex-shrink-0 w-12 h-9">
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
        </div>

        <!-- 楽曲情報（モバイル） -->
        <div class="flex-1 min-w-0">
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
              <span class="text-xs text-gray-400">
                {{ formattedDuration }}
              </span>
            </div>
            <!-- モバイル用アクション -->
            <div class="flex items-center space-x-1">
              <button
                title="再生"
                class="p-1.5 text-gray-400 hover:text-blue-600 rounded-full"
                @click="playNow"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
              <button
                title="キューに追加"
                class="p-1.5 text-gray-400 hover:text-green-600 rounded-full"
                @click="addToQueue"
              >
                <svg
                  class="w-4 h-4"
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
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- デスクトップ表示 -->
    <div class="hidden md:flex items-center p-4 min-h-[80px]">
      <!-- サムネイル -->
      <div class="flex-shrink-0 w-16 h-12 mr-4">
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
      </div>

      <!-- 楽曲情報 -->
      <div class="flex-1 min-w-0">
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
          <span class="text-xs text-gray-400">
            再生時間: {{ formattedDuration }}
          </span>
          <a
            :href="youtubeUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-blue-600 hover:text-blue-800"
          >
            YouTube で開く
          </a>
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="flex-shrink-0 flex items-center space-x-2">
        <!-- 今すぐ再生ボタン -->
        <button
          title="今すぐ再生"
          class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-150"
          @click="playNow"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
          class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors duration-150"
          @click="addToQueue"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>

        <!-- プレイリストに追加ボタン -->
        <button
          title="プレイリストに追加"
          class="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors duration-150"
          @click="$emit('add-to-playlist', song)"
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </button>
      </div>
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

  // 直接再生
  const playNow = () => {
    // 新しいキューとして設定して即座に再生
    queue.setQueue([props.song]);
    queue.play(0);
    emit("play-now", props.song);
  };

  // キューに追加
  const addToQueue = () => {
    queue.addToQueue(props.song);
    emit("add-to-queue", props.song);
  };

  // 現在再生中の楽曲かどうか（メモ化）
  const isCurrentlyPlaying = computed(() => {
    return queue.nowPlaying?.id === props.song.id && player.isPlaying;
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

  // 期間表示の計算（メモ化）
  const formattedDuration = computed(() => {
    return formatDuration(props.song.start_at, props.song.end_at);
  });

  // CSS動的クラス（メモ化）
  const rowClasses = computed(() => [
    "song-row border-b border-gray-200 transition-colors duration-150",
    isCurrentlyPlaying.value
      ? "bg-blue-50 hover:bg-blue-100"
      : "bg-white hover:bg-gray-50",
  ]);

  // メソッド
  const formatDuration = (startAt, endAt) => {
    if (!startAt && !endAt) return "全編";

    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    if (startAt && endAt) {
      return `${formatTime(startAt)} - ${formatTime(endAt)}`;
    } else if (startAt) {
      return `${formatTime(startAt)} から`;
    } else if (endAt) {
      return `開始 - ${formatTime(endAt)}`;
    }

    return "時間不明";
  };

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
      min-height: 44px;
      min-width: 44px;
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
