<script setup lang="ts">
  import type { Song } from "~/types/song";

  const props = defineProps<{
    isOpen: boolean;
    song: Song;
  }>();

  const emit = defineEmits<{
    close: [];
    added: [playlistId: string];
  }>();

  const { playlists, loadPlaylists, addSongToPlaylist, loading } =
    useLocalPlaylist();
  const toast = useToast();

  // 選択されたプレイリスト
  const selectedPlaylistId = ref<string | null>(null);

  // 新規作成モーダル
  const showCreateModal = ref(false);

  // モーダルが開いたらプレイリスト一覧を読み込む
  watch(
    () => props.isOpen,
    async (isOpen) => {
      if (isOpen) {
        await loadPlaylists();
        selectedPlaylistId.value = null;
      }
    }
  );

  // プレイリストに追加
  const handleAdd = async () => {
    if (!selectedPlaylistId.value) {
      toast.warning("プレイリストを選択してください");
      return;
    }

    try {
      await addSongToPlaylist(selectedPlaylistId.value, props.song.id);

      const playlist = playlists.value.find(
        (p) => p.id === selectedPlaylistId.value
      );
      toast.success(
        `「${props.song.title}」を${
          playlist ? `「${playlist.name}」に` : "プレイリストに"
        }追加しました`
      );

      emit("added", selectedPlaylistId.value);
      handleClose();
    } catch (e) {
      console.error("Failed to add song to playlist:", e);
      // エラーメッセージがある場合は表示
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

    // 自動的に追加
    await handleAdd();
  };

  // モーダルを閉じる
  const handleClose = () => {
    selectedPlaylistId.value = null;
    emit("close");
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
      @click.self="handleClose"
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
          <h2 class="text-xl font-bold text-white">プレイリストに追加</h2>
          <button
            @click="handleClose"
            class="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
            aria-label="閉じる"
          >
            <Icon name="mdi:close" class="w-5 h-5" />
          </button>
        </div>

        <!-- コンテンツ -->
        <div class="px-6 py-6 flex-1 overflow-y-auto">
          <!-- 楽曲情報 -->
          <div class="mb-5 pb-5 border-b border-gray-700">
            <div class="flex items-center gap-3">
              <img
                v-if="song.video?.thumbnail_path"
                :src="song.video.thumbnail_path"
                :alt="song.title"
                class="w-16 h-12 object-cover rounded flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-white truncate">
                  {{ song.title }}
                </h3>
                <p class="text-sm text-gray-400 truncate">{{ song.artist }}</p>
              </div>
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
            <Icon
              name="mdi:playlist-music"
              class="w-16 h-16 mx-auto mb-3 text-gray-600"
            />
            <p>プレイリストがありません</p>
            <p class="text-sm mt-1">新しいプレイリストを作成してください</p>
          </div>

          <!-- 新規作成ボタン -->
          <button
            @click="handleShowCreateModal"
            class="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 hover:bg-gray-700/30 text-gray-300 hover:text-blue-400 transition-colors"
          >
            <Icon name="mdi:plus-circle" class="w-5 h-5" />
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
            <Icon v-else name="mdi:plus" class="w-5 h-5" />
            追加
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
