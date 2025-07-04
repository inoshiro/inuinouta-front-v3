<script setup lang="ts">
  import { computed, ref } from "vue";
  import { usePlayerStore } from "~/stores/player";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";

  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  // ドラッグ状態の管理
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

  // プログレスバー変更（ドラッグ中の再生制御付き）
  const onProgressChange = (event: Event) => {
    if (!currentTrack.value) return;

    const input = event.target as HTMLInputElement;
    const progressRatio = parseFloat(input.value) / 100;

    // ドラッグ中は即座に表示値を更新
    dragProgressValue.value = parseFloat(input.value);

    const startTime = currentTrack.value.start_at || 0;
    const endTime = currentTrack.value.end_at || playerStore.duration;
    const trackDuration = endTime - startTime;

    const seekTime = startTime + trackDuration * progressRatio;
    playerStore.seek(seekTime);
  };

  // ドラッグ開始時
  const onProgressDragStart = () => {
    if (!currentTrack.value) return;

    isDragging.value = true;
    wasPlayingBeforeDrag.value = playerStore.isPlaying;

    // 現在の進行値をドラッグ用の値として初期化
    dragProgressValue.value = trackProgress.value;

    // 再生中の場合は一時停止
    if (playerStore.isPlaying) {
      playerStore.pause();
    }

    // グローバルにmouseupイベントリスナーを追加
    const handleGlobalMouseUp = () => {
      onProgressDragEnd();
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("touchend", handleGlobalMouseUp);
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);
    document.addEventListener("touchend", handleGlobalMouseUp);
  };

  // ドラッグ終了時
  const onProgressDragEnd = () => {
    if (!isDragging.value) return;

    isDragging.value = false;

    // ドラッグ前に再生中だった場合は再生を再開
    if (wasPlayingBeforeDrag.value) {
      playerStore.play();
    }

    wasPlayingBeforeDrag.value = false;
  };
</script>

<template>
  <!-- プログレスバー（最上部ライン） -->
  <div class="absolute top-0 left-0 w-full h-1 group">
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
</template>

<style scoped>
  /* プログレスバーのスタイル */
  .progress-range-slider {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    cursor: pointer;
    background: transparent;
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    border: none;
  }

  /* WebKit（Chrome、Safari）用のトラックスタイル */
  .progress-range-slider::-webkit-slider-track {
    width: 100%;
    height: 4px;
    background: #374151; /* gray-700 */
    border: none;
    border-radius: 0;
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
  }

  /* WebKit用のサムネイル */
  .progress-range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 12px;
    width: 12px;
    background: #ef4444; /* red-500 */
    border-radius: 50%;
    border: none;
    cursor: pointer;
    margin-top: -4px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  /* Firefox用のトラックスタイル */
  .progress-range-slider::-moz-range-track {
    width: 100%;
    height: 4px;
    background: #374151;
    border: none;
    border-radius: 0;
  }

  /* Firefox用のプログレス部分 */
  .progress-range-slider::-moz-range-progress {
    height: 4px;
    background: #ef4444;
    border: none;
    border-radius: 0;
  }

  /* Firefox用のサムネイル */
  .progress-range-slider::-moz-range-thumb {
    height: 12px;
    width: 12px;
    background: #ef4444;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  /* ホバー時のサムネイル表示 */
  .group:hover .progress-range-slider::-webkit-slider-thumb {
    opacity: 1;
  }

  .group:hover .progress-range-slider::-moz-range-thumb {
    opacity: 1;
  }
</style>
