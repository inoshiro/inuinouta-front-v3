<script setup lang="ts">
  import { computed, ref } from "vue";
  import { usePlayerStore } from "~/stores/player";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";

  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  // ドラッグ状態の管理（再生制御用）
  const isDragging = ref(false);
  const wasPlayingBeforeDrag = ref(false);

  // 現在の楽曲情報
  const currentTrack = computed(() => queueStore.nowPlaying);

  // ドラッグ中の表示値管理
  const dragProgressValue = ref(0);

  // 楽曲範囲での進行状況計算
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

  // プログレスバーの表示値（ドラッグ中は即座に更新）
  const displayProgressValue = computed(() => {
    return isDragging.value ? dragProgressValue.value : trackProgress.value;
  });

  // プログレス変更処理（クリック/タップ/ドラッグ全て対応）
  const onProgressChange = (event: Event) => {
    if (!currentTrack.value) return;

    const input = event.target as HTMLInputElement;
    const progressRatio = parseFloat(input.value) / 100;

    // ドラッグ中は表示値を更新
    dragProgressValue.value = parseFloat(input.value);

    const startTime = currentTrack.value.start_at || 0;
    const endTime = currentTrack.value.end_at || playerStore.duration;
    const trackDuration = endTime - startTime;

    const seekTime = startTime + trackDuration * progressRatio;
    playerStore.seek(seekTime);
  };

  // ドラッグ終了処理
  const handleDragEnd = () => {
    if (!isDragging.value) return;

    isDragging.value = false;
    if (wasPlayingBeforeDrag.value) {
      playerStore.play();
    }

    // イベントリスナーを削除
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchend", handleDragEnd);
  };

  // ドラッグ開始時にグローバルイベントリスナーを追加
  const onProgressDragStart = () => {
    isDragging.value = true;
    wasPlayingBeforeDrag.value = playerStore.isPlaying;
    dragProgressValue.value = trackProgress.value;

    // 再生中の場合は一時停止
    if (playerStore.isPlaying) {
      playerStore.pause();
    }

    // グローバルイベントリスナーを追加
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchend", handleDragEnd);
  };
</script>

<template>
  <!-- プログレスバー（親要素内で相対配置） -->
  <div class="w-full h-1 group">
    <!-- プログレスバーの背景 -->
    <div class="relative w-full h-1 bg-gray-700 rounded-none">
      <!-- 進行状況バー -->
      <div
        class="absolute top-0 left-0 h-1 bg-red-500 rounded-none transition-all duration-100"
        :style="{ width: `${displayProgressValue}%` }"
      ></div>

      <!-- レンジ入力（透明・オーバーレイ） -->
      <input
        type="range"
        min="0"
        max="100"
        :value="displayProgressValue"
        class="progress-range-slider"
        :disabled="!currentTrack"
        @input="onProgressChange"
        @mousedown="onProgressDragStart"
        @touchstart="onProgressDragStart"
      />
    </div>
  </div>
</template>

<style scoped>
  /* プログレスバーのスタイル */
  .progress-range-slider {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    background: transparent;
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    border: none;
    opacity: 0;
    z-index: 10;
  }

  /* WebKit（Chrome、Safari）用のトラックスタイル */
  .progress-range-slider::-webkit-slider-track {
    background: transparent;
    border: none;
  }

  /* WebKit用のサムネイル */
  .progress-range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 12px;
    width: 12px;
    background: #ef4444;
    border-radius: 50%;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  /* Firefox用のトラック */
  .progress-range-slider::-moz-range-track {
    background: transparent;
    border: none;
  }

  /* Firefox用のサムネイル */
  .progress-range-slider::-moz-range-thumb {
    height: 12px;
    width: 12px;
    background: #ef4444;
    border-radius: 50%;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  /* ホバー時のサムネイル表示 */
  .group:hover .progress-range-slider::-webkit-slider-thumb,
  .progress-range-slider:active::-webkit-slider-thumb {
    opacity: 1;
  }

  .group:hover .progress-range-slider::-moz-range-thumb,
  .progress-range-slider:active::-moz-range-thumb {
    opacity: 1;
  }

  /* モバイルではサムネイルを完全に非表示 */
  @media (max-width: 767px) {
    /* ホバー時もサムネイルを表示しない */
    .group:hover .progress-range-slider::-webkit-slider-thumb {
      opacity: 0;
    }

    .group:hover .progress-range-slider::-moz-range-thumb {
      opacity: 0;
    }

    /* アクティブ時（タッチ時）もサムネイルを表示しない */
    .progress-range-slider:active::-webkit-slider-thumb {
      opacity: 0;
    }

    .progress-range-slider:active::-moz-range-thumb {
      opacity: 0;
    }

    /* サムネイルのサイズ調整（非表示でも念のため） */
    .progress-range-slider::-webkit-slider-thumb {
      height: 0;
      width: 0;
    }

    .progress-range-slider::-moz-range-thumb {
      height: 0;
      width: 0;
    }

    /* モバイルでのタッチエリア拡張 */
    .progress-range-slider {
      height: 20px; /* タッチしやすいように高さを拡張 */
      top: -10px; /* 中央配置 */
    }
  }
</style>
