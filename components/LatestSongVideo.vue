<template>
  <section class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-4">
      <h2 class="text-xl font-bold flex items-center">🎤 最新の歌ってみた</h2>
    </div>

    <div v-if="video" class="p-4">
      <!-- YouTube埋め込みプレイヤー -->
      <div class="relative">
        <iframe
          v-if="getYouTubeEmbedUrl(video)"
          :src="getYouTubeEmbedUrl(video)"
          class="w-full aspect-video rounded-lg"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          title="YouTube video player"
        ></iframe>
        <div
          v-else
          class="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center"
        >
          <p class="text-gray-500">プレイヤーを読み込めませんでした</p>
        </div>
      </div>

      <!-- 動画情報とリンク -->
      <div class="mt-4 space-y-2">
        <h3
          class="font-semibold text-gray-800 line-clamp-2 hover:text-purple-600 transition-colors"
        >
          {{ video?.title || "" }}
        </h3>
        <p class="text-sm text-gray-500">
          {{ video?.published_at ? formatDate(video.published_at) : "" }}
        </p>
      </div>
    </div>

    <div v-else class="p-4 text-center text-gray-500">
      <p>歌ってみた動画が見つかりませんでした</p>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { Video } from "~/types/video";
  import { getYouTubeEmbedUrl, formatDate } from "~/utils/video";

  interface Props {
    video: Video | null;
  }

  defineProps<Props>();
</script>
