<template>
  <div class="container mx-auto px-4 py-8 pb-32">
    <!-- ローディング状態 -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
        role="status"
        aria-label="読み込み中"
      />
    </div>

    <!-- エラー状態 -->
    <div
      v-else-if="error || !song"
      class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto"
    >
      <h2 class="text-xl font-bold text-red-800 mb-2">
        楽曲が見つかりませんでした
      </h2>
      <p class="text-red-600 mb-4">
        {{ error || "指定されたIDの楽曲は存在しません" }}
      </p>
      <NuxtLink
        to="/songs"
        class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        楽曲一覧に戻る
      </NuxtLink>
    </div>

    <!-- 楽曲詳細 -->
    <div v-else class="max-w-4xl mx-auto">
      <!-- パンくずリスト -->
      <!-- 戻るボタン -->
      <button
        @click="handleGoBack"
        class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
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
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        戻る
      </button>
      <!-- 楽曲情報カード -->
      <div
        class="bg-white rounded-lg shadow-lg overflow-hidden mb-6 border border-gray-300"
      >
        <div class="md:flex">
          <!-- サムネイル（320x180に最適化） -->
          <div class="md:flex-shrink-0 md:border-r md:border-gray-200">
            <div
              class="relative bg-gray-900 h-45 md:h-auto md:w-80 flex items-center justify-center border-b md:border-b-0 border-gray-200"
            >
              <img
                v-if="song.video?.thumbnail_path"
                :src="song.video.thumbnail_path"
                :alt="song.title"
                class="max-w-full max-h-full object-contain"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-gray-400 text-6xl"
              >
                <FontAwesomeIcon :icon="['fad', 'music-note']" />
              </div>
            </div>
          </div>

          <!-- 楽曲情報 -->
          <div class="p-6 flex-1">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {{ song.title }}
                </h1>
                <p class="text-lg text-gray-600 mb-3">{{ song.artist }}</p>
                <div class="flex items-center flex-wrap gap-2">
                  <span
                    v-if="song.is_original"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    オリジナル曲
                  </span>
                  <span
                    v-if="song.video?.is_stream"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                  >
                    歌枠配信
                  </span>
                  <span
                    v-else-if="song.video"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                  >
                    歌動画
                  </span>
                </div>
              </div>
            </div>

            <!-- アクションボタン -->
            <div class="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-6">
              <button
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                :disabled="!song.video"
                @click="playNow"
              >
                <svg
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clip-rule="evenodd"
                  />
                </svg>
                今すぐ再生
              </button>
              <button
                class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                :disabled="!song.video"
                @click="addToQueue"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                キューに追加
              </button>
              <a
                v-if="youtubeUrl"
                :href="youtubeUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 whitespace-nowrap"
                @click="handleYouTubeClick"
              >
                <svg
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  />
                </svg>
                YouTubeで開く
              </a>
            </div>

            <!-- パーマリンク -->
            <div class="border-t pt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                パーマリンク
              </label>
              <div class="flex gap-2">
                <input
                  :value="permalink"
                  readonly
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  @click="selectPermalink"
                />
                <button
                  class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  @click="copyPermalink"
                >
                  {{ copied ? "コピー済み!" : "コピー" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 動画情報 -->
      <div
        v-if="song.video"
        class="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-300"
      >
        <h2 class="text-xl font-bold text-gray-900 mb-4">動画情報</h2>
        <dl class="space-y-3">
          <div class="flex flex-col sm:flex-row">
            <dt class="font-medium text-gray-700 sm:w-32">動画タイトル:</dt>
            <dd class="text-gray-900">{{ song.video.title }}</dd>
          </div>
          <div class="flex flex-col sm:flex-row">
            <dt class="font-medium text-gray-700 sm:w-32">投稿日:</dt>
            <dd class="text-gray-900">
              {{ formatDate(song.video.published_at) }}
            </dd>
          </div>
          <div
            v-if="song.start_at !== null && song.start_at !== undefined"
            class="flex flex-col sm:flex-row"
          >
            <dt class="font-medium text-gray-700 sm:w-32">開始時間:</dt>
            <dd class="text-gray-900">{{ formatTime(song.start_at) }}</dd>
          </div>
          <div
            v-if="song.end_at !== null && song.end_at !== undefined"
            class="flex flex-col sm:flex-row"
          >
            <dt class="font-medium text-gray-700 sm:w-32">終了時間:</dt>
            <dd class="text-gray-900">{{ formatTime(song.end_at) }}</dd>
          </div>
          <div class="flex flex-col sm:flex-row">
            <dt class="font-medium text-gray-700 sm:w-32">動画ID:</dt>
            <dd class="text-gray-900 font-mono text-sm">
              {{ song.video.id }}
            </dd>
          </div>
        </dl>
      </div>

      <!-- 動画情報がない場合の注意書き -->
      <div
        v-else
        class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6"
      >
        <h2 class="text-xl font-bold text-yellow-800 mb-2">動画情報なし</h2>
        <p class="text-yellow-700">
          この楽曲には動画情報が関連付けられていません。
        </p>
      </div>

      <!-- 戻るボタン -->
      <div class="flex justify-center">
        <button
          @click="handleGoBack"
          class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          戻る
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Song } from "~/types/song";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";
  import { usePlayerStore } from "~/stores/player";

  // ページ遷移時にトップまでスクロール
  definePageMeta({
    scrollToTop: true,
  });

  const route = useRoute();
  const router = useRouter();
  const songId = route.params.id as string;
  const config = useRuntimeConfig();

  const queue = usePlayerQueue();
  const player = usePlayerStore();
  const analytics = useAnalytics();
  const copied = ref(false);

  // 戻るボタンの処理
  const handleGoBack = () => {
    // ブラウザ履歴があれば前のページに戻る
    if (window.history.length > 1) {
      router.back();
    } else {
      // 履歴がない場合は楽曲一覧に遷移
      router.push("/songs");
    }
  };

  // ページマウント時にトップまでスクロール（mainタグをスクロール）
  onMounted(() => {
    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // SSR対応: useFetchでデータ取得（SEO向上）
  const {
    data: song,
    error: fetchError,
    pending: loading,
  } = await useFetch<Song>(`/api/songs/${songId}`, {
    key: `song-${songId}`,
  });

  console.log("Fetched song data:", song);

  // エラーメッセージの整形
  const error = computed(() => {
    if (fetchError.value) {
      return "楽曲が見つかりませんでした";
    }
    return null;
  });

  // メタデータ設定（SSRで正しく反映）
  useHead(() => {
    if (!song.value) {
      return {
        title: "楽曲が見つかりません | いぬいのうた",
      };
    }

    const siteUrl =
      config.public.siteUrl || "https://inuinouta-front-v3.vercel.app";
    const thumbnailPath = song.value.video?.thumbnail_path || "";
    const description = `${song.value.artist}の「${song.value.title}」を視聴できます。いぬいのうたは戌亥とこさんの楽曲を検索・再生できるファンサイトです。`;

    return {
      title: `${song.value.title} - ${song.value.artist} | いぬいのうた`,
      meta: [
        {
          name: "description",
          content: description,
        },
        // Open Graph
        {
          property: "og:type",
          content: "music.song",
        },
        {
          property: "og:title",
          content: `${song.value.title} - ${song.value.artist}`,
        },
        {
          property: "og:description",
          content: description,
        },
        ...(thumbnailPath
          ? [
              {
                property: "og:image",
                content: thumbnailPath,
              },
            ]
          : []),
        {
          property: "og:url",
          content: `${siteUrl}/songs/${song.value.id}`,
        },
        // Twitter Card
        {
          name: "twitter:card",
          content: "summary",
        },
        {
          name: "twitter:title",
          content: `${song.value.title} - ${song.value.artist}`,
        },
        {
          name: "twitter:description",
          content: description,
        },
        ...(thumbnailPath
          ? [
              {
                name: "twitter:image",
                content: thumbnailPath,
              },
            ]
          : []),
      ],
    };
  });

  // 計算プロパティ
  const youtubeUrl = computed(() => {
    if (!song.value?.video) return "";
    const base = "https://youtube.com/watch?";
    const params = new URLSearchParams({
      v: song.value.video.id,
    });
    if (song.value.start_at !== null && song.value.start_at !== undefined) {
      params.append("t", song.value.start_at.toString());
    }
    return base + params.toString();
  });

  const permalink = computed(() => {
    if (!song.value) return "";
    const siteUrl =
      config.public.siteUrl || "https://inuinouta-front-v3.vercel.app";
    return `${siteUrl}/songs/${song.value.id}`;
  });

  // メソッド
  const playNow = async () => {
    if (!song.value) return;

    // アナリティクス: 楽曲再生を追跡
    analytics.trackSongPlay(song.value);

    player.setUserInteracted(true);
    queue.setQueue([song.value]);
    queue.play(0); // これが内部的にplayCurrentTrack()を呼び出すため、追加の処理は不要
  };

  const addToQueue = () => {
    if (!song.value) return;

    // アナリティクス: キューに追加を追跡
    analytics.trackAddToQueue(song.value);

    queue.addToQueue(song.value);
    // TODO: トースト通知などでユーザーにフィードバックを提供
    console.log("キューに追加しました:", song.value.title);
  };

  const handleYouTubeClick = () => {
    // アナリティクス: YouTubeリンククリックを追跡
    if (song.value?.video) {
      analytics.trackYouTubeClick(
        song.value.id,
        song.value.title,
        song.value.video.id
      );
    }
  };

  const selectPermalink = (event: Event) => {
    const input = event.target as HTMLInputElement;
    input.select();
  };

  const copyPermalink = async () => {
    if (!permalink.value) return;

    try {
      await navigator.clipboard.writeText(permalink.value);
      copied.value = true;

      // アナリティクス: パーマリンクコピーを追跡
      if (song.value) {
        analytics.trackPermalinkCopy(song.value.id, song.value.title);
      }

      setTimeout(() => {
        copied.value = false;
      }, 2000);
    } catch (err) {
      console.error("パーマリンクのコピーに失敗:", err);
      // フォールバック: 古いブラウザ対応
      try {
        const input = document.querySelector(
          "input[readonly]"
        ) as HTMLInputElement;
        if (input) {
          input.select();
          document.execCommand("copy");
          copied.value = true;

          // アナリティクス: パーマリンクコピーを追跡
          if (song.value) {
            analytics.trackPermalinkCopy(song.value.id, song.value.title);
          }

          setTimeout(() => {
            copied.value = false;
          }, 2000);
        }
      } catch (fallbackErr) {
        console.error("フォールバックコピーも失敗:", fallbackErr);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, "0")}`;
    }
  };
</script>
