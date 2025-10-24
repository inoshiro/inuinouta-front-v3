<script setup lang="ts">
import { mockPlaylists, getPlaylistSongs } from "~/utils/mockPlaylists";

// ダミーデータを使用
const playlists = ref(mockPlaylists);

// 各プレイリストのサムネイルを取得
const getPlaylistThumbnails = (playlist: any) => {
  const songs = getPlaylistSongs(playlist);
  return songs
    .slice(0, 4)
    .map((song) => song.video.thumbnail_path)
    .filter((url): url is string => !!url);
};
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- ヘッダー -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-3xl font-bold">プレイリスト</h1>
        <button
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center gap-2 transition-colors"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          新規作成
        </button>
      </div>

      <!-- 注意書き -->
      <div
        class="bg-orange-900/30 border border-orange-700 rounded-lg p-4 flex items-start gap-3"
      >
        <svg
          class="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div class="text-sm">
          <p class="text-orange-300 font-semibold mb-1">
            プレイリストはこのブラウザにのみ保存されます
          </p>
          <p class="text-orange-200/80">
            別のデバイスやブラウザでは表示されません。ブラウザのデータを削除すると失われますのでご注意ください。
          </p>
        </div>
      </div>
    </div>

    <!-- プレイリスト一覧 -->
    <div v-if="playlists.length > 0">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <PlaylistCard
          v-for="playlist in playlists"
          :key="playlist.id"
          :playlist="playlist"
          :song-count="playlist.items.length"
          :thumbnails="getPlaylistThumbnails(playlist)"
        />
      </div>
    </div>

    <!-- 空の状態 -->
    <div
      v-else
      class="text-center py-20"
    >
      <svg
        class="w-24 h-24 text-gray-600 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        />
      </svg>
      <h2 class="text-xl font-semibold text-gray-300 mb-2">
        プレイリストがありません
      </h2>
      <p class="text-gray-400 mb-6">
        最初のプレイリストを作成してお気に入りの楽曲をまとめましょう
      </p>
      <button
        class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        プレイリストを作成
      </button>
    </div>
  </div>
</template>
