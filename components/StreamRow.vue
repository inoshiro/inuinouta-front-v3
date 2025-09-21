<template>
  <div
    class="stream-row bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-150"
    :class="{ 'hover:bg-gray-50 hover:shadow-md': !isExpanded }"
  >
    <!-- メインの歌枠情報 -->
    <div class="cursor-pointer" @click="toggleExpanded">
      <!-- モバイル表示 -->
      <div class="block md:hidden p-3">
        <div class="flex items-start space-x-3">
          <!-- サムネイル（モバイル） -->
          <div class="flex-shrink-0 w-16 h-12">
            <div
              class="w-full h-full bg-gray-200 rounded border border-gray-300 flex items-center justify-center overflow-hidden"
            >
              <img
                v-if="stream.thumbnail_path"
                :src="stream.thumbnail_path"
                :alt="stream.title"
                class="w-full h-full object-cover"
                loading="lazy"
                @error="handleImageError"
              />
              <span v-else class="text-sm text-gray-400">🎤</span>
            </div>
          </div>

          <!-- 歌枠情報（モバイル） -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-900 truncate mb-1">
                {{ stream.title }}
              </h3>
              <!-- 展開アイコン -->
              <button
                class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                @click.stop="toggleExpanded"
              >
                <svg
                  class="w-4 h-4 transform transition-transform duration-200"
                  :class="{ 'rotate-180': isExpanded }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
            <!-- バッジ（モバイル） -->
            <div class="flex flex-wrap gap-1 mb-2">
              <span
                v-if="stream.is_member_only"
                class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
              >
                メンバー限定
              </span>
              <span
                v-if="!stream.is_open"
                class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
              >
                非公開
              </span>
              <span v-if="stream.unplayable" class="text-xs text-red-500">
                ⚠️ 再生不可
              </span>
            </div>
            <!-- 日時情報（モバイル） -->
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-500">
                {{ formatDate(stream.published_at) }}
                <span
                  v-if="stream.songs_count !== undefined"
                  class="ml-1 text-gray-400"
                >
                  • {{ stream.songs_count }}曲
                </span>
              </div>
              <!-- アクションボタン（モバイル） -->
              <div class="flex items-center space-x-1">
                <!-- YouTube で開く -->
                <a
                  :href="stream.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-150"
                  title="YouTube で開く"
                  @click.stop
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                    />
                  </svg>
                </a>

                <!-- 歌枠全体をキューに追加ボタン -->
                <button
                  class="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors duration-150"
                  :class="{ 'animate-bounce text-green-600': addingToQueue }"
                  :title="getAddAllButtonTitle()"
                  :disabled="addingToQueue"
                  @click.stop="handleAddStreamToQueue"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- デスクトップ表示 -->
      <div class="hidden md:block p-4">
        <div class="flex items-center space-x-4">
          <!-- サムネイル（デスクトップ） -->
          <div class="flex-shrink-0 w-20 h-15">
            <div
              class="w-full h-full bg-gray-200 rounded border border-gray-300 flex items-center justify-center overflow-hidden"
            >
              <img
                v-if="stream.thumbnail_path"
                :src="stream.thumbnail_path"
                :alt="stream.title"
                class="w-full h-full object-cover"
                loading="lazy"
                @error="handleImageError"
              />
              <span v-else class="text-gray-400">🎤</span>
            </div>
          </div>

          <!-- 歌枠情報（デスクトップ） -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ stream.title }}
              </h3>
              <!-- 展開アイコン -->
              <button
                class="ml-4 p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                @click.stop="toggleExpanded"
              >
                <svg
                  class="w-5 h-5 transform transition-transform duration-200"
                  :class="{ 'rotate-180': isExpanded }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            <!-- バッジと情報（デスクトップ） -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <!-- バッジ -->
                <div class="flex flex-wrap gap-2">
                  <span
                    v-if="stream.is_member_only"
                    class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                  >
                    メンバー限定
                  </span>
                  <span
                    v-if="!stream.is_open"
                    class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800"
                  >
                    非公開
                  </span>
                  <span v-if="stream.unplayable" class="text-sm text-red-500">
                    ⚠️ 再生不可
                  </span>
                </div>

                <!-- 日時情報 -->
                <div class="text-sm text-gray-500">
                  {{ formatDate(stream.published_at) }}
                  <span
                    v-if="stream.songs_count !== undefined"
                    class="ml-2 text-gray-400"
                  >
                    • {{ stream.songs_count }}曲
                  </span>
                </div>
              </div>

              <!-- アクションボタン（デスクトップ） -->
              <div class="flex items-center space-x-2">
                <!-- YouTube で開く -->
                <a
                  :href="stream.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-150"
                  title="YouTube で開く"
                  @click.stop
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                    />
                  </svg>
                </a>

                <!-- 歌枠全体をキューに追加ボタン -->
                <button
                  class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors duration-150"
                  :class="{ 'animate-bounce text-green-600': addingToQueue }"
                  :title="getAddAllButtonTitle()"
                  :disabled="addingToQueue"
                  @click.stop="handleAddStreamToQueue"
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 展開された楽曲一覧 -->
    <div v-if="isExpanded" class="border-t border-gray-200 bg-gray-50">
      <!-- ローディング状態 -->
      <div v-if="loadingSongs" class="p-4 text-center">
        <div
          class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"
        ></div>
        <p class="text-sm text-gray-600">楽曲を読み込み中...</p>
      </div>

      <!-- エラー状態 -->
      <div v-else-if="songsError" class="p-4 text-center">
        <p class="text-sm text-red-600 mb-2">{{ songsError }}</p>
        <button
          class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          @click="loadStreamSongs"
        >
          再試行
        </button>
      </div>

      <!-- 楽曲一覧 -->
      <div v-else-if="streamSongs.length > 0" class="divide-y divide-gray-200">
        <div
          v-for="song in streamSongs"
          :key="song.id"
          class="px-4 py-3 hover:bg-white transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <!-- 楽曲情報を横並びに配置 -->
              <div class="flex items-center space-x-2 mb-1">
                <h4 class="text-sm font-medium text-gray-900 truncate">
                  {{ song.title }}
                </h4>
                <span
                  v-if="song.is_original"
                  class="inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium flex-shrink-0"
                  >オリジナル</span
                >
              </div>

              <div class="flex items-center space-x-3 text-xs text-gray-500">
                <span class="truncate">{{ song.artist }}</span>
                <span
                  v-if="song.start_at || song.end_at"
                  class="text-gray-400 flex-shrink-0"
                >
                  <span v-if="song.start_at">{{
                    formatTime(song.start_at)
                  }}</span>
                  <span v-if="song.start_at && song.end_at"> - </span>
                  <span v-if="song.end_at">{{ formatTime(song.end_at) }}</span>
                </span>
              </div>
            </div>

            <div class="flex items-center space-x-1 ml-3">
              <!-- 今すぐ再生ボタン -->
              <button
                class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="今すぐ再生"
                @click="handlePlayNow(song)"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>

              <!-- キューに追加ボタン -->
              <button
                class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                title="キューに追加"
                @click="handleAddToQueue(song)"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 楽曲が見つからない場合 -->
      <div v-else class="p-4 text-center">
        <p class="text-sm text-gray-500">
          <span v-if="stream.songs_count === 0"
            >この歌枠には楽曲が登録されていません</span
          >
          <span v-else>この歌枠の楽曲情報が見つかりませんでした</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from "vue";
  import { usePlayerStore } from "~/stores/player";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";
  import type { Song } from "~/types/song";

  const props = defineProps({
    stream: {
      type: Object,
      required: true,
    },
  });

  // イベントの定義
  defineEmits(["view-songs", "add-stream-to-queue"]);

  // リアクティブデータ
  const isExpanded = ref(false);
  const addingToQueue = ref(false);
  const streamSongs = ref<Song[]>([]);
  const loadingSongs = ref(false);
  const songsError = ref<string | null>(null);

  // ストア
  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  // 展開/折りたたみ切り替え
  const toggleExpanded = async () => {
    isExpanded.value = !isExpanded.value;

    // 初回展開時に楽曲を読み込み
    if (isExpanded.value && streamSongs.value.length === 0) {
      await loadStreamSongs();
    }
  };

  // 歌枠の楽曲を読み込み
  const loadStreamSongs = async () => {
    loadingSongs.value = true;
    songsError.value = null;

    try {
      // 新しいvideo詳細エンドポイントを使用して楽曲データを取得
      const response = await $fetch(`/api/videos/${props.stream.id}`);
      streamSongs.value = response.songs || [];
    } catch (error: any) {
      songsError.value = error.message || "楽曲の読み込みに失敗しました";
      console.error("Failed to load stream songs:", error);
    } finally {
      loadingSongs.value = false;
    }
  };

  // 歌枠全体をキューに追加
  const handleAddStreamToQueue = async () => {
    if (addingToQueue.value) return;

    addingToQueue.value = true;

    try {
      // 楽曲がまだ読み込まれていない場合は読み込む
      if (streamSongs.value.length === 0) {
        await loadStreamSongs();
      }

      if (streamSongs.value.length > 0) {
        // 楽曲をキューに追加（video情報を補完）
        const songsAdded = streamSongs.value.length;
        streamSongs.value.forEach((song) => {
          const songWithVideo = {
            ...song,
            video: {
              id: props.stream.id,
              title: props.stream.title,
              thumbnail_path: props.stream.thumbnail_path,
              url: props.stream.url,
              is_open: props.stream.is_open,
              is_member_only: props.stream.is_member_only,
              is_stream: props.stream.is_stream,
              unplayable: props.stream.unplayable,
              published_at: props.stream.published_at,
            },
            addedFrom: "stream" as const,
          };
          queueStore.addToQueue(songWithVideo);
        });

        // 成功のフィードバック
        console.log(
          `Added ${songsAdded} songs from stream "${props.stream.title}" to queue`
        );

        // フィードバックのための短いアニメーション
        setTimeout(() => {
          addingToQueue.value = false;
        }, 800); // 少し長めに設定して成功感を演出
      } else {
        addingToQueue.value = false;
        const message =
          props.stream.songs_count === 0
            ? "この歌枠には楽曲が登録されていません"
            : "この歌枠の楽曲情報が見つかりませんでした";
        alert(message);
      }
    } catch (error) {
      addingToQueue.value = false;
      console.error("Failed to add stream to queue:", error);
      alert("キューへの追加に失敗しました");
    }
  };

  // 楽曲を今すぐ再生
  const handlePlayNow = (song: Song) => {
    // video情報を補完
    const songWithVideo = {
      ...song,
      video: {
        id: props.stream.id,
        title: props.stream.title,
        thumbnail_path: props.stream.thumbnail_path,
        url: props.stream.url,
        is_open: props.stream.is_open,
        is_member_only: props.stream.is_member_only,
        is_stream: props.stream.is_stream,
        unplayable: props.stream.unplayable,
        published_at: props.stream.published_at,
      },
      addedFrom: "stream" as const,
    };

    queueStore.addToQueue(songWithVideo, true); // toTop = true で最優先で追加

    // プレイヤーで楽曲設定して再生開始
    playerStore.setTrack(songWithVideo);
    playerStore.play();
  };

  // 楽曲をキューに追加
  const handleAddToQueue = (song: Song) => {
    // video情報を補完
    const songWithVideo = {
      ...song,
      video: {
        id: props.stream.id,
        title: props.stream.title,
        thumbnail_path: props.stream.thumbnail_path,
        url: props.stream.url,
        is_open: props.stream.is_open,
        is_member_only: props.stream.is_member_only,
        is_stream: props.stream.is_stream,
        unplayable: props.stream.unplayable,
        published_at: props.stream.published_at,
      },
      addedFrom: "stream" as const,
    };

    queueStore.addToQueue(songWithVideo);
  };

  // ボタンのタイトルを動的に生成
  const getAddAllButtonTitle = () => {
    if (addingToQueue.value) {
      return "キューに追加中...";
    }
    if (
      props.stream.songs_count !== undefined &&
      props.stream.songs_count > 0
    ) {
      return `この歌枠の全楽曲（${props.stream.songs_count}曲）をキューに追加`;
    }
    return "この歌枠の全楽曲をキューに追加";
  };

  // 日時フォーマット関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 時間フォーマット関数（秒を HH:mm:ss 形式に変換）
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 画像読み込みエラーハンドリング
  const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement;
    target.style.display = "none";
  };
</script>

<style scoped>
  /* サムネイルのアスペクト比を16:9に調整 */
  .w-20.h-15 {
    width: 5rem;
    height: 3.75rem; /* 20 * 9/16 = 11.25, 調整して15 */
  }
</style>
