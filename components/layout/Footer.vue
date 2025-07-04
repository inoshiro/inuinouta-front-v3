<script setup>
  import { computed } from "vue";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";
  import PlayerControls from "~/components/PlayerControls.vue";

  const queue = usePlayerQueue();

  // 現在の楽曲があるかどうか
  const hasCurrentTrack = computed(() => !!queue.nowPlaying);
</script>

<template>
  <!-- 固定位置のプレイヤーコントロール -->
  <footer
    v-if="hasCurrentTrack"
    class="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-700"
  >
    <PlayerControls />
  </footer>
</template>
