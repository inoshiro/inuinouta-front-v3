<template>
  <div class="container mx-auto px-4 py-8 pb-32">
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
            placeholder="歌枠タイトルで検索..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- フィルター（モバイル対応） -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select
            v-model="sortOrder"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="-published_at">新しい順</option>
            <option value="published_at">古い順</option>
          </select>

          <!-- ランダム歌枠キュー設定ボタン -->
          <button
            :disabled="loading"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
            title="ランダムな歌枠の楽曲をキューに設定"
            @click="fetchRandomStream"
          >
            🎲 ランダムキュー
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
  import type { VideoWithSongs } from "~/types/video";
  import type { Song } from "~/types/song";

  // リアクティブな状態
  const { videos, loading, error, fetchVideos } = useVideos();
  const analytics = useAnalytics();
  const searchQuery = ref("");
  const sortOrder = ref("-published_at");

  // 歌枠のフィルタリング（既にサーバー側でフィルタ済み）
  const streams = computed(() => {
    return videos.value; // サーバー側で歌配信のみ取得済み
  });

  // フィルター適用（クライアント側）
  const filteredStreams = computed(() => {
    let result = [...streams.value];

    // キーワード検索（タイトルのみ）
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim();
      result = result.filter((stream) =>
        stream.title.toLowerCase().includes(query)
      );
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
        default:
          return 0;
      }
    });

    return result;
  });

  // 歌枠を取得（サーバー側で歌配信のみフィルタ）
  const fetchStreams = async () => {
    await fetchVideos({
      "filter{is_stream}": true,
      "filter{is_open}": true,
      "filter{is_member_only}": false,
      ordering: sortOrder.value,
    });
  };

  // ランダム歌枠取得
  const fetchRandomStream = async () => {
    try {
      // 現在の歌枠一覧からランダムに選択（楽曲数が0以外のもの）
      const availableStreams = streams.value.filter(
        (stream) => stream.songs_count && stream.songs_count > 0
      );

      if (availableStreams.length === 0) {
        console.log("楽曲がある歌枠が見つかりませんでした");
        return;
      }

      // ランダムに歌枠を選択
      const randomIndex = Math.floor(Math.random() * availableStreams.length);
      const randomStream = availableStreams[randomIndex];

      console.log(
        `ランダム選択: 「${randomStream.title}」（${randomStream.songs_count}曲）`
      );

      // video詳細APIを使ってsongs情報も含めて取得
      const { fetchVideoWithSongs } = useVideos();
      const videoWithSongs = await fetchVideoWithSongs(randomStream.id);

      console.log("取得したvideo詳細:", videoWithSongs);
      console.log("songs配列:", videoWithSongs?.songs);
      console.log("songs配列の長さ:", videoWithSongs?.songs?.length);

      if (
        videoWithSongs &&
        videoWithSongs.songs &&
        videoWithSongs.songs.length > 0
      ) {
        // キューストアを使ってキューをクリアしてから楽曲を追加
        const { usePlayerQueue } = await import("~/stores/usePlayerQueue");
        const queueStore = usePlayerQueue();

        // ランダム歌枠の楽曲でキューを新規設定（既存キューはクリアされる）
        const songsWithVideoInfo = videoWithSongs.songs.map((song: Song) => ({
          ...song,
          video: {
            id: videoWithSongs.id,
            title: videoWithSongs.title,
            thumbnail_path: videoWithSongs.thumbnail_path,
            url: videoWithSongs.url,
            is_open: videoWithSongs.is_open,
            is_member_only: videoWithSongs.is_member_only,
            is_stream: videoWithSongs.is_stream,
            unplayable: videoWithSongs.unplayable,
            published_at: videoWithSongs.published_at,
          },
          addedFrom: "stream" as const,
        }));

        queueStore.setQueue(songsWithVideoInfo);
        queueStore.play(0); // 最初の曲から再生開始

        // アナリティクス: ランダム歌枠キューを追跡
        analytics.trackPlaylistAction(
          "play",
          randomStream.id,
          randomStream.title
        );

        console.log(
          `ランダム歌枠「${videoWithSongs.title}」の${videoWithSongs.songs.length}曲をキューに設定しました`
        );
      } else {
        console.log(
          `ランダム歌枠「${randomStream.title}」に楽曲が見つかりませんでした。再試行してください。`
        );
      }
    } catch (error) {
      console.error("ランダム歌枠の取得中にエラーが発生しました:", error);
    }
  };

  // フィルタークリア
  const clearFilters = () => {
    searchQuery.value = "";
    sortOrder.value = "-published_at";
    // データは既に取得済みなので、クライアント側フィルタのリセットのみ
  };

  // 歌枠の楽曲一覧を表示
  const handleViewSongs = (stream: any) => {
    // 楽曲一覧ページに遷移し、その歌枠の楽曲のみを表示
    navigateTo(`/songs?video_id=${stream.id}`);
  };

  // 歌枠全体をキューに追加
  const handleAddStreamToQueue = async (stream: any) => {
    try {
      // video詳細APIを使ってsongs情報も含めて取得
      const { fetchVideoWithSongs } = useVideos();
      const videoWithSongs = await fetchVideoWithSongs(stream.id);

      if (
        videoWithSongs &&
        videoWithSongs.songs &&
        videoWithSongs.songs.length > 0
      ) {
        // キューストアを使って楽曲を追加
        const { usePlayerQueue } = await import("~/stores/usePlayerQueue");
        const queueStore = usePlayerQueue();

        videoWithSongs.songs.forEach((song: Song) => {
          // video情報を補完
          const songWithVideo = {
            ...song,
            video: {
              id: videoWithSongs.id,
              title: videoWithSongs.title,
              thumbnail_path: videoWithSongs.thumbnail_path,
              url: videoWithSongs.url,
              is_open: videoWithSongs.is_open,
              is_member_only: videoWithSongs.is_member_only,
              is_stream: videoWithSongs.is_stream,
              unplayable: videoWithSongs.unplayable,
              published_at: videoWithSongs.published_at,
            },
            addedFrom: "stream" as const,
          };
          queueStore.addToQueue(songWithVideo);
        });

        // アナリティクス: 歌枠全体をキューに追加
        analytics.trackPlaylistAction("add_song", stream.id, stream.title);

        console.log(
          `歌枠「${videoWithSongs.title}」の${videoWithSongs.songs.length}曲をキューに追加しました`
        );
      } else {
        console.log("この歌枠には楽曲が見つかりませんでした");
      }
    } catch (error) {
      console.error("歌枠をキューに追加する際にエラーが発生しました:", error);
    }
  };

  // 検索クエリの変更を監視してアナリティクスに送信
  let searchDebounceTimer: NodeJS.Timeout | null = null;
  watch(searchQuery, (newQuery) => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    if (newQuery.trim()) {
      searchDebounceTimer = setTimeout(() => {
        // アナリティクス: 検索を追跡
        analytics.trackSearch(newQuery, filteredStreams.value.length);
      }, 1000);
    }
  });

  // ソート変更を監視
  watch(sortOrder, (newOrder) => {
    // アナリティクス: ソート変更を追跡
    analytics.trackSortChange("streams", newOrder);
  });

  // 初期データ取得
  onMounted(() => {
    fetchStreams();
  });

  // ソート順変更時の処理
  watch(sortOrder, () => {
    // クライアント側フィルタリングなので、新たにAPIを呼ぶ必要なし
    // computed が自動的に再計算される
  });
</script>

<style scoped>
  /* カスタムスタイルが必要な場合はここに追加 */
</style>
