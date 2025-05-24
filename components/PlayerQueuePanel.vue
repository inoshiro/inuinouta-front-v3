<script setup lang="ts">
import { usePlayerQueue } from "~/stores/usePlayerQueue";

const playerQueue = usePlayerQueue();
</script>

<template>
  <div class="max-w-xl mx-auto p-4 mt-8 bg-white rounded shadow">
    <h2 class="text-lg font-bold mb-2">再生キュー</h2>
    <div v-if="playerQueue.queue.length === 0" class="text-gray-500">
      キューは空です
    </div>
    <ul v-else>
      <li
        v-for="(song, i) in playerQueue.queue"
        :key="song.id"
        class="flex items-center justify-between py-2 border-b"
      >
        <div>
          <span
            :class="{
              'font-bold text-blue-600': i === playerQueue.nowPlayingIndex,
            }"
          >
            {{ song.title }}
          </span>
          <span class="text-xs text-gray-500 ml-2">{{ song.artist }}</span>
        </div>
        <div class="flex gap-2">
          <button
            v-if="i !== playerQueue.nowPlayingIndex"
            class="text-blue-500 hover:underline"
            @click="playerQueue.play(i)"
          >
            再生
          </button>
        </div>
      </li>
    </ul>
    <div class="flex gap-2 mt-4">
      <button
        class="bg-gray-200 px-3 py-1 rounded"
        @click="playerQueue.previous"
        :disabled="!playerQueue.hasPrevious"
      >
        ⏮ 前へ
      </button>
      <button
        class="bg-gray-200 px-3 py-1 rounded"
        @click="playerQueue.next"
        :disabled="!playerQueue.hasNext"
      >
        次へ ⏭
      </button>
      <button
        class="bg-red-200 px-3 py-1 rounded ml-auto"
        @click="playerQueue.clear"
      >
        キューをクリア
      </button>
    </div>
  </div>
</template>
