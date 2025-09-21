<script setup lang="ts">
  import { ref, onMounted, nextTick } from "vue";
  import type { Video, VideoWithSongs } from "~/types/video";

  // ページメタデータの設定
  useSeoMeta({
    title: "いぬいのうた - 戌亥とこさん歌枠まとめサイト",
    description:
      "にじさんじ所属のバーチャルライバー、戌亥とこさんの歌を視聴しやすくまとめた非公式ファンサイトです。",
    ogTitle: "いぬいのうた - 戌亥とこさん歌枠まとめサイト",
    ogDescription:
      "にじさんじ所属のバーチャルライバー、戌亥とこさんの歌を視聴しやすくまとめた非公式ファンサイトです。",
    ogImage: "/og-image.jpg",
  });

  // データ取得用のcomposables
  const { fetchVideos } = useVideos();

  // 最新動画の状態
  const latestSongVideo = ref<Video | null>(null);
  const latestStreamVideo = ref<Video | null>(null);
  const latestStreamWithSongs = ref<VideoWithSongs | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  // 最新データの取得
  const fetchLatestVideos = async () => {
    try {
      loading.value = true;
      error.value = null;

      // 最新の歌ってみた動画（is_stream=false）をサーバー側フィルタで取得
      const songVideos = await fetchVideos({
        "filter{is_stream}": false,
        "filter{is_open}": true,
        "filter{is_member_only}": false,
        ordering: "-published_at",
        per_page: 1,
      });

      if (songVideos.length > 0) {
        latestSongVideo.value = songVideos[0];
      }

      // 最新の歌配信（is_stream=true）をサーバー側フィルタで取得
      const streamVideos = await fetchVideos({
        "filter{is_stream}": true,
        "filter{is_open}": true,
        "filter{is_member_only}": false,
        ordering: "-published_at",
        per_page: 1,
      });

      const streamVideo = streamVideos.length > 0 ? streamVideos[0] : null;
      if (streamVideo) {
        latestStreamVideo.value = streamVideo;

        // 歌配信の詳細データ（楽曲情報付き）を取得
        try {
          // composableのloadingと競合しないよう独立してAPIを呼び出し
          const streamWithSongs = await $fetch<VideoWithSongs>(
            `/api/videos/${streamVideo.id}`
          );
          if (streamWithSongs && streamWithSongs.songs) {
            latestStreamWithSongs.value = streamWithSongs;
          }
        } catch (songError) {
          // エラーは無視して続行
        }
      }
    } catch (err: any) {
      error.value = err.message || "データの取得に失敗しました";
    } finally {
      loading.value = false;
      await nextTick();
    }
  };

  // ページ読み込み時にデータを取得
  onMounted(async () => {
    try {
      await fetchLatestVideos();
    } catch (mountError) {
      loading.value = false;
      error.value = "ページの読み込みに失敗しました";
    }
  });
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-8 pb-32">
    <!-- サイト概要セクション -->
    <section
      class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 md:p-4"
    >
      <div class="text-center space-y-4">
        <p
          class="text-lg md:text-l text-gray-700 leading-relaxed max-w-4xl mx-auto"
        >
          にじさんじ所属のバーチャルライバー、<span
            class="font-semibold text-emerald-500"
            >戌亥とこ</span
          >さんの歌を視聴しやすいようにまとめた非公式ファンサイトです。
        </p>
        <div class="text-sm text-gray-500 pt-2 border-t border-gray-200 mt-3">
          <p>
            本サイトは戌亥とこさん及びANYCOLOR株式会社とは一切関係はありません。
          </p>
        </div>
      </div>
    </section>

    <!-- ローディング表示 -->
    <div v-show="loading" class="text-center py-12">
      <div class="inline-flex items-center space-x-2">
        <div
          class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
        ></div>
        <span class="text-gray-600">最新の動画を読み込み中...</span>
      </div>
    </div>

    <!-- エラー表示 -->
    <div
      v-show="!loading && error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 text-center"
    >
      <p class="text-red-700">{{ error }}</p>
      <button
        @click="fetchLatestVideos"
        class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        再試行
      </button>
    </div>

    <!-- 最新動画セクション -->
    <div v-show="!loading && !error" class="grid md:grid-cols-2 gap-8">
      <!-- 最新歌ってみた動画コンポーネント -->
      <LatestSongVideo :video="latestSongVideo" />

      <!-- 最新歌配信コンポーネント -->
      <LatestStreamVideo
        :video="latestStreamVideo"
        :video-with-songs="latestStreamWithSongs"
      />
    </div>

    <!-- ナビゲーションセクション -->
    <section class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">
        🎵 コンテンツを探す
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NuxtLink
          to="/songs"
          class="group bg-gradient-to-br from-slate-600 to-slate-700 text-white p-6 rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all transform hover:scale-105"
        >
          <div class="text-center space-y-2">
            <div class="text-3xl">🎤</div>
            <h3 class="font-bold text-lg">楽曲一覧</h3>
            <p class="text-sm opacity-90">すべての楽曲を検索・再生</p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/streams"
          class="group bg-gradient-to-br from-slate-500 to-slate-600 text-white p-6 rounded-lg hover:from-slate-600 hover:to-slate-700 transition-all transform hover:scale-105"
        >
          <div class="text-center space-y-2">
            <div class="text-3xl">📺</div>
            <h3 class="font-bold text-lg">配信一覧</h3>
            <p class="text-sm opacity-90">歌配信・動画アーカイブ</p>
          </div>
        </NuxtLink>

        <div class="relative group cursor-not-allowed">
          <div
            class="bg-gradient-to-br from-gray-400 to-gray-500 text-white p-6 rounded-lg opacity-60"
          >
            <div class="text-center space-y-2">
              <div class="text-3xl">📝</div>
              <h3 class="font-bold text-lg">プレイリスト</h3>
              <p class="text-sm opacity-90">お気に入りの楽曲をまとめて</p>
              <div class="mt-3 pt-2 border-t border-gray-300">
                <span
                  class="inline-block bg-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-full"
                >
                  開発中
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
