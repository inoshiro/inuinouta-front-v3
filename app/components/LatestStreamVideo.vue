<template>
  <section class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="bg-gradient-to-r from-slate-500 to-slate-600 text-white p-4">
      <h2 class="text-xl font-bold flex items-center gap-2">
        <FontAwesomeIcon :icon="['fad', 'tv']" class="w-5 h-5" />最新の歌配信
      </h2>
    </div>

    <div v-if="video" class="p-4">
      <!-- YouTube埋め込みプレイヤー -->
      <div class="relative">
        <ClientOnly>
          <div
            v-if="video"
            ref="playerContainerRef"
            class="w-full aspect-video rounded-lg bg-black overflow-hidden"
          ></div>
          <template #fallback>
            <div
              class="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center"
            >
              <p class="text-gray-500">プレイヤーを読み込み中...</p>
            </div>
          </template>
        </ClientOnly>
        <div
          v-if="!video"
          class="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center"
        >
          <p class="text-gray-500">プレイヤーを読み込めませんでした</p>
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
  import { ref, onMounted, nextTick, watch, onBeforeUnmount } from "vue";
  import type { Video, VideoWithSongs } from "~/types/video";
  import {
    getYouTubeEmbedUrl,
    formatDate,
    formatTime,
    extractYouTubeId,
  } from "~/utils/video";

  // YouTube API型定義
  declare global {
    interface Window {
      YT: any;
      onYouTubeIframeAPIReady: () => void;
    }
  }

  interface Props {
    video: Video | null;
    videoWithSongs: VideoWithSongs | null;
  }

  const props = defineProps<Props>();
  const playerContainerRef = ref<HTMLDivElement | null>(null);
  const ytPlayer = ref<any>(null);
  const isPlayerReady = ref(false);
  const isLoading = ref(false);
  const playerId = `youtube-player-${Math.random().toString(36).substr(2, 9)}`;

  // YouTube IFrame APIが読み込まれているかチェック
  const isYouTubeAPIReady = (): boolean => {
    return (
      typeof window !== "undefined" &&
      window.YT &&
      window.YT.Player &&
      typeof window.YT.Player === "function"
    );
  };

  // YouTube IFrame APIを読み込む
  const loadYouTubeAPI = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // 既にAPIが読み込まれている場合
      if (isYouTubeAPIReady()) {
        resolve();
        return;
      }

      // 読み込み中の場合は待機
      if (window.YT && (window.YT as any).loading) {
        const checkInterval = setInterval(() => {
          if (isYouTubeAPIReady()) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);

        // タイムアウト処理
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error("YouTube API loading timeout"));
        }, 10000);
        return;
      }

      // 既存のスクリプトタグをチェック
      const existingScript = document.querySelector(
        'script[src*="youtube.com/iframe_api"]'
      );
      if (existingScript) {
        // 既存のスクリプトがある場合は待機
        const checkInterval = setInterval(() => {
          if (isYouTubeAPIReady()) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error("YouTube API loading timeout"));
        }, 10000);
        return;
      }

      // グローバルコールバックの設定
      const callbacks: (() => void)[] = [];

      if (window.onYouTubeIframeAPIReady) {
        callbacks.push(window.onYouTubeIframeAPIReady);
      }

      callbacks.push(() => resolve());

      window.onYouTubeIframeAPIReady = () => {
        callbacks.forEach((callback) => {
          try {
            callback();
          } catch (error) {
            console.error("YouTube API callback error:", error);
          }
        });
      };

      // APIスクリプトを読み込み
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () =>
        reject(new Error("Failed to load YouTube API script"));

      document.head.appendChild(script);

      // タイムアウト処理
      setTimeout(() => {
        reject(new Error("YouTube API loading timeout"));
      }, 10000);
    });
  };

  // プレイヤーを初期化
  const initializePlayer = async (): Promise<void> => {
    if (isLoading.value) {
      console.log("Player initialization already in progress");
      return;
    }

    if (!props.video?.url) {
      console.log("No video URL provided");
      return;
    }

    try {
      isLoading.value = true;
      console.log("Starting YouTube player initialization");

      // DOM要素の準備を待つ
      await nextTick();

      if (!playerContainerRef.value) {
        console.error("Player container not found");
        return;
      }

      // YouTube APIの読み込みを待つ
      await loadYouTubeAPI();

      const videoId = extractYouTubeId(props.video.url);
      if (!videoId) {
        console.error("Invalid YouTube URL:", props.video.url);
        return;
      }

      console.log("Extracted video ID:", videoId);

      // 既存のプレイヤーをクリーンアップ
      if (ytPlayer.value) {
        try {
          ytPlayer.value.destroy();
        } catch (error) {
          console.warn("Error destroying existing player:", error);
        }
        ytPlayer.value = null;
      }

      // プレイヤーコンテナをクリア
      playerContainerRef.value.innerHTML = "";

      // プレイヤー用のdiv要素を作成
      const playerDiv = document.createElement("div");
      playerDiv.id = playerId;
      playerContainerRef.value.appendChild(playerDiv);

      // 新しいプレイヤーを作成
      ytPlayer.value = new window.YT.Player(playerId, {
        videoId: videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          playsinline: 1,
          controls: 1,
        },
        events: {
          onReady: (event: any) => {
            console.log("YouTube Player ready");
            isPlayerReady.value = true;
          },
          onStateChange: (event: any) => {
            console.log("Player state changed:", event.data);
          },
          onError: (error: any) => {
            console.error("YouTube player error:", error.data);
            isPlayerReady.value = false;
          },
        },
      });

      console.log("YouTube player created successfully");
    } catch (error) {
      console.error("Failed to initialize YouTube player:", error);
      isPlayerReady.value = false;
    } finally {
      isLoading.value = false;
    }
  };

  // 楽曲の開始時間にシークして再生
  const seekToSong = async (startSeconds: number): Promise<void> => {
    if (startSeconds < 0) {
      console.warn("Invalid start time:", startSeconds);
      return;
    }

    if (!ytPlayer.value || !isPlayerReady.value) {
      console.warn("Player not ready for seeking");
      return;
    }

    try {
      console.log("Seeking to:", startSeconds);
      ytPlayer.value.seekTo(startSeconds, true);
      ytPlayer.value.playVideo();
    } catch (error) {
      console.error("Failed to seek to song:", error);
    }
  };

  // プレイヤーのクリーンアップ
  const cleanupPlayer = (): void => {
    if (ytPlayer.value) {
      try {
        ytPlayer.value.destroy();
      } catch (error) {
        console.warn("Error during player cleanup:", error);
      }
      ytPlayer.value = null;
    }
    isPlayerReady.value = false;
  };

  // プロパティの変更を監視
  watch(
    () => props.video?.url,
    (newUrl, oldUrl) => {
      if (newUrl !== oldUrl && newUrl) {
        console.log("Video URL changed, reinitializing player");
        cleanupPlayer();
        initializePlayer();
      }
    }
  );

  onMounted(() => {
    // クライアントサイドでのみ実行
    if (process.client) {
      console.log("LatestStreamVideo component mounted");
      initializePlayer();
    }
  });

  onBeforeUnmount(() => {
    console.log("LatestStreamVideo component unmounting");
    cleanupPlayer();
  });
</script>
