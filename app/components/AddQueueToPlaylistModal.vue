<script setup lang="ts">
  import type { Song } from "~/types/song";

  const props = defineProps<{
    isOpen: boolean;
    songs: Song[];
  }>();

  const emit = defineEmits<{
    close: [];
    added: [playlistId: string];
  }>();

  const { playlists, loadPlaylists, loading } = useLocalPlaylist();
  const toast = useToast();

  // 選択されたプレイリスト
  const selectedPlaylistId = ref<string | null>(null);

  // 置き換えるかどうか
  const shouldReplace = ref(false);

  // 新規作成モーダル
  const showCreateModal = ref(false);

  // モーダルを閉じる
  const handleClose = () => {
    selectedPlaylistId.value = null;
    shouldReplace.value = false;
    emit("close");
  };

  // モーダル背景クリック処理
  const { handleMouseDown, handleMouseUp, handleMouseLeave } =
    useModalBackdropClose(handleClose);

  // モーダルが開いたらプレイリスト一覧を読み込む
  watch(
    () => props.isOpen,
    async (isOpen) => {
      if (isOpen) {
        await loadPlaylists();
        selectedPlaylistId.value = null;
        shouldReplace.value = false;
      }
    },
    { immediate: true }
  );

  // プレイリストに追加または置き換え
  const handleAdd = async () => {
    if (!selectedPlaylistId.value) {
      toast.warning("プレイリストを選択してください");
      return;
    }

    if (props.songs.length === 0) {
      toast.warning("キューに楽曲がありません");
      return;
    }

    try {
      const playlist = playlists.value.find(
        (p) => p.id === selectedPlaylistId.value
      );

      if (!playlist) {
        throw new Error("プレイリストが見つかりません");
      }

      // LocalStorageから直接プレイリストを更新
      const allPlaylists = JSON.parse(
        localStorage.getItem("local_playlists") || "[]"
      );
      const targetPlaylist = allPlaylists.find(
        (p: any) => p.id === selectedPlaylistId.value
      );

      if (!targetPlaylist) {
        throw new Error("プレイリストが見つかりません");
      }

      if (shouldReplace.value) {
        // 置き換え: 既存の曲をクリアして新しい曲を追加
        targetPlaylist.items = props.songs.map((song, index) => ({
          id: crypto.randomUUID(),
          song_id: song.id,
          order: index,
          added_at: new Date().toISOString(),
        }));
      } else {
        // 追加: 既存の曲の後に追加
        const startOrder = targetPlaylist.items.length;
        const newItems = props.songs.map((song, index) => ({
          id: crypto.randomUUID(),
          song_id: song.id,
          order: startOrder + index,
          added_at: new Date().toISOString(),
        }));
        targetPlaylist.items.push(...newItems);
      }

      targetPlaylist.updated_at = new Date().toISOString();

      // LocalStorageに保存
      localStorage.setItem("local_playlists", JSON.stringify(allPlaylists));

      // stateを更新
      await loadPlaylists();

      const action = shouldReplace.value ? "置き換えました" : "追加しました";
      toast.success(
        `${props.songs.length}曲を「${playlist.name}」に${action}`
      );

      emit("added", selectedPlaylistId.value);
      handleClose();
    } catch (e) {
      console.error("Failed to add queue to playlist:", e);
      if (e instanceof Error && e.message) {
        toast.error(e.message);
      } else {
        toast.error("プレイリストへの追加に失敗しました");
      }
    }
  };

  // 新規プレイリスト作成
  const handleShowCreateModal = () => {
    showCreateModal.value = true;
  };

  // 新規プレイリスト作成完了
  const handlePlaylistCreated = async (playlist: any) => {
    showCreateModal.value = false;
    await loadPlaylists();
    selectedPlaylistId.value = playlist.id;
    shouldReplace.value = false; // 新規作成の場合は追加モード

    // 自動的に追加
    await handleAdd();
  };

  // Escapeキーで閉じる
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && !showCreateModal.value) {
      handleClose();
    }
  };
</script>

<template>
  <Transition
    enter-active-class="transition-opacity ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
      @keydown="handleKeyDown"
    >
      <div
        class="bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col"
        @click.stop
      >
        <!-- ヘッダー -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-gray-700 flex-shrink-0"
        >
          <h2 class="text-xl font-bold text-white">
            キューをプレイリストに登録
          </h2>
          <button
            @click="handleClose"
            class="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
            aria-label="閉じる"
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

        <!-- コンテンツ -->
        <div class="px-6 py-6 flex-1 overflow-y-auto">
          <!-- キュー情報 -->
          <div class="mb-5 pb-5 border-b border-gray-700">
            <div class="flex items-center gap-2 text-gray-300">
              <svg
                class="w-5 h-5 text-blue-400"
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
              <span class="font-semibold">{{ songs.length }}曲</span>
              <span class="text-gray-400">をプレイリストに登録します</span>
            </div>
          </div>

          <!-- プレイリスト一覧 -->
          <div v-if="playlists.length > 0" class="space-y-2 mb-4">
            <label
              v-for="playlist in playlists"
              :key="playlist.id"
              class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors"
              :class="{ 'bg-gray-700': selectedPlaylistId === playlist.id }"
            >
              <input
                v-model="selectedPlaylistId"
                type="radio"
                :value="playlist.id"
                class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2"
              />
              <div class="flex-1 min-w-0">
                <div class="font-medium text-white truncate">
                  {{ playlist.name }}
                </div>
                <div class="text-sm text-gray-400">
                  {{ playlist.items.length }}曲
                </div>
              </div>
            </label>
          </div>

          <!-- プレイリストが空の場合 -->
          <div v-else class="text-center py-8 text-gray-400">
            <svg
              class="w-16 h-16 mx-auto mb-3 text-gray-600"
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
            <p>プレイリストがありません</p>
            <p class="text-sm mt-1">新しいプレイリストを作成してください</p>
          </div>

          <!-- 置き換えオプション（プレイリストが選択されている場合のみ） -->
          <div
            v-if="selectedPlaylistId && playlists.length > 0"
            class="mb-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600"
          >
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                v-model="shouldReplace"
                type="checkbox"
                class="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div class="flex-1">
                <div class="font-medium text-white">
                  既存の曲を置き換える
                </div>
                <div class="text-sm text-gray-400 mt-1">
                  チェックを入れると、プレイリストの既存の曲をクリアしてキューの曲に置き換えます
                </div>
              </div>
            </label>
          </div>

          <!-- 新規作成ボタン -->
          <button
            @click="handleShowCreateModal"
            class="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 hover:bg-gray-700/30 text-gray-300 hover:text-blue-400 transition-colors"
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
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="font-medium">新しいプレイリストを作成</span>
          </button>
        </div>

        <!-- フッター -->
        <div
          class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700 flex-shrink-0"
        >
          <button
            type="button"
            @click="handleClose"
            class="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            :disabled="loading"
          >
            キャンセル
          </button>
          <button
            @click="handleAdd"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            :disabled="loading || !selectedPlaylistId"
          >
            <span
              v-if="loading"
              class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"
            ></span>
            <svg
              v-else
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
            {{ shouldReplace ? "置き換え" : "追加" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- プレイリスト作成モーダル -->
  <PlaylistCreateModal
    :is-open="showCreateModal"
    @close="showCreateModal = false"
    @created="handlePlaylistCreated"
  />
</template>
