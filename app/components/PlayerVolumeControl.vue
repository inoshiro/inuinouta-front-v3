<script setup lang="ts">
  import { computed } from "vue";
  import { usePlayerStore } from "~/stores/player";

  const playerStore = usePlayerStore();

  // 音量関連の状態
  const volume = computed(() => playerStore.volume);
  const isMuted = computed(() => playerStore.isMuted);

  // 音量調整
  const onVolumeChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const newVolume = parseInt(input.value);
    playerStore.setVolume(newVolume);
  };
</script>

<template>
  <!-- 音量コントロール -->
  <div class="flex items-center gap-2 w-24">
    <!-- ミュートボタン -->
    <button
      class="p-2 hover:bg-gray-700 rounded transition-colors opacity-75 hover:opacity-100"
      :title="isMuted ? 'ミュート解除' : 'ミュート'"
      @click="playerStore.toggleMute()"
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
    <div class="flex-1 group flex items-center">
      <input
        type="range"
        min="0"
        max="100"
        :value="volume"
        class="volume-range-slider"
        :style="{ '--progress': `${volume}%` }"
        title="音量"
        @input="onVolumeChange"
      />
    </div>
  </div>
</template>

<style scoped>
  /* 音量バーのスタイル */
  .volume-range-slider {
    width: 100%;
    height: 4px;
    cursor: pointer;
    background: linear-gradient(
      to right,
      #ffffff var(--progress, 0%),
      #374151 var(--progress, 0%)
    );
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    border: none;
    border-radius: 2px;
    vertical-align: middle;
  }

  /* WebKit用のトラックスタイル */
  .volume-range-slider::-webkit-slider-track {
    width: 100%;
    height: 4px;
    background: transparent;
    border: none;
    border-radius: 2px;
  }

  /* WebKit用のサムネイル */
  .volume-range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 12px;
    width: 12px;
    background: #ffffff;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    margin-top: -4px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  /* Firefox用のトラックスタイル */
  .volume-range-slider::-moz-range-track {
    width: 100%;
    height: 4px;
    background: #374151;
    border: none;
    border-radius: 2px;
  }

  /* Firefox用のプログレス部分 */
  .volume-range-slider::-moz-range-progress {
    height: 4px;
    background: #ffffff;
    border: none;
    border-radius: 2px;
  }

  /* Firefox用のサムネイル */
  .volume-range-slider::-moz-range-thumb {
    height: 12px;
    width: 12px;
    background: #ffffff;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  /* 音量バーのホバー時のサムネイル表示 */
  .group:hover .volume-range-slider::-webkit-slider-thumb {
    opacity: 1;
  }

  .group:hover .volume-range-slider::-moz-range-thumb {
    opacity: 1;
  }
</style>
