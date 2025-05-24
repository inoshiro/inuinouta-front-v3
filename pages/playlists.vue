<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import type { Playlist } from "~/types/playlist";
import { useFetch } from "#app";

// プレイリスト一覧取得
const {
  data: playlists,
  pending,
  error,
} = useFetch<Playlist[]>("/api/playlists");
const router = useRouter();

const goToPlaylist = (id: number) => {
  router.push(`/playlists/${id}`);
};
</script>

<template>
  <div class="max-w-2xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">プレイリスト一覧</h1>
    <div v-if="pending">読み込み中...</div>
    <div v-else-if="error">エラーが発生しました</div>
    <ul v-else>
      <li
        v-for="pl in playlists"
        :key="pl.id"
        class="mb-2 flex items-center justify-between bg-white rounded shadow p-3"
      >
        <div>
          <div class="font-semibold">{{ pl.name }}</div>
          <div class="text-xs text-gray-500">{{ pl.songs.length }}曲</div>
        </div>
        <button
          class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          @click="goToPlaylist(pl.id)"
        >
          詳細・再生
        </button>
      </li>
    </ul>
  </div>
</template>
