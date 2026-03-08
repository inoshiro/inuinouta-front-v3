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
          <div class="flex-shrink-0 w-[4.44rem] h-10">
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
              <span v-else class="text-sm text-gray-400"><FontAwesomeIcon :icon="['fad', 'microphone']" /></span>
            </div>
          </div>

          <!-- 歌枠情報（モバイル） -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-medium text-gray-900 truncate mb-1">
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
                <FontAwesomeIcon :icon="['fad', 'triangle-exclamation']" class="mr-0.5" />再生不可
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
          <div class="flex-shrink-0 w-[6.67rem] h-[3.75rem]">
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
              <span v-else class="text-gray-400"><FontAwesomeIcon :icon="['fad', 'microphone']" /></span>
            </div>
          </div>

          <!-- 歌枠情報（デスクトップ） -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-medium text-gray-900 mb-2">
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
                    <FontAwesomeIcon :icon="['fad', 'triangle-exclamation']" class="mr-0.5" />再生不可
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
      <div v-else-if="streamSongs.length > 0" :class="SONG_ROW_STYLES.divider">
        <div
          v-for="song in streamSongs"
          :key="song.id"
          class="flex items-stretch p-0 min-h-[80px]"
        >
          <!-- 楽曲情報（クリックで再生） -->
          <div
            class="flex-1 min-w-0 cursor-pointer py-4 pl-4"
            @click="handlePlayNow(song)"
          >
            <div :class="SONG_ROW_STYLES.info.titleContainer">
              <h3 :class="SONG_ROW_STYLES.info.titleDesktop">
                {{ song.title }}
              </h3>
              <span v-if="song.is_original" :class="SONG_ROW_STYLES.info.badge">
                オリジナル
              </span>
            </div>
            <p :class="SONG_ROW_STYLES.info.artistDesktop">
              {{ song.artist }}
            </p>
          </div>

          <!-- ボタングループ -->
          <div
            :class="SONG_ROW_STYLES.menuButton.wrapperDesktop"
            class="flex items-center gap-2"
            @click.stop
          >
            <!-- キューに追加ボタン -->
            <button
              @click="handleAddToQueue(song)"
              class="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600 hover:text-green-700"
              :class="{
                'bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700':
                  uiContext.isPlaylistMode,
              }"
              :title="
                uiContext.isPlaylistMode ? 'プレイリストに追加' : 'キューに追加'
              "
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
            </button>
            <!-- コンテキストメニューボタン -->
            <button
              :class="SONG_ROW_STYLES.menuButton.buttonDesktop"
              @click.stop="openMenu(song.id, $event)"
              :aria-label="`${song.title}のメニュー`"
              :title="'メニューを開く'"
            >
              <svg
                :class="SONG_ROW_STYLES.menuButton.iconDesktop"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path :d="SONG_ROW_ICONS.menu" />
              </svg>
            </button>
          </div>

          <!-- コンテキストメニュー（Teleport） -->
          <Teleport to="body">
            <div
              v-if="isMenuOpen(song.id)"
              :style="{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }"
              :class="SONG_ROW_STYLES.contextMenu.container"
              @click.stop
              data-song-menu
            >
              <!-- プレイリストに追加 -->
              <button
                @click="handleMenuAction(() => addToPlaylist(song))"
                :class="SONG_ROW_STYLES.contextMenu.menuItem"
              >
                <svg
                  :class="SONG_ROW_STYLES.contextMenu.iconPurple"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="SONG_ROW_ICONS.playlist"
                  />
                </svg>
                <span>プレイリストに追加</span>
              </button>

              <!-- 楽曲詳細を開く -->
              <NuxtLink
                :to="`/songs/${song.id}`"
                @click="closeMenu"
                :class="SONG_ROW_STYLES.contextMenu.menuItem"
              >
                <svg
                  :class="SONG_ROW_STYLES.contextMenu.iconBlue"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="SONG_ROW_ICONS.info"
                  />
                </svg>
                <span>楽曲詳細を開く</span>
              </NuxtLink>

              <!-- YouTubeで開く -->
              <a
                :href="getStreamYoutubeUrl(song)"
                target="_blank"
                rel="noopener noreferrer"
                @click="closeMenu"
                :class="SONG_ROW_STYLES.contextMenu.menuItem"
              >
                <svg
                  :class="SONG_ROW_STYLES.contextMenu.iconRed"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path :d="SONG_ROW_ICONS.youtube" />
                </svg>
                <span>YouTubeで開く</span>
              </a>
            </div>
          </Teleport>
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

  <!-- プレイリスト追加モーダル -->
  <Teleport to="body">
    <AddToPlaylistModal
      v-if="showPlaylistModal && selectedSong"
      :is-open="showPlaylistModal"
      :song="selectedSong"
      @close="showPlaylistModal = false"
      @added="handlePlaylistAdded"
    />
  </Teleport>
</template>

<script setup lang="ts">
  import { ref, watch } from "vue";
  import { usePlayerStore } from "~/stores/player";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";
  import { useUIContext } from "~/stores/useUIContext";
  import { useLocalPlaylist } from "~/composables/useLocalPlaylist";
  import type { Song } from "~/types/song";
  import {
    SONG_ROW_STYLES,
    songRowUtils,
    SONG_ROW_ICONS,
  } from "~/constants/songRowStyles";
  import {
    useSongRowMenu,
    useSongRowActions,
  } from "~/composables/useSongRowMenu";

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
  const uiContext = useUIContext();
  const { addSongToPlaylist: addSongToPlaylistFn } = useLocalPlaylist();

  // コンテキストメニュー管理（共通化）
  const {
    openMenuId,
    menuPosition,
    showPlaylistModal,
    selectedSong,
    openMenu,
    closeMenu,
    handleMenuAction,
    openPlaylistModal,
    handlePlaylistAdded,
    isMenuOpen,
  } = useSongRowMenu("streamSongMenuId");

  // 楽曲操作（共通化）
  const {
    playNow,
    addToQueue: addToQueueCommon,
    getYoutubeUrl,
  } = useSongRowActions();

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

    // ユーザーインタラクション記録
    playerStore.setUserInteracted(true);

    // 新しいキューとして設定して即座に再生
    queueStore.setQueue([songWithVideo]);
    queueStore.play(0); // これが内部的にplayCurrentTrack()を呼び出すため、player.play()は不要
  };

  // プレイリストに追加（composableのopenPlaylistModalを使用）
  const addToPlaylist = (song: Song) => {
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
    openPlaylistModal(songWithVideo);
  };

  // YouTube URL生成（StreamRow専用：開始時間付き）
  const getStreamYoutubeUrl = (song: Song) => {
    return getYoutubeUrl(props.stream.url, song.start_at);
  };

  // 楽曲をキューに追加（またはプレイリストに追加）
  const handleAddToQueue = async (song: Song) => {
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

    // UIコンテキストに応じて追加先を切り替え
    if (uiContext.isPlaylistMode && uiContext.selectedPlaylistId) {
      console.log("Adding to playlist:", songWithVideo.title);
      try {
        await addSongToPlaylistFn(
          uiContext.selectedPlaylistId,
          songWithVideo.id
        );
      } catch (error) {
        console.error("Failed to add to playlist:", error);
        alert("プレイリストへの追加に失敗しました");
      }
    } else {
      queueStore.addToQueue(songWithVideo);
      
      // トーストで追加を通知
      const toast = useToast();
      toast.success(`「${songWithVideo.title}」をキューに追加しました`);
      
      // プレイリストモードだがプレイリストが選択されていない場合、キュータブに切り替え
      if (uiContext.isPlaylistMode) {
        uiContext.setRightPanelMode("queue");
      }
    }
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
