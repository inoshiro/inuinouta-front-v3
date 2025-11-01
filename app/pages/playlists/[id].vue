<script setup lang="ts">
  import type { Song } from "~/types/song";
  import {
    SONG_ROW_STYLES,
    songRowUtils,
    SONG_ROW_ICONS,
  } from "~/constants/songRowStyles";
  import { VueDraggableNext } from "vue-draggable-next";

  // Meta設定
  definePageMeta({
    keepalive: true, // ページの状態を保持
  });

  const route = useRoute();
  const router = useRouter();

  const {
    getPlaylistWithSongs,
    removeSongFromPlaylist,
    reorderPlaylistItems,
    deletePlaylist,
    loading,
    error,
  } = useLocalPlaylist();
  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();
  const toast = useToast();
  const analytics = useAnalytics();

  // プレイリストIDを取得
  const playlistId = route.params.id as string;

  // プレイリストと楽曲を取得
  const playlistData = ref<{ playlist: any; songs: Song[] } | null>(null);

  // プレイリストデータを読み込む関数
  const loadPlaylistData = async () => {
    try {
      playlistData.value = await getPlaylistWithSongs(playlistId);

      if (!playlistData.value) {
        throw createError({
          statusCode: 404,
          message: "プレイリストが見つかりません",
        });
      }
    } catch (e) {
      console.error("Failed to load playlist:", e);
      throw createError({
        statusCode: 404,
        message: "プレイリストが見つかりません",
      });
    }
  };

  // 初回読み込み
  onMounted(async () => {
    await loadPlaylistData();
  });

  // keepaliveでページが再度アクティブになったときにデータを再読み込み
  onActivated(async () => {
    await loadPlaylistData();
  });

  const playlist = computed(() => playlistData.value?.playlist);
  const songs = computed(() => playlistData.value?.songs || []);

  // ドラッグ中の楽曲リスト（ローカル状態）
  const draggableSongs = ref<Song[]>([]);

  // songsが変更されたときにdraggableSongsを更新
  watch(
    songs,
    (newSongs) => {
      draggableSongs.value = [...newSongs];
    },
    { immediate: true }
  );

  // ドラッグアンドドロップ完了時の処理
  const handleDragEnd = async () => {
    if (!playlist.value) return;

    // 元の順番と新しい順番を比較
    const oldOrder = songs.value.map((s) => s.id);
    const newOrder = draggableSongs.value.map((s) => s.id);

    // 順番が変わっていない場合は何もしない
    if (JSON.stringify(oldOrder) === JSON.stringify(newOrder)) {
      return;
    }

    try {
      // 変更された曲のインデックスを見つける
      const fromIndex = oldOrder.findIndex(
        (id, index) => id !== newOrder[index]
      );
      if (fromIndex === -1) return;

      const songId = newOrder[fromIndex];
      if (songId === undefined) return;

      const toIndex = newOrder.indexOf(songId);
      if (toIndex === -1) return;

      await reorderPlaylistItems(playlistId, fromIndex, toIndex);
      // データを再読み込み
      await loadPlaylistData();
      toast.success("曲順を変更しました");
    } catch (e) {
      console.error("Failed to reorder songs:", e);
      toast.error("曲順の変更に失敗しました");
      // エラーが発生した場合は元に戻す
      draggableSongs.value = [...songs.value];
    }
  };

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 合計再生時間を計算
  const totalDuration = computed(() => {
    const totalSeconds = songs.value.reduce((sum, song) => {
      const duration = (song.end_at || 0) - (song.start_at || 0);
      return sum + duration;
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    }
    return `${minutes}分`;
  });

  // 楽曲をクリックしたときの処理（今すぐ再生）
  const handlePlaySong = (song: Song) => {
    // アナリティクス: プレイリストから楽曲再生を追跡
    analytics.trackSongPlay(song);
    analytics.trackPlaylistAction(
      "play",
      playlistId,
      playlist.value?.name,
      song.id,
      song.title
    );

    // ユーザーインタラクション記録
    playerStore.setUserInteracted(true);

    // 新しいキューとして設定して即座に再生
    // オブジェクトを複製して参照共有を防ぐ
    queueStore.setQueue([{ ...song }]);
    queueStore.play(0); // これが内部的にplayCurrentTrack()を呼び出すため、player.play()は不要
  };

  // キューに追加
  const handleAddToQueue = (song: Song) => {
    // アナリティクス: キューに追加を追跡
    analytics.trackAddToQueue(song);

    queueStore.addToQueue(song);
  };

  // 楽曲を削除
  const handleRemoveSong = async (song: Song) => {
    if (!playlist.value) return;

    if (!confirm(`「${song.title}」をプレイリストから削除しますか？`)) {
      return;
    }

    try {
      // プレイリストアイテムを見つける
      const item = playlist.value.items.find(
        (item: any) => item.song_id === song.id
      );
      if (!item) return;

      await removeSongFromPlaylist(playlistId, item.id);

      // データを再読み込み
      await loadPlaylistData();
    } catch (e) {
      console.error("Failed to remove song:", e);
      toast.error("楽曲の削除に失敗しました");
    }
  };

  // 全曲再生
  const handlePlayAll = () => {
    if (songs.value.length === 0) {
      return;
    }

    // アナリティクス: プレイリスト全曲再生を追跡
    analytics.trackPlaylistAction("play", playlistId, playlist.value?.name);

    // ユーザーインタラクション記録
    playerStore.setUserInteracted(true);

    // プレイリストの全曲をキューに設定して最初から再生
    // 配列を複製してオブジェクトの参照共有を防ぐ
    queueStore.setQueue([...songs.value]);
    queueStore.play(0); // これが内部的にplayCurrentTrack()を呼び出すため、player.play()は不要
  };

  // プレイリスト編集モーダル
  const showEditModal = ref(false);

  const handleEdit = () => {
    showEditModal.value = true;
  };

  const handlePlaylistUpdated = async () => {
    showEditModal.value = false;
    // データを再読み込み
    await loadPlaylistData();
  };

  // プレイリスト削除
  const handleDelete = async () => {
    if (!playlist.value) return;

    if (confirm(`「${playlist.value.name}」を削除しますか？`)) {
      try {
        await deletePlaylist(playlistId);

        // アナリティクス: プレイリスト削除を追跡
        analytics.trackPlaylistAction(
          "delete",
          playlistId,
          playlist.value?.name
        );

        toast.success("プレイリストを削除しました");
        router.push("/playlists");
      } catch (e) {
        console.error("Failed to delete playlist:", e);
        toast.error("プレイリストの削除に失敗しました");
      }
    }
  };
</script>

<template>
  <div v-if="loading" class="container mx-auto px-4 py-8 max-w-6xl text-center">
    <div
      class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
    ></div>
    <p class="mt-4 text-gray-600">読み込み中...</p>
  </div>

  <div v-else-if="error" class="container mx-auto px-4 py-8 max-w-6xl">
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center gap-2 text-red-800">
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
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>{{ error }}</p>
      </div>
    </div>
  </div>

  <div v-else-if="playlist" class="container mx-auto px-4 py-8 pb-32 max-w-6xl">
    <!-- 戻るボタン -->
    <NuxtLink
      to="/playlists"
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
      プレイリスト一覧に戻る
    </NuxtLink>

    <!-- プレイリスト情報 -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <!-- タイトルとボタン -->
      <div
        class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3"
      >
        <h1 class="text-3xl font-bold text-gray-900">
          {{ playlist.name }}
        </h1>
        <div class="flex items-center gap-2 sm:shrink-0">
          <button
            @click="handleEdit"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            title="編集"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            @click="handleDelete"
            class="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
            title="削除"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 説明 -->
      <p v-if="playlist.description" class="text-gray-600 mb-3">
        {{ playlist.description }}
      </p>

      <!-- メタ情報 -->
      <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span>{{ songs.length }}曲</span>
        <span>/</span>
        <span>{{ totalDuration }}</span>
        <span>/</span>
        <span>{{ formatDate(playlist.created_at) }}作成</span>
      </div>

      <!-- 全曲再生ボタン -->
      <button
        @click="handlePlayAll"
        class="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        全曲再生
      </button>
    </div>

    <!-- 楽曲リスト -->
    <div
      class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <VueDraggableNext
        v-if="songs.length > 0"
        v-model="draggableSongs"
        :class="SONG_ROW_STYLES.divider"
        @end="handleDragEnd"
        handle=".drag-handle"
        animation="150"
        ghost-class="opacity-50"
        chosen-class="shadow-lg"
      >
        <div
          v-for="(song, index) in draggableSongs"
          :key="song.id"
          :class="SONG_ROW_STYLES.container.playlist"
        >
          <!-- ドラッグハンドル -->
          <div
            class="drag-handle flex items-center justify-center w-8 md:w-10 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
            title="ドラッグして並び替え"
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
                d="M4 8h16M4 16h16"
              />
            </svg>
          </div>

          <!-- 番号（デスクトップのみ表示） -->
          <div :class="SONG_ROW_STYLES.index.wrapper" class="hidden md:flex">
            {{ index + 1 }}
          </div>

          <!-- サムネイル -->
          <div
            :class="SONG_ROW_STYLES.thumbnail.wrapperDesktop"
            @click="handlePlaySong(song)"
          >
            <div :class="SONG_ROW_STYLES.thumbnail.container">
              <img
                :src="song.video.thumbnail_path"
                :alt="song.title"
                :class="SONG_ROW_STYLES.thumbnail.image"
                loading="lazy"
              />
            </div>
          </div>

          <!-- 楽曲情報 -->
          <div
            :class="SONG_ROW_STYLES.info.wrapperDesktop"
            @click="handlePlaySong(song)"
          >
            <div :class="SONG_ROW_STYLES.info.titleContainer">
              <h3 :class="SONG_ROW_STYLES.info.titleDesktop">
                {{ song.title }}
              </h3>
              <span v-if="song.is_original" :class="SONG_ROW_STYLES.info.badge">
                オリジナル
              </span>
            </div>
            <p :class="SONG_ROW_STYLES.info.artistDesktop">{{ song.artist }}</p>
          </div>

          <!-- アクションボタン -->
          <div :class="SONG_ROW_STYLES.actions.wrapperVisible">
            <button
              @click.stop="handleAddToQueue(song)"
              :class="SONG_ROW_STYLES.actions.button.queue"
              title="キューに追加"
            >
              <svg
                :class="SONG_ROW_STYLES.actions.icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="SONG_ROW_ICONS.queue"
                />
              </svg>
            </button>
            <button
              @click.stop="handleRemoveSong(song)"
              :class="SONG_ROW_STYLES.actions.button.remove"
              title="削除"
            >
              <svg
                :class="SONG_ROW_STYLES.actions.icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="SONG_ROW_ICONS.remove"
                />
              </svg>
            </button>
          </div>
        </div>
      </VueDraggableNext>

      <!-- 空の状態 -->
      <div v-if="songs.length === 0" class="text-center py-16">
        <svg
          class="w-16 h-16 text-gray-400 mx-auto mb-4"
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
        <h2 class="text-xl font-semibold text-gray-900 mb-2">
          楽曲がありません
        </h2>
        <p class="text-gray-600">楽曲一覧から楽曲を追加しましょう</p>
      </div>
    </div>

    <!-- プレイリスト編集モーダル -->
    <PlaylistEditModal
      v-if="playlist"
      :is-open="showEditModal"
      :playlist="playlist"
      @close="showEditModal = false"
      @updated="handlePlaylistUpdated"
    />
  </div>
</template>
