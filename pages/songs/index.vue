<template>
  <div class="container mx-auto px-4 py-8 pb-32">
    <!-- ページヘッダー -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">楽曲一覧</h1>

      <!-- 検索・フィルター -->
      <div class="space-y-4 mb-6">
        <!-- 検索ボックス -->
        <div class="w-full">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="楽曲名、アーティスト名で検索..."
            class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- フィルター（モバイル対応） -->
        <div class="space-y-3">
          <!-- アーティスト検索 -->
          <div>
            <SearchableSelect
              v-model="selectedArtist"
              :options="uniqueArtists"
              placeholder="アーティスト名で検索..."
              all-option-text="全アーティスト"
              input-class="w-full px-3 py-1.5 pr-20 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- 楽曲タイプ、動画タイプ、並び順を横並び -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- 楽曲タイプフィルター（トグルボタン） -->
            <div>
              <label class="text-xs font-medium text-gray-700 mb-1.5 block">
                楽曲タイプ
              </label>
              <div class="flex gap-1.5 flex-wrap">
                <button
                  :class="[
                    'px-3 py-1.5 rounded-lg font-medium transition-all text-xs',
                    songTypeFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-md border-2 border-blue-700'
                      : 'bg-gray-100 text-gray-600',
                  ]"
                  @click="songTypeFilter = 'all'"
                >
                  すべて
                </button>
                <button
                  :class="[
                    'px-3 py-1.5 rounded-lg font-medium transition-all text-xs',
                    songTypeFilter === 'original'
                      ? 'bg-blue-600 text-white shadow-md border-2 border-blue-700'
                      : 'bg-gray-100 text-gray-600',
                  ]"
                  @click="songTypeFilter = 'original'"
                >
                  オリジナル曲
                </button>
                <button
                  :class="[
                    'px-3 py-1.5 rounded-lg font-medium transition-all text-xs',
                    songTypeFilter === 'cover'
                      ? 'bg-blue-600 text-white shadow-md border-2 border-blue-700'
                      : 'bg-gray-100 text-gray-600',
                  ]"
                  @click="songTypeFilter = 'cover'"
                >
                  カバー曲
                </button>
              </div>
            </div>

            <!-- 動画タイプフィルター（トグルボタン） -->
            <div>
              <label class="text-xs font-medium text-gray-700 mb-1.5 block">
                動画タイプ
              </label>
              <div class="flex gap-1.5 flex-wrap">
                <button
                  :class="[
                    'px-3 py-1.5 rounded-lg font-medium transition-all text-xs',
                    videoTypeFilter === 'all'
                      ? 'bg-purple-600 text-white shadow-md border-2 border-purple-700'
                      : 'bg-gray-100 text-gray-600',
                  ]"
                  @click="videoTypeFilter = 'all'"
                >
                  すべて
                </button>
                <button
                  :class="[
                    'px-3 py-1.5 rounded-lg font-medium transition-all text-xs',
                    videoTypeFilter === 'music_video'
                      ? 'bg-purple-600 text-white shadow-md border-2 border-purple-700'
                      : 'bg-gray-100 text-gray-600',
                  ]"
                  @click="videoTypeFilter = 'music_video'"
                >
                  歌動画
                </button>
                <button
                  :class="[
                    'px-3 py-1.5 rounded-lg font-medium transition-all text-xs',
                    videoTypeFilter === 'stream'
                      ? 'bg-purple-600 text-white shadow-md border-2 border-purple-700'
                      : 'bg-gray-100 text-gray-600',
                  ]"
                  @click="videoTypeFilter = 'stream'"
                >
                  歌配信
                </button>
              </div>
            </div>

            <!-- ソート順 -->
            <div>
              <label class="text-xs font-medium text-gray-700 mb-1.5 block">
                並び順
              </label>
              <select
                v-model="sortOrder"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                @change="handleSortChange"
              >
                <option value="-video.published_at,start_at">
                  新しい配信順
                </option>
                <option value="video.published_at,-start_at">古い配信順</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ローディング状態 -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      />
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
  const { songs, loading, error, fetchSongs } = useSongs();
  // Stores（表示情報のみ必要）
  // const { addToQueue } = usePlayerQueue();

  // リアクティブデータ
  const searchQuery = ref(""); // クライアント側フィルタ
  const selectedArtist = ref(""); // クライアント側フィルタ
  // フィルター用（ラジオボタン式）
  const songTypeFilter = ref("all"); // 'all', 'original', 'cover'
  const videoTypeFilter = ref("all"); // 'all', 'music_video', 'stream'
  const sortOrder = ref("-video.published_at,start_at"); // デフォルトソート
  const loadingMore = ref(false);
  const totalSongs = ref(0);

  // 計算プロパティ（クライアント側フィルタは検索とアーティストのみ）
  const displayedSongs = computed(() => {
    let filteredSongs = songs.value || [];

    // キーワード検索フィルター（クライアント側）
    if (searchQuery.value.trim()) {
      const searchTerm = searchQuery.value.toLowerCase().trim();
      filteredSongs = filteredSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchTerm) ||
          song.artist.toLowerCase().includes(searchTerm)
      );
    }

    // アーティストフィルター（クライアント側）
    if (selectedArtist.value) {
      filteredSongs = filteredSongs.filter(
        (song) => song.artist === selectedArtist.value
      );
    }

    // 楽曲タイプフィルター（クライアント側）
    if (songTypeFilter.value === "original") {
      filteredSongs = filteredSongs.filter((song) => song.is_original);
    } else if (songTypeFilter.value === "cover") {
      filteredSongs = filteredSongs.filter((song) => !song.is_original);
    }

    // 動画タイプフィルター（クライアント側）
    if (videoTypeFilter.value === "music_video") {
      filteredSongs = filteredSongs.filter((song) => !song.video?.is_stream);
    } else if (videoTypeFilter.value === "stream") {
      filteredSongs = filteredSongs.filter((song) => song.video?.is_stream);
    }

    return filteredSongs;
  });

  const uniqueArtists = computed(() => {
    const artists = new Set((songs.value || []).map((song) => song.artist));
    return Array.from(artists).sort();
  });

  // 検索のデバウンス処理は不要（クライアント側フィルタのため）

  // メソッド
  const loadSongs = async () => {
    const query = {};

    // API呼び出しするのはソートのみ
    if (sortOrder.value) query.ordering = sortOrder.value;

    // 公開動画のみ取得
    query["filter{video.is_open}"] = true;
    query["filter{video.is_member_only}"] = false;

    const result = await fetchSongs(query);
  };

  // ソート変更時のみAPI再取得
  const handleSortChange = () => {
    loadSongs();
  };

  const clearFilters = () => {
    searchQuery.value = "";
    selectedArtist.value = "";
    songTypeFilter.value = "all";
    videoTypeFilter.value = "all";
    sortOrder.value = "-video.published_at,start_at"; // デフォルトソートに戻す
    loadSongs(); // ソート変更のためAPI再取得
  };

  const loadMoreSongs = async () => {
    // TODO: ページネーション実装
    loadingMore.value = true;
    // 実装予定
    loadingMore.value = false;
  };

  const handleAddToQueue = () => {
    // SongRowコンポーネント内で直接キューに追加されているため
    // ここでは追加処理のみを行う（将来的にはトースト通知など）
  };

  const handlePlayNow = () => {
    // SongRowコンポーネント内で直接プレイヤーと統合されているため
    // ここでは追加処理のみを行う（将来的にはトースト通知など）
  };

  // ライフサイクル
  onMounted(() => {
    loadSongs();
  });
</script>
