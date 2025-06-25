<script setup lang="ts">
  import { ref } from "vue";
  import PlayerQueuePanel from "~/components/PlayerQueuePanel.vue";

  const isSidebarOpen = ref(false);
  const isQueuePanelOpen = ref(false);

  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };

  const closeSidebar = () => {
    isSidebarOpen.value = false;
  };

  const toggleQueue = () => {
    isQueuePanelOpen.value = !isQueuePanelOpen.value;
  };
</script>

<template>
  <div class="flex flex-col min-h-screen overflow-x-hidden">
    <LayoutHeader @toggle-sidebar="toggleSidebar" />
    <div class="flex">
      <LayoutSidebar :is-open="isSidebarOpen" @close-sidebar="closeSidebar" />
      <!-- メインコンテンツエリア -->
      <main class="flex-1 w-full p-2 sm:p-4 bg-white overflow-y-auto pb-20">
        <slot />
      </main>
      <!-- キューパネル（デスクトップのみ） -->
      <div class="hidden lg:block w-96">
        <PlayerQueuePanel />
      </div>
    </div>
    <!-- キューパネル（モバイル用ボタン） -->
    <div class="lg:hidden fixed bottom-20 right-4 z-40">
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
    <LayoutFooter />
  </div>
</template>
