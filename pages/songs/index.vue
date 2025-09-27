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
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- フィルター（モバイル対応） -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <SearchableSelect
            v-model="selectedArtist"
            :options="uniqueArtists"
            placeholder="アーティスト名で検索..."
            all-option-text="全アーティスト"
          />

          <select
            v-model="selectedType"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全楽曲</option>
            <option value="original">オリジナル楽曲</option>
            <option value="cover">カバー楽曲</option>
          </select>

          <select
            v-model="selectedVideoType"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全動画</option>
            <option value="music_video">歌動画</option>
            <option value="stream">歌配信</option>
          </select>

          <select
            v-model="sortOrder"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            @change="handleSortChange"
          >
            <option value="-video.published_at,start_at">
              デフォルト（新しい配信順）
            </option>
            <option value="video.published_at,-start_at">
              逆順（古い配信順）
            </option>
          </select>
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
  const selectedType = ref(""); // クライアント側フィルタ
  const selectedVideoType = ref(""); // クライアント側フィルタ（歌動画/歌配信）
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

    // 楽曲タイプと動画タイプのフィルタはサーバー側で処理済み

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

    // 楽曲タイプフィルタ（サーバー側）
    if (selectedType.value === "original") {
      query["filter{is_original}"] = true;
    } else if (selectedType.value === "cover") {
      query["filter{is_original}"] = false;
    }

    // 動画タイプフィルタ（サーバー側）
    if (selectedVideoType.value === "music_video") {
      query["filter{video.is_stream}"] = false;
    } else if (selectedVideoType.value === "stream") {
      query["filter{video.is_stream}"] = true;
    }

    // 公開動画のみ取得
    query["filter{video.is_open}"] = true;
    query["filter{video.is_member_only}"] = false;

    const result = await fetchSongs(query);
  };

  // ソート変更時のみAPI再取得
  const handleSortChange = () => {
    loadSongs();
  };

  // フィルタ変更時にAPI再取得
  const handleFilterChange = () => {
    loadSongs();
  };

  const clearFilters = () => {
    searchQuery.value = "";
    selectedArtist.value = "";
    selectedType.value = "";
    selectedVideoType.value = "";
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

  // フィルタ変更の監視（サーバー側フィルタのみ）
  watch([selectedType, selectedVideoType], () => {
    handleFilterChange();
  });
</script>
