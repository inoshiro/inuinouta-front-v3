<template>
  <div class="song-list">
    <!-- リストヘッダー -->
    <div class="mb-4">
      <p class="text-sm text-gray-600">
        {{ songs.length }}曲見つかりました
      </p>
    </div>

    <!-- 楽曲リスト -->
    <div class="space-y-0 bg-white rounded-lg shadow overflow-hidden">
      <SongRow
        v-for="song in songs"
        :key="song.id"
        :song="song"
        @play-now="$emit('play-now', $event)"
        @add-to-queue="$emit('add-to-queue', $event)"
        @add-to-playlist="$emit('add-to-playlist', $event)"
      />
    </div>

    <!-- 楽曲が0件の場合 -->
    <div v-if="songs.length === 0" class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </div>
      <p class="text-gray-500 text-lg">楽曲が見つかりませんでした</p>
      <p class="text-gray-400 mt-2">検索条件を変更して再度お試しください</p>
    </div>
  </div>
</template>

<script setup>
// Props
defineProps({
  songs: {
    type: Array,
    default: () => []
  }
})

// Emits
defineEmits(['play-now', 'add-to-queue', 'add-to-playlist'])
</script>
