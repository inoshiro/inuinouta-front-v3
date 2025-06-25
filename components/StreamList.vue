<template>
  <div class="space-y-4">
    <StreamRow
      v-for="stream in streams"
      :key="stream.id"
      :stream="stream"
      @view-songs="$emit('view-songs', $event)"
      @add-stream-to-queue="$emit('add-stream-to-queue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
  defineProps({
    streams: {
      type: Array,
      required: true,
    },
  });

  defineEmits(["view-songs", "add-stream-to-queue"]);
</script>

<style scoped>
  /* StreamListコンポーネント専用のスタイル */
</style>
