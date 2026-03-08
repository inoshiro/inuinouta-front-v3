<script setup lang="ts">
  import type { Video } from "~/types/video";

  useSeoMeta({
    title: "タイムライン | いぬいのうた",
    description:
      "戌亥とこの全動画をタイムラインで振り返ります。歌ってみた・歌枠の投稿履歴を時系列で一覧できます。",
  });

  // 全動画を古い順に取得
  const {
    data: videosData,
    pending: loading,
    error: fetchError,
    refresh,
  } = await useFetch<{ videos: Video[] }>("/api/videos", {
    query: {
      "filter{is_open}": true,
      "filter{is_member_only}": false,
      ordering: "-published_at",
    },
    key: "timeline-videos",
    deep: false,
  });

  const videos = computed(() => videosData.value?.videos ?? []);

  const error = computed(() => {
    if (fetchError.value) return "動画の取得に失敗しました";
    return null;
  });

  // 表示フィルター
  type VideoFilter = "all" | "song" | "stream";
  const activeFilter = ref<VideoFilter>("all");

  const filteredVideos = computed(() => {
    const list = videos.value;
    if (activeFilter.value === "song") return list.filter((v) => !v.is_stream);
    if (activeFilter.value === "stream") return list.filter((v) => v.is_stream);
    return list;
  });

  // 年月グループ化
  type MonthGroup = {
    key: string; // "2023-04"
    label: string; // "2023年4月"
    videos: Video[];
  };

  type YearGroup = {
    year: number;
    months: MonthGroup[];
    totalCount: number;
  };

  const yearGroups = computed((): YearGroup[] => {
    const map = new Map<number, Map<string, Video[]>>();

    for (const video of filteredVideos.value) {
      if (!video.published_at) continue;
      const date = new Date(video.published_at);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${String(month).padStart(2, "0")}`;

      if (!map.has(year)) map.set(year, new Map());
      const yearMap = map.get(year)!;
      if (!yearMap.has(monthKey)) yearMap.set(monthKey, []);
      yearMap.get(monthKey)!.push(video);
    }

    const groups: YearGroup[] = [];
    // 新しい年が先
    const sortedYears = [...map.keys()].sort((a, b) => b - a);

    for (const year of sortedYears) {
      const yearMap = map.get(year)!;
      const months: MonthGroup[] = [];
      // 新しい月が先
      const sortedMonthKeys = [...yearMap.keys()].sort((a, b) =>
        b.localeCompare(a),
      );

      for (const key of sortedMonthKeys) {
        const month = parseInt(key.split("-")[1] ?? "1", 10);
        months.push({
          key,
          label: `${month}月`,
          videos: yearMap.get(key)!,
        });
      }

      groups.push({
        year,
        months,
        totalCount: months.reduce((sum, m) => sum + m.videos.length, 0),
      });
    }

    return groups;
  });

  // 年ナビゲーション用
  const availableYears = computed(() => yearGroups.value.map((g) => g.year));

  const scrollToYear = (year: number) => {
    const el = document.getElementById(`year-${year}`);
    // scrollIntoView はモバイルブラウザで window レベルのスクロールも引き起こし
    // ヘッダーが画面外に消える問題があるため、scrollContainer.scrollTo を使って
    // <main> のスクロールのみに限定する
    if (!el || !scrollContainer) return;
    const containerRect = scrollContainer.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const targetScrollTop =
      scrollContainer.scrollTop + (elRect.top - containerRect.top);
    scrollContainer.scrollTo({ top: targetScrollTop, behavior: "smooth" });
  };

  // 動画の日付フォーマット
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 動画カードクリック: 動画の全楽曲をキューに追加して先頭から再生
  const addingVideoId = ref<string | null>(null);
  const toast = useToast();

  const handleVideoClick = async (video: Video) => {
    if (addingVideoId.value) return; // 多重クリック防止
    addingVideoId.value = video.id;
    try {
      const { fetchVideoWithSongs } = useVideos();
      const videoWithSongs = await fetchVideoWithSongs(video.id);

      if (!videoWithSongs?.songs?.length) {
        toast.warning("この動画には楽曲情報がありません");
        return;
      }

      const { usePlayerQueue } = await import("~/stores/usePlayerQueue");
      const queueStore = usePlayerQueue();

      const songs = videoWithSongs.songs.map((song) => ({
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
        addedFrom: "search" as const,
      }));

      songs.forEach((song) => queueStore.addToQueue(song));
      toast.success(
        `「${videoWithSongs.title}」の${songs.length}曲をキューに追加しました`,
      );
    } catch {
      toast.error("楽曲の取得に失敗しました");
    } finally {
      addingVideoId.value = null;
    }
  };

  // 年ジャンプナビ: スクロール量と現在表示中の年を追跡
  // レイアウトの <main class="overflow-y-auto"> がスクロールコンテナのため
  // window ではなく main 要素のスクロールを監視する
  const scrollTop = ref(0);
  const showSideNav = computed(() => scrollTop.value > 200);

  // スクロール位置から現在の年を導出（ビューポート上端を超えた最後の年セクション）
  const activeYear = computed<number | null>(() => {
    if (!import.meta.client) return null;
    void scrollTop.value;
    let current: number | null = null;
    for (const year of availableYears.value) {
      const el = document.getElementById(`year-${year}`);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= 120) {
        current = year;
      }
    }
    return current ?? availableYears.value[0] ?? null;
  });

  // モバイル用: 前後の年（availableYears は新しい順）
  const prevYear = computed(() => {
    if (activeYear.value === null) return null;
    const idx = availableYears.value.indexOf(activeYear.value);
    return idx > 0 ? (availableYears.value[idx - 1] ?? null) : null;
  });
  const nextYear = computed(() => {
    if (activeYear.value === null) return null;
    const idx = availableYears.value.indexOf(activeYear.value);
    return idx < availableYears.value.length - 1
      ? (availableYears.value[idx + 1] ?? null)
      : null;
  });
  // モバイル判定（lg ブレークポイント: 1024px）
  const isMobile = ref(true);
  let scrollContainer: HTMLElement | null = null;
  let scrollHandler: (() => void) | null = null;
  let resizeHandler: (() => void) | null = null;

  onMounted(() => {
    scrollContainer = document.querySelector("main");
    if (!scrollContainer) return;
    scrollHandler = () => {
      scrollTop.value = scrollContainer!.scrollTop;
    };
    scrollContainer.addEventListener("scroll", scrollHandler, {
      passive: true,
    });

    resizeHandler = () => {
      isMobile.value = window.innerWidth < 1024;
    };
    resizeHandler(); // 初期チェック
    window.addEventListener("resize", resizeHandler);
  });

  onUnmounted(() => {
    if (scrollContainer && scrollHandler) {
      scrollContainer.removeEventListener("scroll", scrollHandler);
    }
    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
    }
  });
</script>

<template>
  <div class="container mx-auto px-4 py-8 pb-32">
    <!-- ページヘッダー -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">📅 タイムライン</h1>
      <p class="text-gray-600">
        全{{ filteredVideos.length }}件の動画を時系列で表示
      </p>

      <!-- フィルター & 年ナビ -->
      <div class="mt-6 flex flex-col gap-3">
        <!-- 種別フィルター -->
        <div class="flex gap-2">
          <button
            v-for="f in [
              { key: 'all' as VideoFilter, label: 'すべて', icon: '🎬' },
              { key: 'song' as VideoFilter, label: '歌動画', icon: '🎵' },
              { key: 'stream' as VideoFilter, label: '歌枠', icon: '🎤' },
            ]"
            :key="f.key"
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            :class="
              activeFilter === f.key
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
            @click="activeFilter = f.key"
          >
            {{ f.icon }} {{ f.label }}
          </button>
        </div>

        <!-- 年ジャンプ -->
        <div v-if="availableYears.length > 0" class="flex gap-2 flex-wrap">
          <button
            v-for="year in availableYears"
            :key="year"
            class="px-3 py-1 rounded-md text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            @click="scrollToYear(year)"
          >
            {{ year }}
          </button>
        </div>
      </div>
    </div>

    <!-- ローディング -->
    <div v-if="loading" class="text-center py-16">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      />
      <p class="mt-3 text-gray-600">動画を読み込み中...</p>
    </div>

    <!-- エラー -->
    <div v-else-if="error" class="text-center py-16">
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        @click="refresh()"
      >
        再試行
      </button>
    </div>

    <!-- タイムライン本体 -->
    <div v-else-if="yearGroups.length > 0" class="relative">
      <!-- 縦ライン -->
      <div
        class="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-gray-200"
        aria-hidden="true"
      />

      <div class="space-y-12">
        <section
          v-for="yearGroup in yearGroups"
          :key="yearGroup.year"
          :id="`year-${yearGroup.year}`"
          class="scroll-mt-20"
        >
          <!-- 年ヘッダー -->
          <div class="relative flex items-center mb-8">
            <div
              class="relative z-10 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-800 text-white font-bold text-lg sm:text-xl shadow-lg -ml-3 sm:-ml-2"
            >
              {{ yearGroup.year }}
            </div>
            <div class="ml-4">
              <span class="text-sm text-gray-500">
                {{ yearGroup.totalCount }}件の動画
              </span>
            </div>
          </div>

          <!-- 月グループ -->
          <div class="space-y-8">
            <div
              v-for="monthGroup in yearGroup.months"
              :key="monthGroup.key"
              class="relative pl-12 sm:pl-16"
            >
              <!-- 月マーカー -->
              <div class="absolute left-2.5 sm:left-4 top-1">
                <div
                  class="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow"
                />
              </div>

              <!-- 月ラベル -->
              <div class="mb-4">
                <h3 class="text-lg font-semibold text-gray-800">
                  {{ monthGroup.label }}
                  <span class="text-sm font-normal text-gray-400 ml-2">
                    {{ monthGroup.videos.length }}件
                  </span>
                </h3>
              </div>

              <!-- 動画サムネイルグリッド -->
              <div
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
              >
                <button
                  v-for="video in monthGroup.videos"
                  :key="video.id"
                  class="group relative rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  :class="{
                    'opacity-60 cursor-wait': addingVideoId === video.id,
                  }"
                  :title="video.title"
                  :disabled="addingVideoId !== null"
                  @click="handleVideoClick(video)"
                >
                  <!-- サムネイル -->
                  <div
                    class="relative aspect-video bg-gray-100 overflow-hidden"
                  >
                    <img
                      :src="video.thumbnail_path"
                      :alt="video.title"
                      class="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />

                    <!-- 種別バッジ -->
                    <div class="absolute top-1 left-1">
                      <span
                        class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold shadow"
                        :class="
                          video.is_stream
                            ? 'bg-purple-600 text-white'
                            : 'bg-green-600 text-white'
                        "
                      >
                        {{ video.is_stream ? "歌枠" : "歌動画" }}
                      </span>
                    </div>

                    <!-- 楽曲数バッジ -->
                    <div
                      v-if="video.songs_count && video.songs_count > 0"
                      class="absolute bottom-1 right-1"
                    >
                      <span
                        class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white"
                      >
                        🎵 {{ video.songs_count }}
                      </span>
                    </div>

                    <!-- ホバーオーバーレイ -->
                    <div
                      class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center"
                    >
                      <!-- 読み込み中スピナー -->
                      <div
                        v-if="addingVideoId === video.id"
                        class="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin"
                      />
                      <!-- キュー追加アイコン -->
                      <svg
                        v-else
                        class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19 11H13V5a1 1 0 0 0-2 0v6H5a1 1 0 0 0 0 2h6v6a1 1 0 0 0 2 0v-6h6a1 1 0 0 0 0-2z"
                        />
                      </svg>
                    </div>
                  </div>

                  <!-- 動画情報 -->
                  <div class="p-2">
                    <p
                      class="text-xs text-gray-800 font-medium line-clamp-2 leading-tight"
                    >
                      {{ video.title }}
                    </p>
                    <p class="text-[10px] text-gray-400 mt-1">
                      {{ formatDate(video.published_at) }}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- データなし -->
    <div v-else class="text-center py-16">
      <div class="text-gray-400 text-6xl mb-4">📅</div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">
        該当する動画がありません
      </h3>
      <p class="text-gray-600">フィルターを変更してみてください</p>
    </div>

    <!-- 右サイド固定年ナビ -->
    <Transition name="side-nav">
      <nav
        v-if="showSideNav && availableYears.length > 0"
        class="fixed right-4 lg:right-100 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-1.5"
        aria-label="年ジャンプ"
      >
        <button
          v-for="year in availableYears"
          :key="year"
          class="w-16 py-1.5 rounded-lg text-sm font-bold transition-all duration-150 shadow-md text-center"
          :class="
            activeYear === year
              ? 'bg-gray-800 text-white scale-110 shadow-lg'
              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-gray-800 hover:text-white border border-gray-200'
          "
          @click="scrollToYear(year)"
        >
          {{ year }}
        </button>
      </nav>
    </Transition>

    <!-- モバイル専用: 前後の年ジャンプボタン -->
    <template v-if="showSideNav && isMobile">
      <Transition name="year-btn">
        <button
          v-if="prevYear !== null"
          class="year-jump-btn fixed top-20 left-1/2 -translate-x-1/2 z-30 lg:hidden"
          :aria-label="`${prevYear}年へ移動`"
          @click="scrollToYear(prevYear!)"
        >
          <span>↑</span>
          <span>{{ prevYear }}</span>
        </button>
      </Transition>
      <Transition name="year-btn-down">
        <button
          v-if="nextYear !== null"
          class="year-jump-btn fixed bottom-24 left-1/2 -translate-x-1/2 z-30 lg:hidden"
          :aria-label="`${nextYear}年へ移動`"
          @click="scrollToYear(nextYear!)"
        >
          <span>{{ nextYear }}</span>
          <span>↓</span>
        </button>
      </Transition>
    </template>
  </div>
</template>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* 右サイドナビのスライドインアニメーション */
  .side-nav-enter-active,
  .side-nav-leave-active {
    transition:
      opacity 0.25s ease,
      transform 0.25s ease;
  }
  .side-nav-enter-from,
  .side-nav-leave-to {
    opacity: 0;
    transform: translateY(-50%) translateX(1rem);
  }
  .side-nav-enter-to,
  .side-nav-leave-from {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }

  /* モバイル年ジャンプボタン */
  .year-jump-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.4rem 1rem;
    border-radius: 9999px;
    background: rgba(31, 41, 55, 0.7);
    backdrop-filter: blur(6px);
    color: #fff;
    font-size: 0.875rem;
    font-weight: 700;
    border: none;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  }

  .year-btn-enter-active,
  .year-btn-leave-active,
  .year-btn-down-enter-active,
  .year-btn-down-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }
  .year-btn-enter-from,
  .year-btn-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-8px);
  }
  .year-btn-enter-to,
  .year-btn-leave-from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  .year-btn-down-enter-from,
  .year-btn-down-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
  }
  .year-btn-down-enter-to,
  .year-btn-down-leave-from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
</style>
