<script setup lang="ts">
  import { ref, onMounted, nextTick } from "vue";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";
  import { usePlayerStore } from "~/stores/player";

  const playerQueue = usePlayerQueue();
  const playerStore = usePlayerStore();

  // Emits（モバイル用の閉じる機能）
  const emit = defineEmits(["close"]);

  // レンダリング遅延の状態管理
  const isRenderingReady = ref(false);

  // ドラッグ&ドロップの状態管理
  const draggedIndex = ref<number | null>(null);
  const dragOverIndex = ref<number | null>(null);

  // ドラッグ開始
  const onDragStart = (event: DragEvent, index: number) => {
    draggedIndex.value = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", index.toString());
    }
  };

  // ドラッグオーバー
  const onDragOver = (event: DragEvent, index: number) => {
    event.preventDefault();
    dragOverIndex.value = index;
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  };

  // ドラッグ終了
  const onDragEnd = () => {
    draggedIndex.value = null;
    dragOverIndex.value = null;
  };

  // ドロップ処理
  const onDrop = (event: DragEvent, toIndex: number) => {
    event.preventDefault();
    if (draggedIndex.value !== null && draggedIndex.value !== toIndex) {
      playerQueue.moveInQueue(draggedIndex.value, toIndex);
    }
    onDragEnd();
  };

  // 個別削除処理
  const removeItem = (index: number) => {
    playerQueue.removeFromQueue(index);
  };

  // 全削除処理
  const clearQueue = () => {
    if (window.confirm("キューを全て削除しますか？")) {
      playerQueue.clear();
    }
  };

  // 1秒遅延でレンダリング準備完了
  onMounted(() => {
    setTimeout(() => {
      isRenderingReady.value = true;
    }, 1000);
  });
</script>

<template>
  <div
    class="h-full bg-gray-50/80 border-l border-melon-200 overflow-hidden flex flex-col relative backdrop-blur-sm"
  >
    <!-- ヘッダー -->
    <div class="flex-shrink-0 p-4 border-b border-melon-200 bg-cream-50">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-melon-800">再生キュー</h2>
        <!-- モバイル用閉じるボタン -->
        <button
          class="lg:hidden p-1 text-melon-600 hover:text-melon-700 rounded-full hover:bg-melon-100"
          title="閉じる"
          @click="emit('close')"
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

    <!-- スクロール可能なコンテンツエリア -->
    <div class="flex-1 overflow-y-auto">
      <div
        class="p-4 queue-content"
        style="padding-bottom: calc(var(--player-height-mobile) + 120px)"
      >
        <!-- 空のキューメッセージ -->
        <div v-if="playerQueue.queue.length === 0" class="text-center py-8">
          <div class="text-gray-400 mb-2">
            <svg
              class="w-12 h-12 mx-auto"
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
          </div>
          <p class="text-gray-500 text-sm">キューは空です</p>
          <p class="text-gray-400 text-xs mt-1">
            楽曲を選択して再生キューに追加してください
          </p>
        </div>

        <!-- キューアイテムリスト -->
        <div v-else-if="isRenderingReady" class="space-y-2">
          <div
            v-for="(song, i) in playerQueue.queue"
            :key="`${song.id}-${i}`"
            draggable="true"
            class="bg-cream-50 rounded-lg p-3 shadow-sm border border-melon-100/80 hover:shadow-md transition-all duration-200 cursor-move"
            :class="{
              'ring-2 ring-blue-500 bg-blue-50':
                i === playerQueue.nowPlayingIndex,
              'opacity-50': draggedIndex === i,
              'border-blue-300 shadow-lg':
                dragOverIndex === i && draggedIndex !== i,
            }"
            @dragstart="onDragStart($event, i)"
            @dragover="onDragOver($event, i)"
            @dragend="onDragEnd"
            @drop="onDrop($event, i)"
          >
            <div class="flex items-start justify-between">
              <!-- ドラッグハンドル -->
              <div class="flex items-start gap-3 flex-1 min-w-0">
                <div
                  class="flex-shrink-0 mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                    />
                  </svg>
                </div>

                <div class="flex-1 min-w-0">
                  <h3
                    class="font-medium text-sm truncate"
                    :class="{
                      'text-blue-600': i === playerQueue.nowPlayingIndex,
                      'text-gray-900': i !== playerQueue.nowPlayingIndex,
                    }"
                  >
                    {{ song.title }}
                  </h3>
                  <p class="text-xs text-gray-500 mt-1 truncate">
                    {{ song.artist }}
                  </p>
                  <div class="flex items-center mt-2">
                    <span
                      v-if="i === playerQueue.nowPlayingIndex"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <svg
                        class="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      再生中
                    </span>
                    <span v-else class="text-xs text-gray-400"
                      >{{ i + 1 }}番目</span
                    >
                  </div>
                </div>
              </div>

              <!-- アクションボタン -->
              <div class="flex flex-col gap-1 ml-2">
                <button
                  v-if="i !== playerQueue.nowPlayingIndex"
                  class="text-blue-500 hover:text-blue-700 text-xs px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                  @click="playerQueue.play(i)"
                >
                  再生
                </button>
                <button
                  class="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  @click="removeItem(i)"
                  title="キューから削除"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ローディング表示 -->
        <div
          v-else-if="playerQueue.queue.length > 0 && !isRenderingReady"
          class="text-center py-8"
        >
          <div class="text-gray-400 mb-2">
            <svg
              class="w-8 h-8 mx-auto animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <p class="text-gray-500 text-sm">キューを読み込み中...</p>
        </div>
      </div>
    </div>

    <!-- フッター（コントロールボタン） -->
    <div
      v-if="playerQueue.queue.length > 0"
      class="absolute left-0 right-0 p-4 border-t border-gray-200 bg-white queue-footer"
      style="bottom: var(--player-height-mobile)"
    >
      <div class="flex flex-wrap gap-2">
        <button
          :disabled="!playerQueue.hasPrevious"
          class="flex-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="playerQueue.previous"
        >
          <svg
            class="w-4 h-4 inline mr-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
          </svg>
          前へ
        </button>
        <button
          :disabled="!playerQueue.hasNext"
          class="flex-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="playerQueue.next"
        >
          次へ
          <svg
            class="w-4 h-4 inline ml-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
          </svg>
        </button>
      </div>
      <button
        class="w-full bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-md text-sm mt-2 transition-colors"
        @click="clearQueue"
      >
        <svg
          class="w-4 h-4 inline mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        キューをクリア
      </button>
    </div>
  </div>
</template>

<style scoped>
  /* レスポンシブ対応 */
  @media (min-width: 1024px) {
    .queue-footer {
      bottom: var(--player-height-desktop) !important;
    }

    .queue-content {
      padding-bottom: calc(var(--player-height-desktop) + 120px) !important;
    }
  }

  /* モバイルオーバーレイ時の調整 */
  @media (max-width: 1023px) {
    .queue-content {
      padding-bottom: calc(var(--player-height-mobile) + 120px);
    }

    .queue-footer {
      bottom: var(--player-height-mobile);
    }
  }
</style>
