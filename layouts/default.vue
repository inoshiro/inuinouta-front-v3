<script setup lang="ts">
  import { ref, computed } from "vue";
  import PlayerQueuePanel from "~/components/PlayerQueuePanel.vue";
  import GlobalYouTubePlayer from "~/components/GlobalYouTubePlayer.vue";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";

  const isQueuePanelOpen = ref(false);
  const queue = usePlayerQueue();

  const toggleQueue = () => {
    isQueuePanelOpen.value = !isQueuePanelOpen.value;
  };

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
    <div class="flex-shrink-0">
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
      <div class="hidden lg:block w-96 flex-shrink-0">
        <PlayerQueuePanel />
      </div>
    </div>

    <!-- キューパネル（モバイル用ボタン） -->
    <div class="lg:hidden fixed bottom-24 right-4 z-40">
      <button
        class="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="再生キューを表示"
        @click="toggleQueue"
      >
        <svg
          class="w-6 h-6"
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
      </button>
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
          class="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20"
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
            <PlayerQueuePanel @close="toggleQueue" />
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- フッター（固定） -->
    <div class="flex-shrink-0">
      <LayoutFooter />
    </div>
  </div>
</template>
