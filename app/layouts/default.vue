<script setup lang="ts">
  import { ref, computed, watch } from "vue";
  import PlayerQueuePanel from "~/components/PlayerQueuePanel.vue";
  import GlobalYouTubePlayer from "~/components/GlobalYouTubePlayer.vue";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";

  const isQueuePanelOpen = ref(false);
  const isQueueButtonAnimating = ref(false);
  const queue = usePlayerQueue();

  const toggleQueue = () => {
    isQueuePanelOpen.value = !isQueuePanelOpen.value;
  };

  // キュー追加アニメーションをトリガー
  const triggerQueueAnimation = () => {
    isQueueButtonAnimating.value = true;
    setTimeout(() => {
      isQueueButtonAnimating.value = false;
    }, 600);
  };

  // キューの長さを監視してアニメーションをトリガー
  const previousQueueLength = ref(queue.queue.length);
  watch(
    () => queue.queue.length,
    (newLength, oldLength) => {
      if (newLength > (oldLength || 0)) {
        triggerQueueAnimation();
      }
      previousQueueLength.value = newLength;
    },
    { immediate: true }
  );

  // 現在の楽曲があるかどうか
  const hasCurrentTrack = computed(() => !!queue.nowPlaying);
</script>

<template>
  <div
    class="h-screen flex flex-col"
    :class="{ 'has-player': hasCurrentTrack }"
  >
    <!-- グローバルYouTubeプレイヤー（非表示・音声のみ） -->
    <GlobalYouTubePlayer />

    <!-- ヘッダー（固定・ナビゲーション付き） -->
    <div class="shrink-0">
      <LayoutHeader />
    </div>

    <!-- メインコンテンツエリア（ヘッダーとフッターの間を埋める） -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 中央メインコンテンツ（スクロール可能） -->
      <main class="flex-1 overflow-y-auto bg-white">
        <div class="p-2 sm:p-4">
          <slot />
        </div>
      </main>

      <!-- キューパネル（デスクトップのみ・固定） -->
      <div class="hidden lg:block w-96 shrink-0">
        <PlayerQueuePanel :is-desktop="true" />
      </div>
    </div>

    <!-- キューパネル（モバイル用ボタン） -->
    <div class="lg:hidden fixed bottom-24 right-4 z-40">
      <div class="relative">
        <button
          class="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300"
          :class="{
            'animate-bounce bg-green-600 scale-110 shadow-xl':
              isQueueButtonAnimating,
            'hover:bg-green-700': isQueueButtonAnimating,
          }"
          title="再生キューを表示"
          @click="toggleQueue"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <!-- リスト部分（4本線） -->
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 6h18M3 10h18M3 14h8M3 18h8"
            />
            <!-- 再生ボタン部分（右下の三角形・大きめ） -->
            <polygon fill="currentColor" points="15,14 21,17 15,20" />
          </svg>
        </button>

        <!-- キュー数バッジ -->
        <div
          v-if="queue.queue.length > 0"
          class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg"
          :class="{
            'animate-pulse bg-green-500': isQueueButtonAnimating,
          }"
        >
          {{ queue.queue.length }}
        </div>
      </div>
    </div>

    <!-- モバイル用キューパネルオーバーレイ -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-300 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isQueuePanelOpen" class="lg:hidden fixed inset-0 z-50">
        <!-- オーバーレイ背景 -->
        <div
          class="absolute inset-0 bg-linear-to-r from-black/40 to-black/20"
          @click="toggleQueue"
        />

        <!-- キューパネル -->
        <Transition
          enter-active-class="transition-transform duration-300 ease-out"
          leave-active-class="transition-transform duration-300 ease-in"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <div
            v-if="isQueuePanelOpen"
            class="absolute right-0 top-0 h-full w-80 bg-white shadow-xl"
          >
            <PlayerQueuePanel :is-open="true" @close="toggleQueue" />
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- フッター（固定） -->
    <div class="shrink-0">
      <LayoutFooter />
    </div>
  </div>
</template>
