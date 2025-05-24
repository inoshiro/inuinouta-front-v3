<script setup lang="ts">
import { useRoute } from "vue-router";
import { usePlaylist } from "~/composables/usePlaylist";
import { usePlayerQueue } from "~/stores/usePlayerQueue";

const route = useRoute();
const id = Number(route.params.id);
const { data: playlist, pending, error } = usePlaylist(id);
const playerQueue = usePlayerQueue();

const playPlaylist = () => {
  if (playlist.value) {
    playerQueue.setQueue(playlist.value.songs);
  }
};
const addSongToQueue = (song) => {
  playerQueue.addToQueue(song);
};
</script>

<template>
  <div class="max-w-2xl mx-auto p-4">
    <div v-if="pending">読み込み中...</div>
    <div v-else-if="error">エラーが発生しました</div>
    <div v-else-if="playlist">
      <h2 class="text-xl font-bold mb-2">{{ playlist.name }}</h2>
      <button
        class="mb-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        @click="playPlaylist"
      >
        このプレイリストを再生
      </button>
      <ul>
        <li
          v-for="song in playlist.songs"
          :key="song.id"
          class="flex items-center justify-between border-b py-2"
        >
          <div>
            <span class="font-semibold">{{ song.title }}</span>
            <span class="text-xs text-gray-500 ml-2">{{ song.artist }}</span>
          </div>
          <button
            class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
            @click="addSongToQueue(song)"
          >
            キューに追加
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
