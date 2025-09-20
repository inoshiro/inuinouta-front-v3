<template>
  <section class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4">
      <h2 class="text-xl font-bold flex items-center">📺 最新の歌配信</h2>
    </div>

    <div v-if="video" class="p-4">
      <!-- YouTube埋め込みプレイヤー -->
      <div class="relative">
        <div
          v-if="video"
          ref="playerContainerRef"
          class="w-full aspect-video rounded-lg bg-black"
        ></div>
        <div
          v-else
          class="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center"
        >
          <p class="text-gray-500">プレイヤーを読み込めませんでした</p>
        </div>

        <!-- ライブ配信バッジ -->
        <div
          class="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-medium z-10"
        >
          LIVE
        </div>
      </div>

      <!-- 動画情報とリンク -->
      <div class="mt-4 space-y-2">
        <h3
          class="font-semibold text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors"
        >
          {{ video?.title || "" }}
        </h3>
        <p class="text-sm text-gray-500">
          {{ video?.published_at ? formatDate(video.published_at) : "" }}
        </p>
        <div
          v-if="video?.songs_count"
          class="flex items-center text-sm text-blue-600"
        >
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
            />
          </svg>
          {{ video?.songs_count || 0 }}曲収録
        </div>
      </div>

      <!-- 楽曲リスト -->
      <div
        v-if="
          videoWithSongs &&
          videoWithSongs.songs &&
          videoWithSongs.songs.length > 0
        "
        class="mt-6"
      >
        <div class="space-y-2 max-h-48 overflow-y-auto">
          <button
            v-for="song in (videoWithSongs.songs || []).slice(0, 10)"
            :key="song.id"
            @click.stop="seekToSong(song?.start_at || 0)"
            class="w-full text-left p-2 rounded bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm"
          >
            <div class="flex justify-between items-center">
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate">{{ song.title }}</div>
                <div class="text-xs text-gray-500 truncate">
                  {{ song.artist }}
                </div>
              </div>
              <div class="text-xs text-gray-400 ml-2 flex-shrink-0">
                {{ formatTime(String(song?.start_at || 0)) }}
              </div>
            </div>
          </button>
          <div
            v-if="(videoWithSongs.songs.length || 0) > 10"
            class="text-center pt-2"
          >
            <NuxtLink
              :to="`/streams?video=${video.id}`"
              class="text-sm text-blue-600 hover:text-blue-800"
            >
              他{{ (videoWithSongs.songs.length || 10) - 10 }}曲を見る →
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="p-4 text-center text-gray-500">
      <p>歌配信が見つかりませんでした</p>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from "vue";
  import type { Video, VideoWithSongs } from "~/types/video";
  import {
    getYouTubeEmbedUrl,
    formatDate,
    formatTime,
    extractYouTubeId,
  } from "~/utils/video";

  interface Props {
    video: Video | null;
    videoWithSongs: VideoWithSongs | null;
  }

  const props = defineProps<Props>();
  const playerContainerRef = ref<HTMLDivElement | null>(null);
  const ytPlayer = ref<any>(null);
  const isPlayerReady = ref(false);

  // YouTube IFrame APIが読み込まれているかチェック
  const isYouTubeAPIReady = () => {
    return typeof window !== "undefined" && window.YT && window.YT.Player;
  };

  // YouTube IFrame APIを読み込む
  const loadYouTubeAPI = (): Promise<void> => {
    return new Promise((resolve) => {
      if (isYouTubeAPIReady()) {
        resolve();
        return;
      }

      // グローバルコールバックが既に設定されている場合
      if (window.onYouTubeIframeAPIReady) {
        const originalCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          originalCallback();
          resolve();
        };
        return;
      }

      // APIスクリプトを読み込み
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);

      window.onYouTubeIframeAPIReady = () => {
        resolve();
      };
    });
  };

  // プレイヤーを初期化
  const initializePlayer = async () => {
    if (!props.video || !playerContainerRef.value) return;

    try {
      await loadYouTubeAPI();
      await nextTick();

      const videoId = extractYouTubeId(props.video.url);
      if (!videoId) return;

      // 既存のプレイヤーがあれば破棄
      if (ytPlayer.value) {
        try {
          ytPlayer.value.destroy();
        } catch (e) {
          // エラーは無視
        }
      }

      // 新しいプレイヤーを作成
      ytPlayer.value = new window.YT.Player(playerContainerRef.value, {
        videoId: videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            isPlayerReady.value = true;
          },
          onError: (error: any) => {
            console.error("YouTube player error:", error);
            isPlayerReady.value = false;
          },
        },
      });
    } catch (error) {
      console.error("Failed to initialize YouTube player:", error);
      isPlayerReady.value = false;
    }
  };

  // 楽曲の開始時間にシークして再生
  const seekToSong = async (startSeconds: number) => {
    if (startSeconds < 0) return;

    if (ytPlayer.value && isPlayerReady.value) {
      try {
        ytPlayer.value.seekTo(startSeconds, true);
        ytPlayer.value.playVideo();
      } catch (error) {
        console.error("Failed to seek to song:", error);
      }
    }
  };

  onMounted(() => {
    initializePlayer();
  });
</script>
