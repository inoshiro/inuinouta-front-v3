<template>
  <div class="song-row bg-white hover:bg-gray-50 border-b border-gray-200 transition-colors duration-150">
    <div class="flex items-center p-4">
      <!-- サムネイル -->
      <div class="flex-shrink-0 w-16 h-12 mr-4">
        <img
          :src="song.video.thumbnail_path"
          :alt="song.title"
          class="w-full h-full object-cover rounded border border-gray-300"
          loading="lazy"
        >
      </div>

      <!-- 楽曲情報 -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2 mb-1">
          <h3 class="text-sm font-medium text-gray-900 truncate">
            {{ song.title }}
          </h3>
          <span
            v-if="song.is_original"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
          >
            オリジナル
          </span>
        </div>
        <p class="text-sm text-gray-500 truncate">
          {{ song.artist }}
        </p>
        <div class="flex items-center space-x-4 mt-1">
          <span class="text-xs text-gray-400">
            再生時間: {{ formatDuration(song.start_at, song.end_at) }}
          </span>
          <a
            :href="youtubeUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-blue-600 hover:text-blue-800"
          >
            YouTube で開く
          </a>
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="flex-shrink-0 flex items-center space-x-2">
        <!-- 今すぐ再生ボタン -->
        <button
          title="今すぐ再生"
          class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-150"
          @click="$emit('play-now', song)"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- キューに追加ボタン -->
        <button
          title="キューに追加"
          class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors duration-150"
          @click="$emit('add-to-queue', song)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>

        <!-- プレイリストに追加ボタン -->
        <button
          title="プレイリストに追加"
          class="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors duration-150"
          @click="$emit('add-to-playlist', song)"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  song: {
    type: Object,
    required: true
  }
})

// Emits
defineEmits(['play-now', 'add-to-queue', 'add-to-playlist'])

// 計算プロパティ
const youtubeUrl = computed(() => {
  const base = 'https://youtube.com/watch?'
  const params = new URLSearchParams()
  params.append('v', props.song.video.id)
  if (props.song.start_at) {
    params.append('t', props.song.start_at.toString())
  }
  return base + params.toString()
})

// メソッド
const formatDuration = (startAt, endAt) => {
  if (!startAt && !endAt) return '全編'
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  if (startAt && endAt) {
    return `${formatTime(startAt)} - ${formatTime(endAt)}`
  } else if (startAt) {
    return `${formatTime(startAt)} から`
  } else if (endAt) {
    return `開始 - ${formatTime(endAt)}`
  }
  
  return '全編'
}
</script>
