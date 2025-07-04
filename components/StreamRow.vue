<template>
  <div
    class="stream-row bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-all duration-150 hover:shadow-md"
  >
    <!-- モバイル表示 -->
    <div class="block md:hidden p-3">
      <div class="flex items-start space-x-3">
        <!-- サムネイル（モバイル） -->
        <div class="flex-shrink-0 w-16 h-12">
          <div
            class="w-full h-full bg-gray-200 rounded border border-gray-300 flex items-center justify-center overflow-hidden"
          >
            <img
              v-if="stream.thumbnail_path"
              :src="stream.thumbnail_path"
              :alt="stream.title"
              class="w-full h-full object-cover"
              loading="lazy"
              @error="handleImageError"
            />
            <span v-else class="text-sm text-gray-400">🎤</span>
          </div>
        </div>

        <!-- 歌枠情報（モバイル） -->
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-medium text-gray-900 truncate mb-1">
            {{ stream.title }}
          </h3>
          <!-- バッジ（モバイル） -->
          <div class="flex flex-wrap gap-1 mb-2">
            <span
              v-if="stream.is_member_only"
              class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
            >
              メンバー限定
            </span>
            <span
              v-if="!stream.is_open"
              class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
            >
              非公開
            </span>
            <span v-if="stream.unplayable" class="text-xs text-red-500">
              ⚠️ 再生不可
            </span>
          </div>
          <!-- 日時情報（モバイル） -->
          <div class="flex items-center justify-between">
            <div class="text-xs text-gray-500">
              <span>📅 {{ formatDate(stream.published_at) }}</span>
              <span v-if="songCount" class="ml-2">🎵 {{ songCount }}曲</span>
            </div>
            <!-- モバイル用アクション -->
            <div class="flex items-center space-x-1">
              <a
                :href="stream.url"
                target="_blank"
                rel="noopener noreferrer"
                class="p-1.5 text-gray-400 hover:text-red-600 rounded-full"
                title="YouTube で開く"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  />
                </svg>
              </a>
              <button
                class="p-1.5 text-gray-400 hover:text-blue-600 rounded-full"
                title="楽曲一覧"
                @click="$emit('view-songs', stream)"
              >
                <svg
                  class="w-4 h-4"
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
          </div>
        </div>
      </div>
    </div>

    <!-- デスクトップ表示 -->
    <div class="hidden md:flex items-center p-4">
      <!-- サムネイル -->
      <div class="flex-shrink-0 w-20 h-15 mr-4">
        <div
          class="w-full h-full bg-gray-200 rounded border border-gray-300 flex items-center justify-center overflow-hidden"
        >
          <img
            v-if="stream.thumbnail_path"
            :src="stream.thumbnail_path"
            :alt="stream.title"
            class="w-full h-full object-cover"
            loading="lazy"
            @error="handleImageError"
          />
          <span v-else class="text-lg text-gray-400">🎤</span>
        </div>
      </div>

      <!-- 歌枠情報 -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2 mb-1">
          <h3 class="text-lg font-medium text-gray-900 truncate">
            {{ stream.title }}
          </h3>
          <span
            v-if="stream.is_member_only"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
          >
            メンバー限定
          </span>
          <span
            v-if="!stream.is_open"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
          >
            非公開
          </span>
        </div>

        <div class="flex items-center space-x-4 text-xs text-gray-500">
          <span> 📅 {{ formatDate(stream.published_at) }} </span>
          <span v-if="songCount"> 🎵 {{ songCount }}曲 </span>
          <span v-if="stream.unplayable" class="text-red-500">
            ⚠️ 再生不可
          </span>
        </div>
      </div>

      <!-- アクションボタン -->
      <div class="flex-shrink-0 flex items-center space-x-2">
        <!-- YouTube で開くボタン -->
        <a
          :href="stream.url"
          target="_blank"
          rel="noopener noreferrer"
          class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-150"
          title="YouTube で開く"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
            />
          </svg>
        </a>

        <!-- 歌枠の楽曲一覧を見るボタン -->
        <button
          class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-150"
          title="この歌枠の楽曲一覧を見る"
          @click="$emit('view-songs', stream)"
        >
          <svg
            class="w-5 h-5"
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

        <!-- 歌枠全体をキューに追加ボタン -->
        <button
          class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors duration-150"
          title="この歌枠の全楽曲をキューに追加"
          @click="$emit('add-stream-to-queue', stream)"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps({
    stream: {
      type: Object,
      required: true,
    },
    songCount: {
      type: Number,
      default: 0,
    },
  });

  // イベントの定義
  defineEmits(["view-songs", "add-stream-to-queue"]);

  // 日時フォーマット関数
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 画像読み込みエラーハンドリング
  const handleImageError = (event) => {
    event.target.style.display = "none";
  };
</script>

<style scoped>
  /* サムネイルのアスペクト比を16:9に調整 */
  .w-20.h-15 {
    width: 5rem;
    height: 3.75rem; /* 20 * 9/16 = 11.25, 調整して15 */
  }
</style>
