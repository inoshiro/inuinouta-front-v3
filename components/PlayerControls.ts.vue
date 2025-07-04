<script setup lang="ts">
  import { computed } from "vue";
  import { usePlayerStore } from "~/stores/player";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";

  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  // 時間フォーマット関数
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 現在の楽曲情報
  const currentTrack = computed(() => queueStore.nowPlaying);
  const currentTrackTitle = computed(() => {
    if (!currentTrack.value) return "再生中の楽曲はありません";
    return `${currentTrack.value.title} - ${
      currentTrack.value.artist || "Unknown Artist"
    }`;
  });

  // 楽曲範囲での進行状況計算
  const trackProgress = computed(() => {
    if (!currentTrack.value || !playerStore.duration) return 0;

    const startTime = currentTrack.value.start_at || 0;
    const endTime = currentTrack.value.end_at || playerStore.duration;
    const trackDuration = endTime - startTime;
    const currentProgress = Math.max(0, playerStore.currentTime - startTime);

    return trackDuration > 0 ? (currentProgress / trackDuration) * 100 : 0;
  });

  // 楽曲の表示時間計算
  const trackCurrentTime = computed(() => {
    if (!currentTrack.value) return 0;
    const startTime = currentTrack.value.start_at || 0;
    return Math.max(0, playerStore.currentTime - startTime);
  });

  const trackDuration = computed(() => {
    if (!currentTrack.value) return 0;
    const startTime = currentTrack.value.start_at || 0;
    const endTime = currentTrack.value.end_at || playerStore.duration;
    return Math.max(0, endTime - startTime);
  });

  // 再生/一時停止の切り替え
  const togglePlayPause = () => {
    if (playerStore.isPlaying) {
      playerStore.pause();
    } else {
      playerStore.play();
    }
  };

  // 前の曲
  const playPrevious = () => {
    queueStore.previous();
  };

  // 次の曲
  const playNext = () => {
    queueStore.next();
  };

  // シークバーの操作（楽曲範囲内）
  const onSeek = (event: Event) => {
    if (!currentTrack.value) return;

    const input = event.target as HTMLInputElement;
    const progressRatio = parseFloat(input.value) / 100;

    const startTime = currentTrack.value.start_at || 0;
    const endTime = currentTrack.value.end_at || playerStore.duration;
    const trackDuration = endTime - startTime;

    const seekTime = startTime + trackDuration * progressRatio;
    playerStore.seek(seekTime);
  };

  // 音量調整
  const onVolumeChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    playerStore.setVolume(parseInt(input.value));
  };
</script>

<template>
  <!-- レスポンシブ対応のコンパクトプレイヤー -->
  <div class="bg-gray-900 text-white shadow-lg">
    <!-- プログレスバー（上部） -->
    <div class="w-full bg-gray-700 h-1">
      <div
        class="h-full bg-blue-500 transition-all duration-300"
        :style="{ width: `${trackProgress}%` }"
      />
    </div>

    <!-- メインコントロール -->
    <div class="px-2 sm:px-4 py-2">
      <div class="flex items-center gap-2 sm:gap-4">
        <!-- 楽曲情報（モバイル優先） -->
        <div class="flex-1 min-w-0 order-2 sm:order-1">
          <div class="text-xs sm:text-sm font-medium truncate">
            {{ currentTrack?.title || "楽曲を選択してください" }}
          </div>
          <div class="text-xs text-gray-400 flex items-center gap-1 sm:gap-2">
            <span>{{ formatTime(trackCurrentTime) }}</span>
            <span>/</span>
            <span>{{ formatTime(trackDuration) }}</span>
            <span v-if="currentTrack?.artist" class="hidden sm:inline">
              · {{ currentTrack.artist }}
            </span>
          </div>
        </div>

        <!-- 再生コントロール（モバイル優先配置） -->
        <div class="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
          <!-- 前の曲 -->
          <button
            :disabled="!queueStore.hasPrevious"
            :class="[
              'p-1 sm:p-2 rounded-full transition-colors',
              queueStore.hasPrevious
                ? 'hover:bg-gray-700 text-white'
                : 'text-gray-500 cursor-not-allowed',
            ]"
            @click="playPrevious"
          >
            <svg
              class="w-4 h-4 sm:w-5 sm:h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <!-- 再生/一時停止 -->
          <button
            :disabled="!currentTrack"
            class="p-2 sm:p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            @click="togglePlayPause"
          >
            <svg
              v-if="playerStore.isPlaying"
              class="w-4 h-4 sm:w-5 sm:h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
            <svg
              v-else
              class="w-4 h-4 sm:w-5 sm:h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          <!-- 次の曲 -->
          <button
            :disabled="!queueStore.hasNext"
            :class="[
              'p-1 sm:p-2 rounded-full transition-colors',
              queueStore.hasNext
                ? 'hover:bg-gray-700 text-white'
                : 'text-gray-500 cursor-not-allowed',
            ]"
            @click="playNext"
          >
            <svg
              class="w-4 h-4 sm:w-5 sm:h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        <!-- 音量コントロール（デスクトップのみ） -->
        <div class="hidden lg:flex items-center gap-2 w-24 xl:w-32 order-3">
          <!-- ミュートボタン -->
          <button
            class="p-1 hover:bg-gray-700 rounded transition-colors"
            @click="playerStore.toggleMute()"
          >
            <svg
              v-if="playerStore.isMuted"
              class="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
              />
            </svg>
            <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
              />
            </svg>
          </button>

          <!-- 音量スライダー -->
          <input
            type="range"
            min="0"
            max="100"
            :value="playerStore.volume"
            class="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            @input="onVolumeChange"
          />
        </div>

        <!-- シークバー（モバイル時は下部に配置） -->
        <div class="sm:hidden order-4 w-full mt-2">
          <input
            type="range"
            min="0"
            max="100"
            :value="trackProgress"
            class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            @input="onSeek"
          />
        </div>

        <!-- デスクトップ用シークバー -->
        <div class="hidden sm:flex items-center gap-2 flex-1 max-w-xs order-4">
          <input
            type="range"
            min="0"
            max="100"
            :value="trackProgress"
            class="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            @input="onSeek"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* カスタムスライダースタイル */
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .slider::-webkit-slider-track {
    background: #4b5563;
    border-radius: 4px;
  }

  .slider::-moz-range-track {
    background: #4b5563;
    border-radius: 4px;
  }

  /* ホバー時のスライダー効果 */
  .slider:hover::-webkit-slider-thumb {
    background: #2563eb;
  }

  .slider:hover::-moz-range-thumb {
    background: #2563eb;
  }
</style>
