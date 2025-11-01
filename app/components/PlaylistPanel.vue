<script setup lang="ts">
  import { ref, computed, watch, onMounted } from "vue";
  import { VueDraggableNext } from "vue-draggable-next";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";
  import { useUIContext } from "~/stores/useUIContext";
  import type { Song } from "~/types/song";
  import type { LocalPlaylist, LocalPlaylistItem } from "~/types/playlist";

  const {
    playlists,
    loading,
    error,
    loadPlaylists,
    createPlaylist: createPlaylistFn,
    deletePlaylist: deletePlaylistFn,
    addSongToPlaylist,
    removeSongFromPlaylist,
    getPlaylistById,
    getPlaylistWithSongs,
    reorderPlaylistItems,
  } = useLocalPlaylist();

  const queueStore = usePlayerQueue();
  const uiContext = useUIContext();
  const toast = useToast();

  // クライアントサイドでマウント済みかどうかを追跡
  const isMounted = ref(false);

  onMounted(async () => {
    isMounted.value = true;
    // プレイリストを読み込む
    await loadPlaylists();
  });

  // プレイリスト一覧表示 or 詳細表示
  const viewMode = ref<"list" | "detail">("list");

  // 選択中のプレイリストの楽曲データ
  const currentPlaylistSongs = ref<Song[]>([]);

  // ドラッグ中の楽曲リスト（ローカル状態）
  const draggableSongs = ref<Song[]>([]);

  // 選択中のプレイリストを取得
  const selectedPlaylist = computed(() => {
    if (!uiContext.selectedPlaylistId) return null;
    return getPlaylistById(uiContext.selectedPlaylistId);
  });

  // プレイリスト選択
  const selectPlaylist = async (playlist: any) => {
    uiContext.selectPlaylist(playlist.id);
    viewMode.value = "detail";

    // 楽曲データを取得
    const result = await getPlaylistWithSongs(playlist.id);
    if (result) {
      currentPlaylistSongs.value = result.songs;
      draggableSongs.value = [...result.songs];
    }
  };

  // 選択中のプレイリストが変更されたら楽曲を再取得
  watch(
    () => selectedPlaylist.value,
    async (newPlaylist) => {
      if (newPlaylist && viewMode.value === "detail") {
        const result = await getPlaylistWithSongs(newPlaylist.id);
        if (result) {
          currentPlaylistSongs.value = result.songs;
          draggableSongs.value = [...result.songs];
        }
      }
    }
  );

  // プレイリストのitemsが更新されたら楽曲を再取得（SongRowからの追加に対応）
  watch(
    () => selectedPlaylist.value?.items,
    async (newItems, oldItems) => {
      // プレイリスト詳細表示中で、itemsの長さが変わった場合
      if (
        selectedPlaylist.value &&
        viewMode.value === "detail" &&
        newItems &&
        (!oldItems || newItems.length !== oldItems.length)
      ) {
        console.log("🔄 Playlist items changed, reloading songs", {
          newLength: newItems.length,
          oldLength: oldItems?.length,
        });
        const result = await getPlaylistWithSongs(selectedPlaylist.value.id);
        if (result) {
          currentPlaylistSongs.value = result.songs;
          draggableSongs.value = [...result.songs];
        }
      }
    },
    { deep: true }
  );

  // 一覧に戻る
  const backToList = () => {
    viewMode.value = "list";
    uiContext.selectPlaylist(null);
    currentPlaylistSongs.value = [];
    draggableSongs.value = [];
  };

  // 新規プレイリスト作成
  const isCreatingPlaylist = ref(false);
  const newPlaylistName = ref("");

  const showCreatePlaylistForm = () => {
    isCreatingPlaylist.value = true;
    newPlaylistName.value = "";
  };

  const cancelCreatePlaylist = () => {
    isCreatingPlaylist.value = false;
    newPlaylistName.value = "";
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.value.trim()) {
      toast.error("プレイリスト名を入力してください");
      return;
    }

    try {
      const newPlaylist = await createPlaylistFn({
        name: newPlaylistName.value.trim(),
      });
      toast.success(`プレイリスト「${newPlaylist.name}」を作成しました`);
      isCreatingPlaylist.value = false;
      newPlaylistName.value = "";
    } catch (e) {
      console.error("Failed to create playlist:", e);
      toast.error("プレイリストの作成に失敗しました");
    }
  };

  // プレイリスト削除
  const deletePlaylist = async (playlistId: string, playlistName: string) => {
    if (confirm(`プレイリスト「${playlistName}」を削除しますか？`)) {
      try {
        await deletePlaylistFn(playlistId);
        toast.success("プレイリストを削除しました");
      } catch (e) {
        console.error("Failed to delete playlist:", e);
        toast.error("プレイリストの削除に失敗しました");
      }
    }
  };

  // プレイリストをキューに追加
  const addPlaylistToQueue = (playlist: any) => {
    const songs = currentPlaylistSongs.value;
    if (songs.length === 0) {
      toast.error("プレイリストに楽曲がありません");
      return;
    }

    songs.forEach((song) => {
      queueStore.addToQueue(song, false);
    });

    toast.success(`${songs.length}曲をキューに追加しました`);
  };

  // ドラッグアンドドロップ完了時の処理
  const handleDragEnd = async () => {
    const playlist = selectedPlaylist.value;
    if (!playlist) return;

    console.log("🎯 Drag end detected in PlaylistPanel");

    // 元の順番と新しい順番を比較
    const oldOrder = currentPlaylistSongs.value.map((s) => s.id);
    const newOrder = draggableSongs.value.map((s) => s.id);

    console.log("📊 Order comparison:", {
      oldOrder,
      newOrder,
      playlistId: playlist.id,
    });

    // 順番が変わっていない場合は何もしない
    if (JSON.stringify(oldOrder) === JSON.stringify(newOrder)) {
      console.log("⏭️ No order change detected, skipping save");
      return;
    }

    try {
      // 新しい順序でのインデックスを計算
      const oldIndex = oldOrder.findIndex((id, idx) => id !== newOrder[idx]);
      const newIndex = newOrder.indexOf(oldOrder[oldIndex]!);

      console.log("🔢 Calculated indices:", { oldIndex, newIndex });

      if (oldIndex !== -1 && newIndex !== -1) {
        await reorderPlaylistItems(playlist.id, oldIndex, newIndex);
        currentPlaylistSongs.value = [...draggableSongs.value];
        toast.success("曲順を変更しました");
      } else {
        console.warn("⚠️ Invalid indices calculated:", { oldIndex, newIndex });
      }
    } catch (e) {
      console.error("❌ Failed to reorder playlist:", e);
      toast.error("曲順の変更に失敗しました");
      // エラーが発生した場合は元に戻す
      draggableSongs.value = [...currentPlaylistSongs.value];
    }
  };

  // 楽曲を削除
  const handleRemoveSong = async (index: number) => {
    const playlist = selectedPlaylist.value;
    if (!playlist) return;

    const song = currentPlaylistSongs.value[index];
    if (!song) return;

    // プレイリストアイテムのIDを取得
    const item = playlist.items[index];
    if (!item) return;

    if (confirm(`「${song.title}」をプレイリストから削除しますか？`)) {
      try {
        await removeSongFromPlaylist(playlist.id, item.id);
        // ローカルの楽曲リストからも削除
        currentPlaylistSongs.value.splice(index, 1);
        draggableSongs.value.splice(index, 1);
        toast.success("楽曲を削除しました");
      } catch (e) {
        console.error("Failed to remove song:", e);
        toast.error("楽曲の削除に失敗しました");
      }
    }
  };

  // 楽曲をキューに追加
  const addSongToQueue = (song: Song) => {
    queueStore.addToQueue(song, false);
    toast.success(`「${song.title}」をキューに追加しました`);
  };

  // 時間のフォーマット
  const formatDuration = (song: Song) => {
    const duration = (song.end_at || 0) - (song.start_at || 0);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // プレイリストの合計時間を計算
  const playlistDuration = computed(() => {
    if (currentPlaylistSongs.value.length === 0) return "";

    const totalSeconds = currentPlaylistSongs.value.reduce((sum, song) => {
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
</script>

<template>
  <div
    class="hidden lg:flex flex-col h-full bg-white border-l border-gray-200 pb-20"
  >
    <!-- プレイリスト一覧表示 -->
    <template v-if="viewMode === 'list'">
      <!-- ヘッダー -->
      <div class="p-4 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-bold text-gray-900">プレイリスト</h2>
            <span
              v-if="playlists.length > 0"
              class="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full"
            >
              {{ playlists.length }}件
            </span>
          </div>
        </div>
      </div>

      <!-- プレイリスト一覧 -->
      <div class="flex-1 overflow-y-auto p-4">
        <template v-if="isMounted">
          <!-- 空の状態 -->
          <div
            v-if="playlists.length === 0 && !isCreatingPlaylist"
            class="flex flex-col items-center justify-center h-full text-center"
          >
            <svg
              class="w-20 h-20 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              プレイリストがありません
            </h3>
            <p class="text-gray-600 text-sm mb-4">
              新しいプレイリストを作成して楽曲を整理しましょう
            </p>
          </div>

          <!-- 新規作成フォーム -->
          <div
            v-if="isCreatingPlaylist"
            class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <h3 class="text-sm font-semibold text-gray-900 mb-2">
              新規プレイリスト
            </h3>
            <input
              v-model="newPlaylistName"
              type="text"
              placeholder="プレイリスト名"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              @keyup.enter="createPlaylist"
              @keyup.escape="cancelCreatePlaylist"
            />
            <div class="flex gap-2">
              <button
                @click="createPlaylist"
                class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                作成
              </button>
              <button
                @click="cancelCreatePlaylist"
                class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>

          <!-- プレイリストリスト -->
          <div class="space-y-2">
            <div
              v-for="playlist in playlists"
              :key="playlist.id"
              class="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer group"
              @click="selectPlaylist(playlist)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <h3
                    class="font-medium text-gray-900 truncate group-hover:text-purple-600 transition-colors"
                  >
                    {{ playlist.name }}
                  </h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs text-gray-500">
                      {{ playlist.items.length }}曲
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-1 ml-2">
                  <button
                    @click.stop="addPlaylistToQueue(playlist)"
                    class="p-2 hover:bg-blue-50 rounded-lg transition-colors text-gray-400 hover:text-blue-600"
                    title="キューに追加"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                  <button
                    @click.stop="deletePlaylist(playlist.id, playlist.name)"
                    class="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-600"
                    title="削除"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- フッター（新規作成ボタン） -->
      <div class="p-4 border-t border-gray-200 bg-gray-50">
        <button
          v-if="!isCreatingPlaylist"
          @click="showCreatePlaylistForm"
          class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 4v16m8-8H4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          新規プレイリスト
        </button>
      </div>
    </template>

    <!-- プレイリスト詳細表示 -->
    <template v-else-if="viewMode === 'detail' && selectedPlaylist">
      <!-- ヘッダー -->
      <div class="p-4 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center gap-3">
          <button
            @click="backToList"
            class="p-1 hover:bg-gray-200 rounded transition-colors shrink-0"
            title="戻る"
          >
            <svg
              class="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 class="text-lg font-bold text-gray-900 truncate">
            {{ selectedPlaylist.name }}
          </h2>
          <span
            class="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full shrink-0"
          >
            {{ selectedPlaylist.items.length }}曲
          </span>
        </div>
      </div>

      <!-- プレイリスト情報 -->
      <div
        v-if="currentPlaylistSongs.length > 0"
        class="px-4 py-3 bg-purple-50 border-b border-purple-100"
      >
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-700">合計時間</span>
          <span class="font-semibold text-purple-900">{{
            playlistDuration
          }}</span>
        </div>
      </div>

      <!-- 楽曲リスト -->
      <div class="flex-1 overflow-y-auto">
        <template v-if="isMounted">
          <!-- 空の状態 -->
          <div
            v-if="currentPlaylistSongs.length === 0"
            class="flex flex-col items-center justify-center h-full text-center p-4"
          >
            <svg
              class="w-20 h-20 text-gray-300 mb-4"
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
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              プレイリストは空です
            </h3>
            <p class="text-gray-600 text-sm">
              楽曲一覧で「+」ボタンを押して追加してください
            </p>
          </div>

          <!-- 楽曲アイテムリスト -->
          <VueDraggableNext
            v-else
            v-model="draggableSongs"
            @end="handleDragEnd"
            handle=".drag-handle"
            animation="200"
            class="p-4 flex flex-col"
          >
            <div
              v-for="(song, index) in draggableSongs"
              :key="`${song.id}-${index}`"
              class="bg-white rounded-lg border shadow-sm hover:shadow-md playlist-song-item w-full"
            >
              <div class="flex items-center gap-2 p-3">
                <!-- ドラッグハンドル -->
                <div
                  class="drag-handle flex items-center justify-center w-8 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors shrink-0"
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

                <!-- 番号 -->
                <div class="w-8 flex items-center justify-center shrink-0">
                  <span class="text-sm text-gray-500">
                    {{ index + 1 }}
                  </span>
                </div>

                <!-- サムネイル -->
                <div
                  class="w-16 h-9 shrink-0 rounded overflow-hidden bg-gray-100"
                >
                  <img
                    v-if="song.video?.thumbnail_path"
                    :src="song.video.thumbnail_path"
                    :alt="song.title"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <!-- 楽曲情報 -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-sm truncate text-gray-900">
                    {{ song.title }}
                  </h3>
                  <div class="flex items-center gap-2 mt-1">
                    <p class="text-xs text-gray-500 truncate">
                      {{ song.artist }}
                    </p>
                    <span class="text-xs text-gray-400">•</span>
                    <span class="text-xs text-gray-400">
                      {{ formatDuration(song) }}
                    </span>
                  </div>
                </div>

                <!-- アクションボタン -->
                <button
                  @click.stop="addSongToQueue(song)"
                  class="p-2 hover:bg-blue-50 rounded-lg transition-colors text-gray-400 hover:text-blue-600 shrink-0"
                  title="キューに追加"
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
                <button
                  @click.stop="handleRemoveSong(index)"
                  class="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-600 shrink-0"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </VueDraggableNext>
        </template>
      </div>

      <!-- フッター -->
      <div
        v-if="currentPlaylistSongs.length > 0"
        class="p-4 border-t border-gray-200 bg-gray-50"
      >
        <button
          @click="addPlaylistToQueue(selectedPlaylist)"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 4v16m8-8H4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          全曲をキューに追加
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
  /* ドラッグ中のカーソルスタイル */
  .drag-handle {
    touch-action: none;
  }

  /* プレイリスト楽曲アイテムのマージン */
  .playlist-song-item {
    margin-bottom: 0.5rem;
    width: 100%;
    box-sizing: border-box;
  }

  .playlist-song-item:last-child {
    margin-bottom: 0;
  }

  /* ホバー効果 */
  .playlist-song-item:hover:not(.sortable-chosen):not(.sortable-ghost) {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
</style>
