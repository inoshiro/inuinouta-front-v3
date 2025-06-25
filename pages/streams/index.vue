<template>
  <div class="container mx-auto px-4 py-8">
    <!-- ページヘッダー -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">歌枠一覧</h1>
      <p class="text-gray-600">ライブ配信での歌枠をご覧いただけます</p>

      <!-- 検索・フィルター -->
      <div class="space-y-4 mb-6 mt-6">
        <!-- 検索ボックス -->
        <div class="w-full">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="歌枠タイトル、配信者名で検索..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="debouncedSearch"
          />
        </div>

        <!-- フィルター（モバイル対応） -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <select
            v-model="selectedFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            @change="handleFilterChange"
          >
            <option value="">全ての歌枠</option>
            <option value="public">一般公開のみ</option>
            <option value="member">メンバー限定のみ</option>
            <option value="playable">再生可能のみ</option>
          </select>

          <select
            v-model="sortOrder"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            @change="handleFilterChange"
          >
            <option value="-published_at">新しい順</option>
            <option value="published_at">古い順</option>
            <option value="title">タイトル順</option>
          </select>

          <!-- ランダム取得ボタン -->
          <button
            :disabled="loading"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
            @click="fetchRandomStream"
          >
            🎲 ランダム
          </button>
        </div>
      </div>
    </div>

    <!-- ローディング状態 -->
    <div v-if="loading" class="text-center py-8">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      />
      <p class="mt-2 text-gray-600">歌枠を読み込み中...</p>
    </div>

    <!-- エラー状態 -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        @click="fetchStreams"
      >
        再試行
      </button>
    </div>

    <!-- 歌枠一覧 -->
    <div v-else-if="filteredStreams.length > 0" class="space-y-4">
      <div class="text-sm text-gray-600 mb-4">
        {{ filteredStreams.length }}件の歌枠が見つかりました
      </div>

      <StreamList
        :streams="filteredStreams"
        @view-songs="handleViewSongs"
        @add-stream-to-queue="handleAddStreamToQueue"
      />
    </div>

    <!-- 結果が見つからない場合 -->
    <div v-else class="text-center py-8">
      <div class="text-gray-400 text-6xl mb-4">🎤</div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">
        歌枠が見つかりませんでした
      </h3>
      <p class="text-gray-600 mb-4">検索条件を変更してお試しください</p>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        @click="clearFilters"
      >
        フィルターをクリア
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  // リアクティブな状態
  const { videos, loading, error, fetchVideos, searchVideos } = useVideos();
  const searchQuery = ref("");
  const selectedFilter = ref("");
  const sortOrder = ref("-published_at");
  const searchTimeout = ref();

  // 歌枠のみをフィルター（is_stream: true）
  const streams = computed(() => {
    return videos.value.filter((video) => video.is_stream === true);
  });

  // フィルター適用
  const filteredStreams = computed(() => {
    let result = [...streams.value];

    // 歌枠フィルター
    if (selectedFilter.value) {
      switch (selectedFilter.value) {
        case "public":
          result = result.filter(
            (stream) => stream.is_open && !stream.is_member_only
          );
          break;
        case "member":
          result = result.filter((stream) => stream.is_member_only);
          break;
        case "playable":
          result = result.filter((stream) => !stream.unplayable);
          break;
      }
    }

    // ソート
    result.sort((a, b) => {
      switch (sortOrder.value) {
        case "-published_at":
          return (
            new Date(b.published_at).getTime() -
            new Date(a.published_at).getTime()
          );
        case "published_at":
          return (
            new Date(a.published_at).getTime() -
            new Date(b.published_at).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  });

  // 歌枠を取得
  const fetchStreams = async () => {
    await fetchVideos({
      ordering: sortOrder.value,
    });
  };

  // 検索実行（デバウンス付き）
  const debouncedSearch = () => {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value);
    }
    searchTimeout.value = setTimeout(async () => {
      if (searchQuery.value.trim()) {
        await searchVideos(searchQuery.value, {
          ordering: sortOrder.value,
        });
      } else {
        await fetchStreams();
      }
    }, 300);
  };

  // フィルター変更時の処理
  const handleFilterChange = async () => {
    if (searchQuery.value.trim()) {
      await searchVideos(searchQuery.value, {
        ordering: sortOrder.value,
      });
    } else {
      await fetchStreams();
    }
  };

  // ランダム歌枠取得
  const fetchRandomStream = async () => {
    await fetchVideos({
      ordering: "?",
      limit: 20,
    });
  };

  // フィルタークリア
  const clearFilters = () => {
    searchQuery.value = "";
    selectedFilter.value = "";
    sortOrder.value = "-published_at";
    fetchStreams();
  };

  // 歌枠の楽曲一覧を表示
  const handleViewSongs = (stream) => {
    // 楽曲一覧ページに遷移し、その歌枠の楽曲のみを表示
    navigateTo(`/songs?video_id=${stream.id}`);
  };

  // 歌枠全体をキューに追加
  const handleAddStreamToQueue = (stream) => {
    // TODO: キュー機能が実装されたら対応
    console.log("歌枠をキューに追加:", stream.title);
  };

  // 初期データ取得
  onMounted(() => {
    fetchStreams();
  });

  // 検索クエリの変更を監視
  watch(searchQuery, (newValue) => {
    if (!newValue.trim()) {
      fetchStreams();
    }
  });
</script>

<style scoped>
  /* カスタムスタイルが必要な場合はここに追加 */
</style>
