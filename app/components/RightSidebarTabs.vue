<script setup lang="ts">
  import { ref } from "vue";
  import { useUIContext } from "~/stores/useUIContext";
  import PlayerQueuePanel from "./PlayerQueuePanel.vue";
  import PlaylistPanel from "./PlaylistPanel.vue";

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

  const uiContext = useUIContext();

  // タブの切り替え
  const switchTab = (tab: "queue" | "playlist") => {
    uiContext.setRightPanelMode(tab);
  };
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- タブヘッダー（デスクトップのみ） -->
    <div v-if="isDesktop" class="border-b border-gray-200 bg-white">
      <div class="flex">
        <button
          @click="switchTab('queue')"
          class="flex-1 px-4 py-3 text-sm font-medium transition-colors relative"
          :class="{
            'text-blue-600 bg-blue-50': uiContext.isQueueMode,
            'text-gray-600 hover:text-gray-900 hover:bg-gray-50':
              !uiContext.isQueueMode,
          }"
        >
          <span>再生キュー</span>
          <div
            v-if="uiContext.isQueueMode"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
          ></div>
        </button>
        <button
          @click="switchTab('playlist')"
          class="flex-1 px-4 py-3 text-sm font-medium transition-colors relative"
          :class="{
            'text-purple-600 bg-purple-50': uiContext.isPlaylistMode,
            'text-gray-600 hover:text-gray-900 hover:bg-gray-50':
              !uiContext.isPlaylistMode,
          }"
        >
          <span>プレイリスト</span>
          <div
            v-if="uiContext.isPlaylistMode"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
          ></div>
        </button>
      </div>
    </div>

    <!-- タブコンテンツ -->
    <div class="flex-1 overflow-hidden">
      <!-- 再生キュー -->
      <div v-show="uiContext.isQueueMode" class="h-full">
        <PlayerQueuePanel
          :is-open="isOpen"
          :is-desktop="isDesktop"
          @close="emit('close')"
        />
      </div>

      <!-- プレイリスト（デスクトップのみ） -->
      <div v-if="isDesktop" v-show="uiContext.isPlaylistMode" class="h-full">
        <PlaylistPanel />
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* タブのトランジション効果 */
  button {
    transition: all 0.2s ease;
  }
</style>
