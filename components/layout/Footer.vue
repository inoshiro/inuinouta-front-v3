<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { usePlayerStore } from "~/stores/player";

const player = usePlayerStore();

const progress = computed(() =>
  player.currentTrack && player.currentTrack.duration > 0
    ? (player.currentTrack.start_at ?? 0) / player.currentTrack.duration
    : 0
);
const indicatorPosition = computed(() => `${progress.value * 100}%`);

// ドラッグ操作用
const isDragging = ref(false);
const barRef = ref(null);

const setCurrentByClientX = (clientX) => {
  const bar = barRef.value;
  if (!bar || !player.currentTrack) return;
  const rect = bar.getBoundingClientRect();
  let x = clientX - rect.left;
  x = Math.max(0, Math.min(x, rect.width));
  const ratio = x / rect.width;
  const newTime = Math.round(player.currentTrack.duration * ratio);
  player.setCurrentTime(newTime);
};

const onBarClick = (e) => {
  setCurrentByClientX(e.clientX);
};
const onTouchBar = (e) => {
  if (e.touches && e.touches.length > 0)
    setCurrentByClientX(e.touches[0].clientX);
};

const onDragStart = () => {
  isDragging.value = true;
  document.body.style.userSelect = "none";
};
const onDragMove = (e) => {
  if (!isDragging.value) return;
  if (e instanceof MouseEvent) setCurrentByClientX(e.clientX);
  else if (e.touches && e.touches.length > 0)
    setCurrentByClientX(e.touches[0].clientX);
};
const onDragEnd = () => {
  isDragging.value = false;
  document.body.style.userSelect = "";
};

onMounted(() => {
  window.addEventListener("mousemove", onDragMove);
  window.addEventListener("touchmove", onDragMove);
  window.addEventListener("mouseup", onDragEnd);
  window.addEventListener("touchend", onDragEnd);
});
onUnmounted(() => {
  window.removeEventListener("mousemove", onDragMove);
  window.removeEventListener("touchmove", onDragMove);
  window.removeEventListener("mouseup", onDragEnd);
  window.removeEventListener("touchend", onDragEnd);
});

const play = () => player.play();
const pause = () => player.pause();
</script>

<template>
  <footer
    class="bg-gray-900 text-white fixed bottom-0 inset-x-0 z-60 shadow-lg"
  >
    <!-- プログレスバー（ドラッグ対応） -->
    <div
      ref="barRef"
      class="relative w-full h-1 bg-gray-700 cursor-pointer select-none"
      @click="onBarClick"
      @touchstart="onTouchBar"
    >
      <div
        class="absolute top-0 left-0 h-1 bg-blue-400 transition-all duration-200"
        :style="{ width: progress * 100 + '%' }"
      />
      <div
        class="absolute top-1/2 left-0"
        :style="{ left: indicatorPosition, transform: 'translate(-50%, -50%)' }"
      >
        <div
          class="w-3 h-3 bg-blue-400 border-2 border-white rounded-full shadow cursor-pointer"
          @mousedown.stop.prevent="onDragStart"
          @touchstart.stop.prevent="onDragStart"
        />
      </div>
    </div>
    <!-- 下部：曲情報・時間・コントロールを横並びで -->
    <div class="flex items-center justify-between px-4 py-2 gap-4">
      <!-- 曲情報 -->
      <div class="flex items-center min-w-0">
        <span class="font-semibold truncate">
          {{ player.currentTrack ? player.currentTrack.title : "---" }}
        </span>
        <span class="text-xs text-gray-400 ml-2 truncate">
          {{ player.currentTrack ? player.currentTrack.artist : "" }}
        </span>
      </div>
      <!-- 時間 -->
      <div class="flex items-center gap-1 text-xs text-gray-200">
        <span>
          <template v-if="player.currentTrack">
            {{ Math.floor((player.currentTrack.start_at ?? 0) / 60) }}:{{
              ((player.currentTrack.start_at ?? 0) % 60)
                .toString()
                .padStart(2, "0")
            }}
          </template>
          <template v-else> --:-- </template>
        </span>
        <span class="mx-1">/</span>
        <span>
          <template v-if="player.currentTrack">
            {{ Math.floor(player.currentTrack.duration / 60) }}:{{
              (player.currentTrack.duration % 60).toString().padStart(2, "0")
            }}
          </template>
          <template v-else> --:-- </template>
        </span>
      </div>
      <!-- コントロールボタン -->
      <div class="flex gap-2">
        <button
          aria-label="前へ"
          class="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded"
        >
          <span aria-hidden="true">⏮️</span>
        </button>
        <button
          aria-label="再生"
          class="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded"
          @click="play"
        >
          <span aria-hidden="true">▶️</span>
        </button>
        <button
          aria-label="一時停止"
          class="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded"
          @click="pause"
        >
          <span aria-hidden="true">⏸️</span>
        </button>
        <button
          aria-label="次へ"
          class="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded"
        >
          <span aria-hidden="true">⏭️</span>
        </button>
      </div>
    </div>
  </footer>
</template>
