<script setup lang="ts">
  import { computed, ref, watch, nextTick } from "vue";
  import { usePlayerStore } from "~/stores/player";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";

  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  // パフォーマンス最適化: デバウンスされた値
  const debouncedProgress = ref(0);
  const debouncedCurrentTime = ref(0);

  // 時間フォーマット関数（メモ化）
  const formatTimeCache = new Map();
  const formatTime = (seconds) => {
    const key = Math.floor(seconds);
    if (formatTimeCache.has(key)) {
      return formatTimeCache.get(key);
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const formatted = `${mins}:${secs.toString().padStart(2, "0")}`;

    // キャッシュサイズを制限
    if (formatTimeCache.size > 1000) {
      const firstKey = formatTimeCache.keys().next().value;
      if (firstKey !== undefined) {
        formatTimeCache.delete(firstKey);
      }
    }

    formatTimeCache.set(key, formatted);
    return formatted;
  };

  // 現在の楽曲情報（メモ化）
  const currentTrack = computed(() => queueStore.nowPlaying);
  const currentTrackTitle = computed(() => {
    if (!currentTrack.value) return "再生中の楽曲はありません";
    return `${currentTrack.value.title} - ${
      currentTrack.value.artist || "Unknown Artist"
    }`;
  });

  // 楽曲範囲での進行状況計算（最適化版）
  const trackProgress = computed(() => {
    if (!currentTrack.value || !playerStore.duration) return 0;

    const startTime = currentTrack.value.start_at || 0;
    const endTime = currentTrack.value.end_at || playerStore.duration;
    const trackDuration = endTime - startTime;
    const currentProgress = Math.max(0, playerStore.currentTime - startTime);

    return trackDuration > 0
      ? Math.min(100, (currentProgress / trackDuration) * 100)
      : 0;
  });

  // 楽曲の表示時間計算（最適化版）
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

  // デバウンス処理
  let progressUpdateTimer: NodeJS.Timeout | null = null;
  watch(
    [trackProgress, trackCurrentTime],
    ([newProgress, newCurrentTime]) => {
      if (progressUpdateTimer) {
        clearTimeout(progressUpdateTimer);
      }

      progressUpdateTimer = setTimeout(() => {
        debouncedProgress.value = newProgress;
        debouncedCurrentTime.value = newCurrentTime;
      }, 16); // 60fps相当
    },
    { immediate: true }
  );

  // 再生状態のメモ化
  const isPlaying = computed(() => playerStore.isPlaying);
  const hasNext = computed(() => queueStore.hasNext);
  const hasPrevious = computed(() => queueStore.hasPrevious);
  const volume = computed(() => playerStore.volume);
  const isMuted = computed(() => playerStore.isMuted);

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

  // プログレスバーのクリック処理（デバウンス付き）
  let clickDebounceTimer: NodeJS.Timeout | null = null;
  const onProgressBarClick = (event: MouseEvent) => {
    if (!currentTrack.value) return;

    if (clickDebounceTimer) {
      clearTimeout(clickDebounceTimer);
    }

    clickDebounceTimer = setTimeout(() => {
      const progressBar = event.currentTarget as HTMLElement;
      const rect = progressBar.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const progressRatio = Math.max(0, Math.min(1, clickX / rect.width));

      const startTime = currentTrack.value!.start_at || 0;
      const endTime = currentTrack.value!.end_at || playerStore.duration;
      const trackDuration = endTime - startTime;

      const seekTime = startTime + trackDuration * progressRatio;
      playerStore.seek(seekTime);
    }, 50);
  };

  // 音量調整（デバウンス付き）
  let volumeDebounceTimer: NodeJS.Timeout | null = null;
  const onVolumeChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const newVolume = parseInt(input.value);

    if (volumeDebounceTimer) {
      clearTimeout(volumeDebounceTimer);
    }

    volumeDebounceTimer = setTimeout(() => {
      playerStore.setVolume(newVolume);
    }, 100);
  };

  // クリーンアップ
  const cleanup = () => {
    if (progressUpdateTimer) clearTimeout(progressUpdateTimer);
    if (clickDebounceTimer) clearTimeout(clickDebounceTimer);
    if (volumeDebounceTimer) clearTimeout(volumeDebounceTimer);
    formatTimeCache.clear();
  };

  // コンポーネントのアンマウント時にクリーンアップ
  if (process.client) {
    window.addEventListener("beforeunload", cleanup);
  }
</script>

<template>
  <!-- YouTube Music風プレイヤーコントロール -->
  <div class="bg-gray-900 text-white border-t border-gray-700 relative">
    <!-- プログレスバー（最上部ライン） -->
    <div
      class="absolute top-0 left-0 w-full h-1 bg-gray-700 cursor-pointer group"
      @click="onProgressBarClick"
    >
      <div
        class="h-full bg-red-500 transition-all duration-300 ease-out relative"
        :style="{ width: `${trackProgress}%` }"
      >
        <!-- ホバー時のサムネイル -->
        <div
          class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style="transform: translateY(-1px)"
        />
      </div>
    </div>

    <!-- デスクトップ版 -->
    <div class="hidden lg:block">
      <div class="px-4 py-3 pt-4">
        <div class="flex items-center gap-4">
          <!-- 左側: 楽曲情報エリア (固定幅) -->
          <div class="flex items-center gap-3 w-80 min-w-0">
            <!-- アルバムアート（サムネイル） -->
            <div class="flex-shrink-0 w-14 h-14">
              <div
                class="w-full h-full bg-gray-700 rounded-md flex items-center justify-center overflow-hidden"
              >
                <img
                  v-if="currentTrack?.video?.thumbnail_path"
                  :src="currentTrack.video.thumbnail_path"
                  :alt="currentTrack.title"
                  class="w-full h-full object-cover"
                />
                <svg
                  v-else
                  class="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                  />
                </svg>
              </div>
            </div>

            <!-- 楽曲情報テキスト -->
            <div class="flex-1 min-w-0">
              <div
                class="text-sm font-medium text-white truncate hover:underline cursor-pointer"
              >
                {{ currentTrack?.title || "楽曲を選択してください" }}
              </div>
              <div
                class="text-xs text-gray-400 truncate hover:underline cursor-pointer"
              >
                {{ currentTrack?.artist || "アーティスト不明" }}
              </div>
            </div>

            <!-- いいねボタン -->
            <button
              class="p-1 hover:bg-gray-700 rounded transition-colors opacity-75 hover:opacity-100"
            >
              <svg
                class="w-5 h-5 text-gray-400 hover:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          <!-- 中央: 再生コントロール -->
          <div class="flex-1 flex flex-col gap-2 max-w-2xl mx-auto">
            <!-- コントロールボタン -->
            <div class="flex items-center justify-center gap-4">
              <!-- シャッフル -->
              <button
                class="p-2 hover:bg-gray-700 rounded-full transition-colors opacity-75 hover:opacity-100"
              >
                <svg
                  class="w-5 h-5 text-gray-400 hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"
                  />
                </svg>
              </button>

              <!-- 前の曲ボタン -->
              <button
                :disabled="!hasPrevious"
                :class="[
                  'p-2 rounded-full transition-colors',
                  hasPrevious
                    ? 'hover:bg-gray-700 text-white'
                    : 'text-gray-500 cursor-not-allowed opacity-50',
                ]"
                @click="playPrevious"
                title="前の曲"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <!-- メイン再生/一時停止ボタン -->
              <button
                :disabled="!currentTrack"
                :class="[
                  'p-2 rounded-full transition-all duration-200',
                  currentTrack
                    ? 'bg-white hover:bg-gray-100 text-gray-900 hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed',
                ]"
                @click="togglePlayPause"
                :title="isPlaying ? '一時停止' : '再生'"
              >
                <svg
                  v-if="isPlaying"
                  class="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                <svg
                  v-else
                  class="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>

              <!-- 次の曲ボタン -->
              <button
                :disabled="!hasNext"
                :class="[
                  'p-2 rounded-full transition-colors',
                  hasNext
                    ? 'hover:bg-gray-700 text-white'
                    : 'text-gray-500 cursor-not-allowed opacity-50',
                ]"
                @click="playNext"
                title="次の曲"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>

              <!-- リピート -->
              <button
                class="p-2 hover:bg-gray-700 rounded-full transition-colors opacity-75 hover:opacity-100"
              >
                <svg
                  class="w-5 h-5 text-gray-400 hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"
                  />
                </svg>
              </button>
            </div>

            <!-- 時間表示のみ -->
            <div
              class="flex items-center justify-center gap-2 text-xs text-gray-400"
            >
              <span class="tabular-nums">{{
                formatTime(trackCurrentTime)
              }}</span>
              <span class="text-gray-500">/</span>
              <span class="tabular-nums">{{ formatTime(trackDuration) }}</span>
            </div>
          </div>

          <!-- 右側: 追加コントロール (固定幅) -->
          <div class="flex items-center gap-2 w-80 justify-end">
            <!-- キューボタン -->
            <button
              class="p-2 hover:bg-gray-700 rounded transition-colors opacity-75 hover:opacity-100"
            >
              <svg
                class="w-5 h-5 text-gray-400 hover:text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"
                />
              </svg>
            </button>

            <!-- デバイス選択 -->
            <button
              class="p-2 hover:bg-gray-700 rounded transition-colors opacity-75 hover:opacity-100"
            >
              <svg
                class="w-5 h-5 text-gray-400 hover:text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 3H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM1 18v3h3c0-1.66-1.34-3-3-3z"
                />
              </svg>
            </button>

            <!-- 音量コントロール -->
            <div class="flex items-center gap-2 w-24">
              <!-- ミュートボタン -->
              <button
                class="p-2 hover:bg-gray-700 rounded transition-colors opacity-75 hover:opacity-100"
                @click="playerStore.toggleMute()"
                :title="isMuted ? 'ミュート解除' : 'ミュート'"
              >
                <svg
                  v-if="isMuted || volume === 0"
                  class="w-5 h-5 text-gray-400 hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                  />
                </svg>
                <svg
                  v-else-if="volume < 50"
                  class="w-5 h-5 text-gray-400 hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"
                  />
                </svg>
                <svg
                  v-else
                  class="w-5 h-5 text-gray-400 hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                  />
                </svg>
              </button>

              <!-- 音量スライダー -->
              <div class="flex-1 group">
                <div
                  class="relative h-1 bg-gray-600 rounded-full cursor-pointer"
                >
                  <div
                    class="absolute top-0 left-0 h-full bg-white rounded-full"
                    :style="{ width: `${volume}%` }"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    :value="volume"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    @input="onVolumeChange"
                    title="音量"
                  />
                  <div
                    class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    :style="{
                      left: `${volume}%`,
                      transform: 'translateX(-50%) translateY(-50%)',
                    }"
                  />
                </div>
              </div>
            </div>

            <!-- フルスクリーンボタン -->
            <button
              class="p-2 hover:bg-gray-700 rounded transition-colors opacity-75 hover:opacity-100"
            >
              <svg
                class="w-5 h-5 text-gray-400 hover:text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- モバイル版 -->
    <div class="block lg:hidden">
      <!-- メインコントロール -->
      <div class="px-4 py-3 pt-4">
        <div class="flex items-center gap-3">
          <!-- 楽曲情報 -->
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div
              class="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0"
            >
              <img
                v-if="currentTrack?.video?.thumbnail_path"
                :src="currentTrack.video.thumbnail_path"
                :alt="currentTrack.title"
                class="w-full h-full object-cover"
              />
              <svg
                v-else
                class="w-5 h-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-white truncate">
                {{ currentTrack?.title || "楽曲を選択してください" }}
              </div>
              <div class="text-xs text-gray-400 truncate">
                {{ currentTrack?.artist || "アーティスト不明" }}
              </div>
            </div>
          </div>

          <!-- 再生コントロール -->
          <div class="flex items-center gap-2">
            <button
              :disabled="!hasPrevious"
              :class="[
                'p-2 rounded-full transition-colors',
                hasPrevious
                  ? 'hover:bg-gray-700 text-white'
                  : 'text-gray-500 cursor-not-allowed opacity-50',
              ]"
              @click="playPrevious"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            <button
              :disabled="!currentTrack"
              :class="[
                'p-2 rounded-full transition-all duration-200',
                currentTrack
                  ? 'bg-white hover:bg-gray-100 text-gray-900'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed',
              ]"
              @click="togglePlayPause"
            >
              <svg
                v-if="isPlaying"
                class="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              <svg
                v-else
                class="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>

            <button
              :disabled="!hasNext"
              :class="[
                'p-2 rounded-full transition-colors',
                hasNext
                  ? 'hover:bg-gray-700 text-white'
                  : 'text-gray-500 cursor-not-allowed opacity-50',
              ]"
              @click="playNext"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 時間表示 -->
        <div
          class="flex items-center justify-center gap-2 text-xs text-gray-400 mt-2"
        >
          <span class="tabular-nums">{{ formatTime(trackCurrentTime) }}</span>
          <span class="text-gray-500">/</span>
          <span class="tabular-nums">{{ formatTime(trackDuration) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* GPUアクセラレーション対応 */
  .bg-gray-900 {
    transform: translateZ(0);
    will-change: transform;
  }

  /* プログレスバーの最適化 */
  .absolute.top-0.left-0.h-full.bg-red-500 {
    will-change: width;
    transform: translateZ(0);
  }

  /* カスタムスライダースタイル */
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .volume-slider::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: none;
  }

  .volume-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: none;
  }

  /* プログレスバーのホバー効果（最適化済み） */
  .progress-bar:hover .progress-thumb {
    opacity: 1;
  }

  /* タブラー数字フォント */
  .tabular-nums {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum";
  }

  /* ボタンのトランジション最適化 */
  button {
    transform: translateZ(0);
  }

  button:hover {
    transform: translateZ(0) scale(1.02);
  }

  /* レスポンシブ対応（GPU最適化） */
  @media (max-width: 1024px) {
    .w-80 {
      width: auto;
      min-width: 0;
    }
  }

  @media (max-width: 768px) {
    .max-w-2xl {
      max-width: none;
    }

    .gap-4 {
      gap: 0.75rem;
    }

    .px-4 {
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }

  /* アニメーション性能向上 */
  * {
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  /* 重いトランジションの削減 */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
