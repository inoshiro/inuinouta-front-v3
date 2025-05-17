<script setup lang="ts">
  import { ref } from "vue";
  const play = () => {
    // プレイヤーの再生ロジック
  };
  const pause = () => {
    // 一時停止ロジック
  };
  // ダミーの曲情報
  const currentTrack = ref({
    title: "サンプル曲名",
    artist: "サンプルアーティスト",
    duration: 180,
    current: 45,
  });
</script>

<template>
  <footer class="bg-gray-900 text-white p-4 fixed bottom-0 inset-x-0 z-60">
    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-2"
    >
      <!-- 曲情報 -->
      <div class="flex flex-col md:flex-row md:items-center gap-1">
        <span class="font-semibold">{{ currentTrack.title }}</span>
        <span class="text-xs text-gray-400 md:ml-2">{{
          currentTrack.artist
        }}</span>
      </div>
      <!-- 進捗バー -->
      <div class="flex-1 flex items-center gap-2">
        <span class="text-xs"
          >{{ Math.floor(currentTrack.current / 60) }}:{{
            (currentTrack.current % 60).toString().padStart(2, "0")
          }}</span
        >
        <div class="w-full h-2 bg-gray-700 rounded overflow-hidden">
          <div
            class="h-2 bg-blue-400"
            :style="{
              width: (currentTrack.current / currentTrack.duration) * 100 + '%',
            }"
          />
        </div>
        <span class="text-xs"
          >{{ Math.floor(currentTrack.duration / 60) }}:{{
            (currentTrack.duration % 60).toString().padStart(2, "0")
          }}</span
        >
      </div>
      <!-- コントロールボタン -->
      <div class="flex justify-center gap-2">
        <button aria-label="前へ" class="px-3 py-2 bg-gray-700 rounded">
          <span aria-hidden="true">⏮️</span>
        </button>
        <button
          aria-label="再生"
          class="px-3 py-2 bg-gray-700 rounded"
          @click="play"
        >
          <span aria-hidden="true">▶️</span>
        </button>
        <button
          aria-label="一時停止"
          class="px-3 py-2 bg-gray-700 rounded"
          @click="pause"
        >
          <span aria-hidden="true">⏸️</span>
        </button>
        <button aria-label="次へ" class="px-3 py-2 bg-gray-700 rounded">
          <span aria-hidden="true">⏭️</span>
        </button>
      </div>
    </div>
  </footer>
</template>
