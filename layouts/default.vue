<script setup lang="ts">
  import { ref } from "vue";
  import PlayerQueuePanel from "~/components/PlayerQueuePanel.vue";
  import GlobalYouTubePlayer from "~/components/GlobalYouTubePlayer.vue";

  const isQueuePanelOpen = ref(false);

  const toggleQueue = () => {
    isQueuePanelOpen.value = !isQueuePanelOpen.value;
  };
</script>

<template>
  <div class="h-screen flex flex-col">
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
        <div class="p-2 sm:p-4 pb-24">
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

    <!-- フッター（固定） -->
    <div class="flex-shrink-0">
      <LayoutFooter />
    </div>
  </div>
</template>
