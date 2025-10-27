<script setup lang="ts">
  import type { LocalPlaylist } from "~/types/playlist";

  const props = defineProps<{
    isOpen: boolean;
    playlist: LocalPlaylist;
  }>();

  const emit = defineEmits<{
    close: [];
    updated: [playlist: LocalPlaylist];
  }>();

  const { updatePlaylist, loading } = useLocalPlaylist();
  const toast = useToast();
  const analytics = useAnalytics();

  // フォームデータ
  const name = ref("");
  const description = ref("");
  const nameError = ref("");

  // モーダルを閉じる
  const handleClose = () => {
    nameError.value = "";
    emit("close");
  };

  // モーダル背景クリック処理
  const { handleMouseDown, handleMouseUp, handleMouseLeave } =
    useModalBackdropClose(handleClose);

  // プレイリストが変わったらフォームを更新
  watch(
    () => props.playlist,
    (playlist) => {
      if (playlist) {
        name.value = playlist.name;
        description.value = playlist.description || "";
      }
    },
    { immediate: true }
  );

  // バリデーション
  const validateName = () => {
    if (!name.value.trim()) {
      nameError.value = "プレイリスト名を入力してください";
      return false;
    }
    if (name.value.length > 100) {
      nameError.value = "プレイリスト名は100文字以内で入力してください";
      return false;
    }
    nameError.value = "";
    return true;
  };

  // フォーム送信
  const handleSubmit = async () => {
    if (!validateName()) {
      return;
    }

    try {
      const updatedPlaylist = await updatePlaylist(props.playlist.id, {
        name: name.value.trim(),
        description: description.value.trim() || undefined,
      });

      // アナリティクス: プレイリスト編集を追跡
      analytics.trackPlaylistAction(
        "edit",
        updatedPlaylist.id,
        updatedPlaylist.name
      );

      toast.success("プレイリストを更新しました");
      emit("updated", updatedPlaylist);
      handleClose();
    } catch (e) {
      console.error("Failed to update playlist:", e);
      toast.error("プレイリストの更新に失敗しました");
    }
  };

  // Escapeキーで閉じる
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  // モーダルが開いたときにフォーカス
  watch(
    () => props.isOpen,
    (isOpen) => {
      if (isOpen) {
        nextTick(() => {
          document.getElementById("playlist-edit-name-input")?.focus();
        });
      }
    }
  );
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
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-md w-full" @click.stop>
        <!-- ヘッダー -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-gray-700"
        >
          <h2 class="text-xl font-bold text-white">プレイリストを編集</h2>
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
        <form @submit.prevent="handleSubmit" class="px-6 py-6 space-y-5">
          <!-- プレイリスト名 -->
          <div>
            <label
              for="playlist-edit-name-input"
              class="block text-sm font-medium text-gray-200 mb-2"
            >
              プレイリスト名 <span class="text-red-400">*</span>
            </label>
            <input
              id="playlist-edit-name-input"
              v-model="name"
              type="text"
              maxlength="100"
              placeholder="例: お気に入りのオリジナル曲"
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              @blur="validateName"
            />
            <div
              v-if="nameError"
              class="mt-1 text-sm text-red-400 flex items-center gap-1"
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {{ nameError }}
            </div>
            <div class="mt-1 text-xs text-gray-400 text-right">
              {{ name.length }}/100
            </div>
          </div>

          <!-- 説明 -->
          <div>
            <label
              for="playlist-edit-description-input"
              class="block text-sm font-medium text-gray-200 mb-2"
            >
              説明（任意）
            </label>
            <textarea
              id="playlist-edit-description-input"
              v-model="description"
              rows="3"
              maxlength="500"
              placeholder="例: 戌亥とこのオリジナル曲をまとめたプレイリスト"
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
            />
            <div class="mt-1 text-xs text-gray-400 text-right">
              {{ description.length }}/500
            </div>
          </div>

          <!-- ボタン -->
          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              @click="handleClose"
              class="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              :disabled="loading"
            >
              キャンセル
            </button>
            <button
              type="submit"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              :disabled="loading || !name.trim()"
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
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
