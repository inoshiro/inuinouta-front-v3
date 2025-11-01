<script setup lang="ts">
  import { ref, computed, watch } from "vue";
  import { VueDraggableNext } from "vue-draggable-next";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";
  import { usePlayerStore } from "~/stores/player";
  import type { Song } from "~/types/song";

  interface Props {
    isOpen?: boolean;
    isDesktop?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    isOpen: false,
    isDesktop: false,
  });

  const emit = defineEmits<{
    close: [];
  }>();

  const queueStore = usePlayerQueue();
  const playerStore = usePlayerStore();
  const toast = useToast();

  // ドラッグ中の楽曲リスト（ローカル状態）
  const draggableQueue = ref<Song[]>([]);

  // キューが変更されたときにdraggableQueueを更新
  watch(
    () => queueStore.queue,
    (newQueue) => {
      draggableQueue.value = [...newQueue];
    },
    { immediate: true, deep: true }
  );

  // ドラッグアンドドロップ完了時の処理
  const handleDragEnd = () => {
    // 元の順番と新しい順番を比較
    const oldOrder = queueStore.queue.map((s) => s.id);
    const newOrder = draggableQueue.value.map((s) => s.id);

    // 順番が変わっていない場合は何もしない
    if (JSON.stringify(oldOrder) === JSON.stringify(newOrder)) {
      return;
    }

    try {
      // 現在再生中の曲のIDを保持
      const currentPlayingSongId = queueStore.nowPlaying?.id;

      // ドラッグ後の新しい順序で直接キューを更新
      queueStore.queue = [...draggableQueue.value];

      // 現在再生中の曲の新しいインデックスを見つけて更新
      if (currentPlayingSongId !== undefined) {
        const newPlayingIndex = queueStore.queue.findIndex(
          (song) => song.id === currentPlayingSongId
        );
        if (newPlayingIndex !== -1) {
          queueStore.nowPlayingIndex = newPlayingIndex;
        }
      }

      // LocalStorageに保存
      queueStore.saveQueueSettings();
    } catch (e) {
      console.error("Failed to reorder queue:", e);
      toast.error("曲順の変更に失敗しました");
      // エラーが発生した場合は元に戻す
      draggableQueue.value = [...queueStore.queue];
    }
  };

  // 楽曲を再生
  const handlePlaySong = (index: number) => {
    queueStore.play(index);
    // queueStore.play()が内部的にplayCurrentTrack()を呼び出すため、
    // playerStore.play()は不要
  };

  // 楽曲を削除
  const handleRemoveSong = (index: number) => {
    queueStore.removeFromQueue(index);
  };

  // キューをクリア
  const handleClearQueue = () => {
    if (confirm("キューをすべてクリアしますか？")) {
      queueStore.clear();
      toast.success("キューをクリアしました");
    }
  };

  // 時間のフォーマット
  const formatDuration = (song: Song) => {
    const duration = (song.end_at || 0) - (song.start_at || 0);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // 合計時間を計算
  const totalDuration = computed(() => {
    const totalSeconds = queueStore.queue.reduce((sum, song) => {
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

  // パネルを閉じる
  const closePanel = () => {
    emit("close");
  };
</script>

<template>
  <!-- モバイル版（オーバーレイ） -->
  <div
    v-if="!isDesktop && isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
    @click="closePanel"
  >
    <div
      class="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl overflow-hidden flex flex-col"
      @click.stop
    >
      <!-- ヘッダー -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50"
      >
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-bold text-gray-900">再生キュー</h2>
          <span
            v-if="queueStore.queue.length > 0"
            class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full"
          >
            {{ queueStore.queue.length }}曲
          </span>
        </div>
        <button
          @click="closePanel"
          class="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="閉じる"
        >
          <svg
            class="w-6 h-6 text-gray-600"
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

      <!-- キュー情報 -->
      <div
        v-if="queueStore.queue.length > 0"
        class="px-4 py-3 bg-blue-50 border-b border-blue-100"
      >
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-700">合計時間</span>
          <span class="font-semibold text-blue-900">{{ totalDuration }}</span>
        </div>
      </div>

      <!-- キューリスト -->
      <div class="flex-1 overflow-y-auto">
        <!-- 空の状態 -->
        <div
          v-if="queueStore.queue.length === 0"
          class="flex flex-col items-center justify-center h-full text-center p-8"
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
            キューは空です
          </h3>
          <p class="text-gray-600 text-sm">
            楽曲を選択して再生キューに追加してください
          </p>
        </div>

        <!-- キューアイテムリスト -->
        <VueDraggableNext
          v-else
          v-model="draggableQueue"
          @end="handleDragEnd"
          handle=".drag-handle"
          animation="150"
          ghost-class="opacity-50"
          chosen-class="shadow-lg"
          class="p-4 space-y-2"
        >
          <div
            v-for="(song, index) in draggableQueue"
            :key="`${song.id}-${index}`"
            class="bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200"
            :class="{
              'ring-2 ring-blue-500 bg-blue-50':
                index === queueStore.nowPlayingIndex,
            }"
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

              <!-- 番号または再生中アイコン -->
              <div class="w-8 flex items-center justify-center shrink-0">
                <div
                  v-if="index === queueStore.nowPlayingIndex"
                  class="flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span v-else class="text-sm text-gray-500">
                  {{ index + 1 }}
                </span>
              </div>

              <!-- サムネイル -->
              <div
                class="w-16 h-9 shrink-0 rounded overflow-hidden bg-gray-100 cursor-pointer"
                @click="handlePlaySong(index)"
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
              <div
                class="flex-1 min-w-0 cursor-pointer"
                @click="handlePlaySong(index)"
              >
                <h3
                  class="font-medium text-sm truncate"
                  :class="{
                    'text-blue-600': index === queueStore.nowPlayingIndex,
                    'text-gray-900': index !== queueStore.nowPlayingIndex,
                  }"
                >
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

              <!-- 削除ボタン -->
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
      </div>

      <!-- フッター（コントロールボタン） -->
      <div class="p-4 border-t border-gray-200 bg-gray-50">
        <div v-if="queueStore.queue.length > 0">
          <div class="flex gap-2 mb-2">
            <button
              :disabled="!queueStore.hasPrevious"
              class="flex-1 bg-white hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              @click="queueStore.previous()"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
              </svg>
              前へ
            </button>
            <button
              :disabled="!queueStore.hasNext"
              class="flex-1 bg-white hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              @click="queueStore.next()"
            >
              次へ
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
              </svg>
            </button>
          </div>
          <button
            class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 mb-2"
            @click="handleClearQueue"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            キューをクリア
          </button>
        </div>
        <button
          class="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          @click="closePanel"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          閉じる
        </button>
      </div>
    </div>
  </div>

  <!-- デスクトップ版（サイドバー） -->
  <div
    v-if="isDesktop"
    class="hidden lg:flex flex-col h-full bg-white border-l border-gray-200 pb-20"
  >
    <!-- ヘッダー -->
    <div class="p-4 border-b border-gray-200 bg-gray-50">
      <div class="flex items-center gap-3">
        <h2 class="text-lg font-bold text-gray-900">再生キュー</h2>
        <span
          v-if="queueStore.queue.length > 0"
          class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full"
        >
          {{ queueStore.queue.length }}曲
        </span>
      </div>
    </div>

    <!-- キュー情報 -->
    <div
      v-if="queueStore.queue.length > 0"
      class="px-4 py-3 bg-blue-50 border-b border-blue-100"
    >
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-700">合計時間</span>
        <span class="font-semibold text-blue-900">{{ totalDuration }}</span>
      </div>
    </div>

    <!-- キューリスト -->
    <div class="flex-1 overflow-y-auto">
      <!-- 空の状態 -->
      <div
        v-if="queueStore.queue.length === 0"
        class="flex flex-col items-center justify-center h-full text-center p-8"
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
        <h3 class="text-lg font-semibold text-gray-900 mb-2">キューは空です</h3>
        <p class="text-gray-600 text-sm">
          楽曲を選択して再生キューに追加してください
        </p>
      </div>

      <!-- キューアイテムリスト -->
      <VueDraggableNext
        v-else
        v-model="draggableQueue"
        @end="handleDragEnd"
        handle=".drag-handle"
        animation="150"
        ghost-class="opacity-50"
        chosen-class="shadow-lg"
        class="p-4 space-y-2 pb-20"
      >
        <div
          v-for="(song, index) in draggableQueue"
          :key="`${song.id}-${index}`"
          class="bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200"
          :class="{
            'ring-2 ring-blue-500 bg-blue-50':
              index === queueStore.nowPlayingIndex,
          }"
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

            <!-- 番号または再生中アイコン -->
            <div class="w-8 flex items-center justify-center shrink-0">
              <div
                v-if="index === queueStore.nowPlayingIndex"
                class="flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span v-else class="text-sm text-gray-500">
                {{ index + 1 }}
              </span>
            </div>

            <!-- サムネイル -->
            <div
              class="w-16 h-9 shrink-0 rounded overflow-hidden bg-gray-100 cursor-pointer"
              @click="handlePlaySong(index)"
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
            <div
              class="flex-1 min-w-0 cursor-pointer"
              @click="handlePlaySong(index)"
            >
              <h3
                class="font-medium text-sm truncate"
                :class="{
                  'text-blue-600': index === queueStore.nowPlayingIndex,
                  'text-gray-900': index !== queueStore.nowPlayingIndex,
                }"
              >
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

            <!-- 削除ボタン -->
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
    </div>

    <!-- フッター（コントロールボタン） -->
    <div
      v-if="queueStore.queue.length > 0"
      class="p-4 border-t border-gray-200 bg-gray-50"
    >
      <div class="flex gap-2 mb-2">
        <button
          :disabled="!queueStore.hasPrevious"
          class="flex-1 bg-white hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          @click="queueStore.previous()"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
          </svg>
          前へ
        </button>
        <button
          :disabled="!queueStore.hasNext"
          class="flex-1 bg-white hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          @click="queueStore.next()"
        >
          次へ
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
          </svg>
        </button>
      </div>
      <button
        class="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        @click="handleClearQueue"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        キューをクリア
      </button>
    </div>
  </div>
</template>

<style scoped>
  /* ドラッグ中のカーソルスタイル */
  .drag-handle {
    touch-action: none;
  }
</style>
