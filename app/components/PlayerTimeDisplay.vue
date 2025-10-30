<script setup lang="ts">
  import { computed } from "vue";
  import { usePlayerStore } from "~/stores/player";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";

  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  // 時間フォーマット関数（メモ化）
  const formatTimeCache = new Map<number, string>();
  const formatTime = (seconds: number): string => {
    const key = Math.floor(seconds);
    if (formatTimeCache.has(key)) {
      return formatTimeCache.get(key)!;
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const formatted = `${mins}:${secs.toString().padStart(2, "0")}`;

    // キャッシュサイズを制限
    if (formatTimeCache.size > 1000) {
      const firstKey = formatTimeCache.keys().next().value;
      if (firstKey !== undefined) {
        formatTimeCache.delete(firstKey);
      }
    }

    formatTimeCache.set(key, formatted);
    return formatted;
  };

  // 現在の楽曲情報
  const currentTrack = computed(() => queueStore.nowPlaying);

  // 楽曲の表示時間計算
  const trackCurrentTime = computed(() => {
    if (!currentTrack.value) return 0;
    const startTime = currentTrack.value.start_at || 0;
    return Math.max(0, playerStore.currentTime - startTime);
  });

  const trackDuration = computed(() => {
    if (!currentTrack.value) return 0;
    const startTime = currentTrack.value.start_at || 0;
    const endTime = currentTrack.value.end_at || playerStore.duration;
    return Math.max(0, endTime - startTime);
  });
</script>

<template>
  <!-- 時間表示 -->
  <div class="flex items-center justify-center gap-2 text-xs text-gray-400">
    <span class="tabular-nums">{{ formatTime(trackCurrentTime) }}</span>
    <span class="text-gray-500">/</span>
    <span class="tabular-nums">{{ formatTime(trackDuration) }}</span>
  </div>
</template>

<style scoped>
  /* タブラー数字フォント */
  .tabular-nums {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum";
  }
</style>
