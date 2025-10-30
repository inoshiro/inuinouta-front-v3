<script setup lang="ts">
  import { computed } from "vue";
  import { usePlayerStore } from "~/stores/player";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";

  interface Props {
    isMobile?: boolean;
  }

  defineProps<Props>();

  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  // 現在の楽曲情報
  const currentTrack = computed(() => queueStore.nowPlaying);

  // 再生状態のメモ化
  const isPlaying = computed(() => playerStore.isPlaying);
  const hasNext = computed(() => queueStore.hasNext);
  const hasPrevious = computed(() => queueStore.hasPrevious);

  // 再生/一時停止の切り替え
  const togglePlayPause = () => {
    // ユーザーインタラクション記録（モバイル対応強化）
    playerStore.setUserInteracted(true);

    if (playerStore.isPlaying) {
      playerStore.pause();
    } else {
      playerStore.play();
    }
  };

  // 前の曲
  const playPrevious = () => {
    // ユーザーインタラクション記録
    playerStore.setUserInteracted(true);
    queueStore.previous();
  };

  // 次の曲
  const playNext = () => {
    // ユーザーインタラクション記録
    playerStore.setUserInteracted(true);
    queueStore.next();
  };

  // シャッフル切り替え
  const toggleShuffle = () => {
    playerStore.setUserInteracted(true);
    playerStore.toggleShuffle();
    queueStore.shuffleQueue();
  };

  // リピートモード切り替え
  const cycleRepeat = () => {
    playerStore.setUserInteracted(true);
    playerStore.cycleRepeatMode();
  };

  // シャッフル・リピート状態の取得
  const isShuffled = computed(() => playerStore.isShuffled);
  const repeatMode = computed(() => playerStore.repeatMode);

  // アイコンクラスの計算
  const shuffleClass = computed(() => [
    "p-2 hover:bg-gray-700 rounded-full transition-colors",
    isShuffled.value
      ? "text-blue-400 hover:text-blue-300"
      : "text-gray-400 hover:text-white opacity-75 hover:opacity-100",
  ]);

  const repeatClass = computed(() => [
    "p-2 hover:bg-gray-700 rounded-full transition-colors",
    repeatMode.value !== "none"
      ? "text-blue-400 hover:text-blue-300"
      : "text-gray-400 hover:text-white opacity-75 hover:opacity-100",
  ]);
</script>

<template>
  <!-- 再生コントロール -->
  <div :class="['flex items-center gap-2', isMobile ? 'gap-2' : 'gap-4']">
    <!-- シャッフル（デスクトップのみ） -->
    <button
      v-if="!isMobile"
      :class="shuffleClass"
      :title="isShuffled ? 'シャッフルをオフ' : 'シャッフルをオン'"
      @click="toggleShuffle"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
      :title="'前の曲'"
      @click="playPrevious"
    >
      <svg
        :class="[isMobile ? 'w-5 h-5' : 'w-6 h-6']"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
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
      :title="isPlaying ? '一時停止' : '再生'"
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
      <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
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
      :title="'次の曲'"
      @click="playNext"
    >
      <svg
        :class="[isMobile ? 'w-5 h-5' : 'w-6 h-6']"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
      </svg>
    </button>

    <!-- リピート（デスクトップのみ） -->
    <button
      v-if="!isMobile"
      :class="repeatClass"
      :title="`リピート: ${
        repeatMode === 'none' ? 'オフ' : repeatMode === 'all' ? 'すべて' : '1曲'
      }`"
      @click="cycleRepeat"
    >
      <!-- リピートモードに応じたアイコン -->
      <svg
        v-if="repeatMode === 'once'"
        class="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"
        />
        <text
          x="12"
          y="16"
          text-anchor="middle"
          font-size="8"
          font-weight="bold"
        >
          1
        </text>
      </svg>
      <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
  /* ボタンのトランジション最適化 */
  button {
    transform: translateZ(0);
  }

  button:hover {
    transform: translateZ(0) scale(1.02);
  }
</style>
