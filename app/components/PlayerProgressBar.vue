<script setup lang="ts">
  import { computed, ref } from "vue";
  import { usePlayerStore } from "~/stores/player";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";

  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  // ドラッグ状態の管理（再生制御用）
  const isDragging = ref(false);
  const wasPlayingBeforeDrag = ref(false);
  const dragTimeout = ref<NodeJS.Timeout | null>(null);

  // 現在の楽曲情報
  const currentTrack = computed(() => queueStore.nowPlaying);

  // ドラッグ中の表示値管理
  const dragProgressValue = ref(0);

  // 楽曲範囲での進行状況計算 (0-1000)
  const trackProgress = computed(() => {
    if (!currentTrack.value || !playerStore.duration) return 0;

    const startTime = currentTrack.value.start_at || 0;
    const endTime = currentTrack.value.end_at || playerStore.duration;
    const trackDuration = endTime - startTime;
    const currentProgress = Math.max(0, playerStore.currentTime - startTime);

    return trackDuration > 0
      ? Math.min(1000, (currentProgress / trackDuration) * 1000)
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
    // ドラッグ中は表示値を更新するのみ（シークはしない）
    dragProgressValue.value = parseFloat(input.value);
  };

  // ドラッグ終了処理
  const handleDragEnd = () => {
    if (!isDragging.value) return;

    // ここでシークを実行
    const progressRatio = dragProgressValue.value / 1000;
    const startTime = currentTrack.value?.start_at || 0;
    const endTime = currentTrack.value?.end_at || playerStore.duration;
    const trackDuration = endTime - startTime;
    const seekTime = startTime + trackDuration * progressRatio;
    
    playerStore.seek(seekTime);

    if (wasPlayingBeforeDrag.value) {
      playerStore.play();
    }

    // イベントリスナーを削除
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchend", handleDragEnd);

    // 状態の更新を少し遅らせて、currentTimeの更新を待つ
    // これにより視覚的な「戻り」を防ぐ
    dragTimeout.value = setTimeout(() => {
      isDragging.value = false;
      dragTimeout.value = null;
    }, 500);
  };

  // ドラッグ開始時にグローバルイベントリスナーを追加
  const onProgressDragStart = () => {
    // 既存のタイムアウトがあればクリア
    if (dragTimeout.value) {
      clearTimeout(dragTimeout.value);
      dragTimeout.value = null;
    }

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
  <div class="w-full h-2 group relative">
    <!-- プログレスバーの背景 -->
    <div class="absolute inset-0 w-full h-full bg-gray-700 overflow-hidden">
      <!-- 進行状況バー -->
      <div
        class="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-75 ease-linear"
        :style="{ width: `${displayProgressValue / 10}%` }"
      ></div>
    </div>

    <!-- レンジ入力（透明・オーバーレイ） -->
    <input
      type="range"
      min="0"
      max="1000"
      step="1"
      :value="displayProgressValue"
      class="progress-range-slider"
      :disabled="!currentTrack"
      @input="onProgressChange"
      @mousedown="onProgressDragStart"
      @touchstart="onProgressDragStart"
    />
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
    z-index: 10;
    margin: 0;
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
    background: #3b82f6; /* blue-500 */
    border-radius: 50%;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s ease, transform 0.1s ease;
    transform: scale(1);
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
    background: #3b82f6;
    border-radius: 50%;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s ease, transform 0.1s ease;
    transform: scale(1);
    border: none; /* Firefox specific reset */
  }

  /* ホバー時のサムネイル表示 */
  .group:hover .progress-range-slider::-webkit-slider-thumb,
  .progress-range-slider:active::-webkit-slider-thumb {
    opacity: 1;
    transform: scale(1.2);
  }

  .group:hover .progress-range-slider::-moz-range-thumb,
  .progress-range-slider:active::-moz-range-thumb {
    opacity: 1;
    transform: scale(1.2);
  }

  /* モバイル対応 */
  @media (max-width: 767px) {
    /* タッチエリアを上下に拡張 */
    .progress-range-slider {
      height: 24px;
      top: -8px; /* 中心を合わせる */
    }
    
    /* モバイルでは常にサムネイルを表示しない（または操作時のみなど、要件によるが今回はデスクトップ同様ホバー/アクティブで制御） */
    /* ただし、タッチデバイスではhoverがないため、activeが重要 */
  }
</style>
