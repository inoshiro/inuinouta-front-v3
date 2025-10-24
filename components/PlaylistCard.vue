<script setup lang="ts">
import type { LocalPlaylist } from "~/types/playlist";

interface Props {
  playlist: LocalPlaylist;
  songCount: number;
  thumbnails?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  thumbnails: () => [],
});

// 日付のフォーマット
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// 説明文の省略表示
const truncateDescription = (text: string | undefined, maxLength = 80) => {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};
</script>

<template>
  <NuxtLink
    :to="`/playlists/${playlist.id}`"
    class="block bg-gray-800 hover:bg-gray-700 rounded-lg overflow-hidden transition-colors duration-200"
  >
    <!-- サムネイルグリッド -->
    <div class="aspect-square bg-gray-900 relative">
      <div
        v-if="thumbnails.length > 0"
        class="grid grid-cols-2 grid-rows-2 gap-0.5 h-full"
      >
        <div
          v-for="(thumbnail, index) in thumbnails.slice(0, 4)"
          :key="index"
          class="relative bg-gray-800"
        >
          <img
            :src="thumbnail"
            :alt="`Thumbnail ${index + 1}`"
            class="w-full h-full object-cover"
          />
        </div>
        <!-- サムネイルが4つ未満の場合は空白を埋める -->
        <div
          v-for="index in Math.max(0, 4 - thumbnails.length)"
          :key="`empty-${index}`"
          class="bg-gray-800 flex items-center justify-center"
        >
          <svg
            class="w-8 h-8 text-gray-600"
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
        </div>
      </div>
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-gray-800"
      >
        <svg
          class="w-16 h-16 text-gray-600"
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
      </div>
    </div>

    <!-- プレイリスト情報 -->
    <div class="p-4">
      <h3 class="font-semibold text-lg mb-1 truncate">
        {{ playlist.name }}
      </h3>
      <p
        v-if="playlist.description"
        class="text-sm text-gray-400 mb-2 line-clamp-2"
      >
        {{ truncateDescription(playlist.description) }}
      </p>
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>{{ songCount }}曲</span>
        <span>{{ formatDate(playlist.created_at) }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
