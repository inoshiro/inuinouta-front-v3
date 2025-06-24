<template>
  <div class="container mx-auto px-4 py-8">
    <!-- ページヘッダー -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">楽曲一覧</h1>

      <!-- 検索・フィルター -->
      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <!-- 検索ボックス -->
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="楽曲名、アーティスト名で検索..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @input="debouncedSearch"
          >
        </div>

        <!-- フィルター -->
        <div class="flex gap-2">
          <select
            v-model="selectedArtist"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            @change="handleFilterChange"
          >
            <option value="">全アーティスト</option>
            <option
              v-for="artist in uniqueArtists"
              :key="artist"
              :value="artist"
            >
              {{ artist }}
            </option>
          </select>

          <select
            v-model="selectedType"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            @change="handleFilterChange"
          >
            <option value="">全楽曲</option>
            <option value="original">オリジナル楽曲</option>
            <option value="cover">カバー楽曲</option>
          </select>

          <select
            v-model="sortOrder"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            @change="handleFilterChange"
          >
            <option value="">デフォルト</option>
            <option value="title">タイトル順</option>
            <option value="artist">アーティスト順</option>
            <option value="-id">新着順</option>
          </select>
        </div>

        <!-- ランダム楽曲ボタン -->
        <button
          :disabled="loading"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 whitespace-nowrap"
          @click="getRandomSong"
        >
          ランダム選択
        </button>
      </div>
    </div>

    <!-- ローディング状態 -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>

    <!-- エラー状態 -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
    >
      <p class="text-red-800">{{ error }}</p>
      <button
        class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        @click="loadSongs"
      >
        再試行
      </button>
    </div>

    <!-- 楽曲リスト -->
    <div v-else-if="displayedSongs.length > 0" class="space-y-4">
      <SongList
        :songs="displayedSongs"
        @add-to-queue="handleAddToQueue"
        @play-now="handlePlayNow"
      />

      <!-- ページネーション（今後実装） -->
      <div
        v-if="totalSongs > displayedSongs.length"
        class="mt-8 flex justify-center"
      >
        <button
          :disabled="loadingMore"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          @click="loadMoreSongs"
        >
          {{ loadingMore ? "読み込み中..." : "さらに読み込む" }}
        </button>
      </div>
    </div>

    <!-- 楽曲が見つからない場合 -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500 text-lg mb-4">楽曲が見つかりませんでした</p>
      <button
        class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        @click="clearFilters"
      >
        フィルターをクリア
      </button>
    </div>
  </div>
</template>

<script setup>
// Meta設定
definePageMeta({
  title: "楽曲一覧",
  description:
    "いぬいのうたの楽曲一覧ページです。お気に入りの楽曲を見つけてプレイリストに追加しましょう。",
});

// Composables
const { songs, loading, error, fetchSongs, fetchRandomSong } = useSongs();
const { addToQueue } = usePlayerQueue();

// リアクティブデータ
const searchQuery = ref("");
const selectedArtist = ref("");
const selectedType = ref("");
const sortOrder = ref("");
const loadingMore = ref(false);
const allSongs = ref([]);
const totalSongs = ref(0);

// 計算プロパティ
const displayedSongs = computed(() => {
  return songs.value || [];
});

const uniqueArtists = computed(() => {
  const artists = new Set(allSongs.value.map((song) => song.artist));
  return Array.from(artists).sort();
});

// 検索のデバウンス処理
let searchTimeout = null;
const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    handleFilterChange();
  }, 300);
};

// メソッド
const loadSongs = async () => {
  const query = {};

  if (searchQuery.value) query.search = searchQuery.value;
  if (selectedArtist.value) query.artist = selectedArtist.value;
  if (selectedType.value === "original") query.is_original = true;
  if (selectedType.value === "cover") query.is_original = false;
  if (sortOrder.value) query.ordering = sortOrder.value;

  const result = await fetchSongs(query);
  if (result.length > 0) {
    // 初回読み込み時にすべての楽曲を保存（フィルター用）
    if (
      allSongs.value.length === 0 &&
      !searchQuery.value &&
      !selectedArtist.value &&
      !selectedType.value
    ) {
      allSongs.value = result;
    }
  }
};

const handleFilterChange = () => {
  loadSongs();
};

const clearFilters = () => {
  searchQuery.value = "";
  selectedArtist.value = "";
  selectedType.value = "";
  sortOrder.value = "";
  loadSongs();
};

const getRandomSong = async () => {
  const randomSong = await fetchRandomSong();
  if (randomSong) {
    handlePlayNow(randomSong);
  }
};

const loadMoreSongs = async () => {
  // TODO: ページネーション実装
  loadingMore.value = true;
  // 実装予定
  loadingMore.value = false;
};

const handleAddToQueue = (song) => {
  addToQueue(song);
  // TODO: トースト通知の実装
  console.log(`楽曲「${song.title}」をキューに追加しました`);
};

const handlePlayNow = (song) => {
  // キューをクリアして新しい楽曲を再生
  addToQueue(song);
  // TODO: トースト通知の実装
  console.log(`楽曲「${song.title}」を再生開始しました`);
};

// ライフサイクル
onMounted(() => {
  loadSongs();
});
</script>
