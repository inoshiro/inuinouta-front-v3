<script setup lang="ts">
  import type { LocalPlaylist } from "~/types/playlist";

  const props = defineProps<{
    isOpen: boolean;
  }>();

  const emit = defineEmits<{
    close: [];
    created: [playlist: LocalPlaylist];
  }>();

  const { createPlaylist, loading } = useLocalPlaylist();
  const toast = useToast();

  // フォームデータ
  const name = ref("");
  const description = ref("");
  const nameError = ref("");

  // モーダルを閉じる
  const handleClose = () => {
    name.value = "";
    description.value = "";
    nameError.value = "";
    emit("close");
  };

  // モーダル背景クリック処理
  const { handleMouseDown, handleMouseUp, handleMouseLeave } =
    useModalBackdropClose(handleClose);

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
      const playlist = await createPlaylist({
        name: name.value.trim(),
        description: description.value.trim() || undefined,
      });

      toast.success(`プレイリスト「${playlist.name}」を作成しました`);
      emit("created", playlist);
      handleClose();
    } catch (e) {
      console.error("Failed to create playlist:", e);
      toast.error("プレイリストの作成に失敗しました");
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
          document.getElementById("playlist-name-input")?.focus();
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
          <h2 class="text-xl font-bold text-white">プレイリストを作成</h2>
          <button
            @click="handleClose"
            class="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
            aria-label="閉じる"
          >
            <Icon name="mdi:close" class="w-5 h-5" />
          </button>
        </div>

        <!-- コンテンツ -->
        <form @submit.prevent="handleSubmit" class="px-6 py-6 space-y-5">
          <!-- 注意書き -->
          <div
            class="bg-orange-900/30 border border-orange-700 rounded-lg p-3 flex items-start gap-2 text-sm"
          >
            <Icon
              name="mdi:information"
              class="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5"
            />
            <div class="text-orange-200/90">
              <p class="font-semibold mb-1">ローカル保存について</p>
              <p class="text-xs text-orange-200/70">
                プレイリストはこのブラウザにのみ保存されます。ブラウザのデータを削除すると失われますのでご注意ください。
              </p>
            </div>
          </div>

          <!-- プレイリスト名 -->
          <div>
            <label
              for="playlist-name-input"
              class="block text-sm font-medium text-gray-200 mb-2"
            >
              プレイリスト名 <span class="text-red-400">*</span>
            </label>
            <input
              id="playlist-name-input"
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
              <Icon name="mdi:alert-circle" class="w-4 h-4" />
              {{ nameError }}
            </div>
            <div class="mt-1 text-xs text-gray-400 text-right">
              {{ name.length }}/100
            </div>
          </div>

          <!-- 説明 -->
          <div>
            <label
              for="playlist-description-input"
              class="block text-sm font-medium text-gray-200 mb-2"
            >
              説明（任意）
            </label>
            <textarea
              id="playlist-description-input"
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
              <Icon v-else name="mdi:plus" class="w-5 h-5" />
              作成
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
