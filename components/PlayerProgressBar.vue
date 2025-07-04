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

  // ドラッグ開始時（再生制御）
  const onProgressDragStart = (event: Event) => {
    if (!currentTrack.value) return;

    isDragging.value = true;
    wasPlayingBeforeDrag.value = playerStore.isPlaying;
    dragProgressValue.value = trackProgress.value;

    // 再生中の場合は一時停止
    if (playerStore.isPlaying) {
      playerStore.pause();
    }

    // ドラッグ終了の検出
    const handleDragEnd = () => {
      isDragging.value = false;

      // ドラッグ前に再生中だった場合は再生を再開
      if (wasPlayingBeforeDrag.value) {
        playerStore.play();
      }

      wasPlayingBeforeDrag.value = false;

      // イベントリスナーを削除
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchend", handleDragEnd);
    };

    // グローバルイベントリスナーを追加
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchend", handleDragEnd);
  };
</script>

<template>
  <!-- プログレスバー（コントロールエリア上端にぴったり配置） -->
  <div class="absolute left-0 w-full h-1 group z-50" style="top: 0px">
    <!-- プログレスバー専用保護領域 -->
    <div
      class="absolute -top-4 left-0 w-full h-8 md:h-6 bg-transparent pointer-events-auto z-50"
    >
      <!-- タッチ判定エリアを広くするための透明レイヤー -->
      <div class="absolute -top-2 left-0 w-full h-6 md:h-4 cursor-pointer z-50">
        <!-- レンジ入力（スタイリング済み） -->
        <input
          type="range"
          min="0"
          max="100"
          :value="displayProgressValue"
          class="progress-range-slider"
          :style="{ '--progress': `${displayProgressValue}%` }"
          :disabled="!currentTrack"
          @input="onProgressChange"
          @mousedown="onProgressDragStart"
          @touchstart="onProgressDragStart"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* プログレスバーのスタイル */
  .progress-range-slider {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    height: 24px; /* モバイル用に高さを広く */
    cursor: pointer;
    background: transparent;
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    border: none;
    transform: translateY(-50%);
    touch-action: none; /* タッチアクションを制御 */
    z-index: 60; /* さらに高いz-indexで確実にイベントを受け取る */
    pointer-events: auto; /* 確実にポインターイベントを受け取る */
    margin-top: 0; /* 中心位置での重なりを実現 */
  }

  /* デスクトップでは元の高さに戻す */
  @media (min-width: 768px) {
    .progress-range-slider {
      height: 4px;
    }
  }

  /* WebKit（Chrome、Safari）用のトラックスタイル */
  .progress-range-slider::-webkit-slider-track {
    width: 100%;
    height: 4px;
    background: #374151; /* gray-700 */
    border: none;
    border-radius: 0;
    margin-top: 0; /* コントロールエリアに密着 */
  }

  /* WebKit用のプログレス部分（進行済み領域） */
  .progress-range-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    background: linear-gradient(
      to right,
      #ef4444 0%,
      #ef4444 var(--progress, 0%),
      #374151 var(--progress, 0%),
      #374151 100%
    );
    border: none;
    border-radius: 0;
    margin-top: 0; /* コントロールエリアに密着 */
  }

  /* WebKit用のサムネイル */
  .progress-range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 20px; /* モバイル用に大きく */
    width: 20px;
    background: #ef4444; /* red-500 */
    border-radius: 50%;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    margin-top: -8px; /* 調整 */
    opacity: 0; /* デフォルトは非表示 */
    transition: opacity 0.2s ease, transform 0.1s ease;
  }

  /* デスクトップでは元のサイズに戻す */
  @media (min-width: 768px) {
    .progress-range-slider::-webkit-slider-thumb {
      height: 12px;
      width: 12px;
      margin-top: -4px;
    }
  }

  /* Firefox用のトラックスタイル */
  .progress-range-slider::-moz-range-track {
    width: 100%;
    height: 4px;
    background: #374151;
    border: none;
    border-radius: 0;
    margin-top: 0; /* コントロールエリアに密着 */
  }

  /* Firefox用のプログレス部分 */
  .progress-range-slider::-moz-range-progress {
    height: 4px;
    background: #ef4444;
    border: none;
    border-radius: 0;
    margin-top: 0; /* コントロールエリアに密着 */
  }

  /* Firefox用のサムネイル */
  .progress-range-slider::-moz-range-thumb {
    height: 20px; /* モバイル用に大きく */
    width: 20px;
    background: #ef4444;
    border-radius: 50%;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    opacity: 0; /* デフォルトは非表示 */
    transition: opacity 0.2s ease, transform 0.1s ease;
  }

  /* デスクトップでは元のサイズに戻す */
  @media (min-width: 768px) {
    .progress-range-slider::-moz-range-thumb {
      height: 12px;
      width: 12px;
    }
  }

  /* ホバー時やドラッグ時のサムネイル表示 */
  .group:hover .progress-range-slider::-webkit-slider-thumb,
  .progress-range-slider:active::-webkit-slider-thumb {
    opacity: 1;
    transform: scale(1.1);
  }

  .group:hover .progress-range-slider::-moz-range-thumb,
  .progress-range-slider:active::-moz-range-thumb {
    opacity: 1;
    transform: scale(1.1);
  }

  /* モバイルではホバーではなくアクティブ時のみ表示 */
  @media (max-width: 767px) {
    /* ホバーでは表示しない */
    .group:hover .progress-range-slider::-webkit-slider-thumb {
      opacity: 0;
    }

    .group:hover .progress-range-slider::-moz-range-thumb {
      opacity: 0;
    }

    /* ドラッグ中（アクティブ）のみ表示 */
    .progress-range-slider:active::-webkit-slider-thumb {
      opacity: 1;
      transform: scale(1.2);
    }

    .progress-range-slider:active::-moz-range-thumb {
      opacity: 1;
      transform: scale(1.2);
    }
  }
</style>
