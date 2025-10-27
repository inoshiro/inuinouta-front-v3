<template>
  <div class="song-list">
    <!-- リストヘッダー -->
    <div class="mb-4 flex items-center justify-between">
      <p class="text-sm text-gray-600">{{ songs.length }}曲見つかりました</p>
      <div class="flex items-center space-x-4">
        <!-- 表示件数選択 -->
        <div class="flex items-center space-x-2">
          <label class="text-sm text-gray-600">表示件数:</label>
          <select
            v-model="itemsPerPage"
            class="text-sm border border-gray-300 rounded px-2 py-1"
            @change="onItemsPerPageChange"
          >
            <option value="10">10件</option>
            <option value="20">20件</option>
            <option value="50">50件</option>
            <option value="100">100件</option>
          </select>
        </div>
        <div v-if="totalPages > 1" class="text-sm text-gray-600">
          {{ currentPage }} / {{ totalPages }} ページ
        </div>
      </div>
    </div>

    <!-- 上部ページネーション -->
    <div v-if="totalPages > 1" class="mb-4">
      <BasePagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :visible-pages="visiblePages"
        @go-to-page="goToPage"
      />
    </div>

    <!-- 楽曲リスト -->
    <div
      v-if="currentPageSongs.length > 0"
      class="bg-white rounded-lg shadow overflow-hidden"
    >
      <SongRow
        v-for="song in currentPageSongs"
        :key="song.id"
        :song="song"
        @play-now="$emit('play-now', $event)"
        @add-to-queue="$emit('add-to-queue', $event)"
        @add-to-playlist="$emit('add-to-playlist', $event)"
      />
    </div>

    <!-- 下部ページネーション -->
    <div v-if="totalPages > 1" class="mt-8 mb-8">
      <BasePagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :visible-pages="visiblePages"
        @go-to-page="goToPage"
      />
    </div>

    <!-- 楽曲が0件の場合 -->
    <div v-if="songs.length === 0" class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg
          class="w-16 h-16 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      </div>
      <p class="text-gray-500 text-lg">楽曲が見つかりませんでした</p>
      <p class="text-gray-400 mt-2">検索条件を変更して再度お試しください</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from "vue";
  import BasePagination from "~/components/BasePagination.vue";
  import type { Song } from "~/types/song";

  // Props
  const props = withDefaults(
    defineProps<{
      songs?: readonly any[];
    }>(),
    {
      songs: () => [],
    }
  );

  // Emits
  defineEmits<{
    "play-now": [song: Song];
    "add-to-queue": [song: Song];
    "add-to-playlist": [payload: { song: Song; playlistId: string }];
  }>();

  // ページネーションの設定
  const ITEMS_PER_PAGE = 20; // デフォルト値

  // リアクティブ変数
  const currentPage = ref(1);
  const itemsPerPage = ref(ITEMS_PER_PAGE);

  // ページネーションの計算
  const totalPages = computed(() =>
    Math.ceil(props.songs.length / itemsPerPage.value)
  );

  const currentPageSongs = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value;
    const endIndex = startIndex + itemsPerPage.value;
    return props.songs.slice(startIndex, endIndex);
  });

  // 表示するページ番号の計算
  const visiblePages = computed(() => {
    const pages = [];
    const total = totalPages.value;
    const current = currentPage.value;

    if (total <= 7) {
      // 7ページ以下の場合はすべて表示
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // 7ページを超える場合は省略表示
      if (current <= 4) {
        // 現在ページが前半の場合
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(total);
      } else if (current >= total - 3) {
        // 現在ページが後半の場合
        pages.push(1);
        pages.push("...");
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // 現在ページが中間の場合
        pages.push(1);
        pages.push("...");
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(total);
      }
    }

    return pages;
  });

  // ページ移動
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      // ページトップにスクロール
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 表示件数変更時の処理
  const onItemsPerPageChange = () => {
    currentPage.value = 1; // 1ページ目に戻す
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 楽曲リストが変更された時にページを1に戻す
  watch(
    () => props.songs.length,
    () => {
      currentPage.value = 1;
    }
  );

  // 楽曲リスト自体が変更された時も同様に1ページ目に戻す
  watch(
    () => props.songs,
    () => {
      currentPage.value = 1;
    },
    { deep: false }
  );
</script>

<style scoped>
  /* ページネーションのスタイル */
  .song-list {
    contain: layout style;
  }

  /* ページネーションボタンのホバー効果 */
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* セレクトボックスのスタイル */
  select {
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* アニメーション効果 */
  .song-list * {
    transition: all 0.2s ease;
  }

  /* スムーズなレイアウト */
  .bg-white {
    transition: opacity 0.3s ease;
  }

  /* レスポンシブ対応 */
  @media (max-width: 768px) {
    .mb-4.flex {
      flex-direction: column;
      gap: 0.75rem;
      align-items: flex-start;
    }

    .flex.items-center.space-x-4 {
      width: 100%;
      justify-content: space-between;
      margin: 0;
      gap: 0.5rem;
    }
  }
</style>
