<script setup lang="ts">
  import { computed } from "vue";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";

  interface Props {
    isMobile?: boolean;
  }

  defineProps<Props>();

  const queueStore = usePlayerQueue();

  // 現在の楽曲情報
  const currentTrack = computed(() => queueStore.nowPlaying);
</script>

<template>
  <!-- 楽曲情報エリア -->
  <div
    :class="['flex items-center min-w-0', isMobile ? 'gap-2' : 'gap-3 w-80']"
  >
    <!-- アルバムアート（サムネイル）- モバイルでは小さく -->
    <div :class="['flex-shrink-0', isMobile ? 'w-10 h-10' : 'w-14 h-14']">
      <div
        class="w-full h-full bg-gray-700 rounded-md flex items-center justify-center overflow-hidden"
      >
        <img
          v-if="currentTrack?.video?.thumbnail_path"
          :src="currentTrack.video.thumbnail_path"
          :alt="currentTrack.title"
          class="w-full h-full object-cover"
        />
        <svg
          v-else
          :class="['text-gray-400', isMobile ? 'w-4 h-4' : 'w-6 h-6']"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
          />
        </svg>
      </div>
    </div>

    <!-- 楽曲情報テキスト -->
    <div class="flex-1 min-w-0">
      <div
        :class="[
          'font-medium text-white truncate hover:underline cursor-pointer',
          isMobile ? 'text-xs leading-tight' : 'text-sm',
        ]"
      >
        {{ currentTrack?.title || "楽曲を選択してください" }}
      </div>
      <div
        :class="[
          'text-gray-400 truncate hover:underline cursor-pointer',
          isMobile ? 'text-xs leading-tight' : 'text-xs',
        ]"
      >
        {{ currentTrack?.artist || "アーティスト不明" }}
      </div>
    </div>

    <!-- いいねボタン（デスクトップのみ） -->
    <button
      v-if="!isMobile"
      class="p-1 hover:bg-gray-700 rounded transition-colors opacity-75 hover:opacity-100"
    >
      <svg
        class="w-5 h-5 text-gray-400 hover:text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  </div>
</template>
