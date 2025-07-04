<script setup lang="ts">
  import { usePlayerQueue } from "~/stores/usePlayerQueue";

  const playerQueue = usePlayerQueue();

  // Emits（モバイル用の閉じる機能）
  const emit = defineEmits(["close"]);
</script>

<template>
  <div
    class="h-full bg-gray-50 border-l border-gray-200 overflow-hidden flex flex-col relative"
  >
    <!-- ヘッダー -->
    <div class="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-800">再生キュー</h2>
        <!-- モバイル用閉じるボタン -->
        <button
          class="lg:hidden p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
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
        <div v-else class="space-y-2">
          <div
            v-for="(song, i) in playerQueue.queue"
            :key="song.id"
            class="bg-white rounded-lg p-3 shadow-sm border hover:shadow-md transition-shadow"
            :class="{
              'ring-2 ring-blue-500 bg-blue-50':
                i === playerQueue.nowPlayingIndex,
            }"
          >
            <div class="flex items-start justify-between">
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
              <div class="flex flex-col gap-1 ml-2">
                <button
                  v-if="i !== playerQueue.nowPlayingIndex"
                  class="text-blue-500 hover:text-blue-700 text-xs px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                  @click="playerQueue.play(i)"
                >
                  再生
                </button>
              </div>
            </div>
          </div>
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
            viewBox="0 0 20 20"
          >
            <path
              d="M8.445 14.832A1 1 0 0010 14v-4a1 1 0 00-1.555-.832L6 10.202V6a1 1 0 10-2 0v8a1 1 0 001.555.832L8.445 14.832zM14 6a1 1 0 10-2 0v8a1 1 0 102 0V6z"
            />
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
            viewBox="0 0 20 20"
          >
            <path
              d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L7 13.798V18a1 1 0 102 0V6a1 1 0 00-1.555-.832L4.555 5.168zM10 6a1 1 0 112 0v8a1 1 0 11-2 0V6z"
            />
          </svg>
        </button>
      </div>
      <button
        class="w-full bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-md text-sm mt-2 transition-colors"
        @click="playerQueue.clear"
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
