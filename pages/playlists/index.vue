<script setup lang="ts">
  // Meta設定
  definePageMeta({
    keepalive: true, // ページの状態を保持
  });

  const { playlists, loading, error, loadPlaylists } = useLocalPlaylist();

  // プレイリスト一覧を読み込む
  onMounted(async () => {
    await loadPlaylists();
  });

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // プレイリスト作成モーダル
  const showCreateModal = ref(false);

  // プレイリスト作成完了ハンドラ
  const handlePlaylistCreated = async () => {
    showCreateModal.value = false;
    await loadPlaylists();
  };
</script>

<template>
  <div class="container mx-auto px-4 py-8 pb-32 max-w-7xl">
    <!-- ヘッダー -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">プレイリスト</h1>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          新規作成
        </button>
      </div>

      <!-- 注意書き -->
      <div
        class="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3"
      >
        <svg
          class="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div class="text-sm">
          <p class="text-orange-800 font-semibold mb-1">
            プレイリストはこのブラウザにのみ保存されます
          </p>
          <p class="text-orange-700">
            別のデバイスやブラウザでは表示されません。ブラウザのデータを削除すると失われますのでご注意ください。
          </p>
        </div>
      </div>
    </div>

    <!-- ローディング表示 -->
    <div v-if="loading" class="text-center py-16">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
      <p class="mt-4 text-gray-600">読み込み中...</p>
    </div>

    <!-- エラー表示 -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
    >
      <div class="flex items-center gap-2 text-red-800">
        <Icon name="mdi:alert-circle" class="w-5 h-5" />
        <p>{{ error }}</p>
      </div>
    </div>

    <!-- プレイリスト一覧 -->
    <div
      v-else-if="playlists.length > 0"
      class="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200"
    >
      <div class="divide-y divide-gray-200">
        <NuxtLink
          v-for="playlist in playlists"
          :key="playlist.id"
          :to="`/playlists/${playlist.id}`"
          class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group"
        >
          <!-- アイコン -->

          <!-- プレイリスト情報 -->
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-lg mb-1 truncate text-gray-900">
              {{ playlist.name }}
            </h3>
            <p
              v-if="playlist.description"
              class="text-sm text-gray-600 truncate"
            >
              {{ playlist.description }}
            </p>
          </div>

          <!-- メタ情報 -->
          <div class="flex items-center gap-6 text-sm text-gray-500">
            <div class="flex items-center gap-2">
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
              <span>{{ playlist.items.length }}曲</span>
            </div>
            <div class="hidden sm:block">
              {{ formatDate(playlist.created_at) }}
            </div>
          </div>

          <!-- 矢印アイコン -->
          <div
            class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg
              class="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- 空の状態 -->
    <div v-else class="text-center py-20">
      <svg
        class="w-24 h-24 text-gray-400 mx-auto mb-4"
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
      <h2 class="text-xl font-semibold text-gray-900 mb-2">
        プレイリストがありません
      </h2>
      <p class="text-gray-600 mb-6">
        最初のプレイリストを作成してお気に入りの楽曲をまとめましょう
      </p>
      <button
        @click="showCreateModal = true"
        class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        プレイリストを作成
      </button>
    </div>

    <!-- プレイリスト作成モーダル -->
    <PlaylistCreateModal
      :is-open="showCreateModal"
      @close="showCreateModal = false"
      @created="handlePlaylistCreated"
    />
  </div>
</template>
