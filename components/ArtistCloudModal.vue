<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80"
        @click.self="closeModal"
      >
        <div
          class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        >
          <!-- ヘッダー -->
          <div class="flex items-center justify-between p-6 border-b">
            <h2 class="text-xl font-bold text-gray-900">アーティストを選択</h2>
            <button
              class="text-gray-400 hover:text-gray-600 transition-colors"
              @click="closeModal"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- 検索ボックス -->
          <div class="p-6 border-b">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="アーティスト名で絞り込み..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- タグクラウド -->
          <div class="flex-1 overflow-y-auto p-6">
            <div
              v-if="filteredArtistsWithCount.length > 0"
              class="flex flex-wrap gap-2 justify-center"
            >
              <!-- 「全アーティスト」ボタン -->
              <button
                :class="[
                  'px-3 py-1.5 rounded-lg font-medium transition-all',
                  selectedArtist === ''
                    ? 'bg-blue-600 text-white shadow-lg border-2 border-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  'text-sm',
                ]"
                @click="selectArtist('')"
              >
                全アーティスト
                <span class="text-xs opacity-75 ml-1"
                  >({{ totalSongCount }})</span
                >
              </button>

              <!-- アーティストボタン（楽曲数に応じてサイズ変更） -->
              <button
                v-for="artist in filteredArtistsWithCount"
                :key="artist.name"
                :class="[
                  'px-3 py-1.5 rounded-lg font-medium transition-all',
                  selectedArtist === artist.name
                    ? 'bg-blue-600 text-white shadow-lg border-2 border-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  getSizeClass(artist.count),
                ]"
                @click="selectArtist(artist.name)"
              >
                {{ artist.name }}
                <span class="text-xs opacity-75 ml-1"
                  >({{ artist.count }})</span
                >
              </button>
            </div>
            <div v-else class="text-center py-12 text-gray-500">
              該当するアーティストが見つかりません
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  const props = defineProps({
    isOpen: {
      type: Boolean,
      required: true,
    },
    selectedArtist: {
      type: String,
      default: "",
    },
    artists: {
      type: Array,
      required: true,
    },
    songs: {
      type: Array,
      required: true,
    },
  });

  const emit = defineEmits(["close", "select"]);

  // リアクティブデータ
  const searchQuery = ref("");

  // 各アーティストの楽曲数を計算
  const artistsWithCount = computed(() => {
    const countMap = {};
    props.songs.forEach((song) => {
      const artist = song.artist;
      countMap[artist] = (countMap[artist] || 0) + 1;
    });

    return props.artists
      .map((artist) => ({
        name: artist,
        count: countMap[artist] || 0,
      }))
      .sort((a, b) => b.count - a.count); // 楽曲数の多い順にソート
  });

  // 総楽曲数
  const totalSongCount = computed(() => props.songs.length);

  // 検索でフィルタリングされたアーティスト
  const filteredArtistsWithCount = computed(() => {
    if (!searchQuery.value.trim()) {
      return artistsWithCount.value;
    }

    const searchTerm = searchQuery.value.toLowerCase().trim();
    return artistsWithCount.value.filter((artist) =>
      artist.name.toLowerCase().includes(searchTerm)
    );
  });

  // 楽曲数に応じたサイズクラスを返す
  const getSizeClass = (count) => {
    const maxCount = Math.max(...artistsWithCount.value.map((a) => a.count));
    const ratio = count / maxCount;

    if (ratio > 0.7) {
      return "text-lg"; // 最大サイズ
    } else if (ratio > 0.4) {
      return "text-base"; // 大きめ
    } else if (ratio > 0.2) {
      return "text-sm"; // 中サイズ
    } else {
      return "text-xs"; // 小サイズ
    }
  };

  // メソッド
  const closeModal = () => {
    searchQuery.value = ""; // 検索クエリをリセット
    emit("close");
  };

  const selectArtist = (artistName) => {
    emit("select", artistName);
    closeModal();
  };

  // ESCキーでモーダルを閉じる
  onMounted(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && props.isOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEscape);
    onUnmounted(() => {
      window.removeEventListener("keydown", handleEscape);
    });
  });
</script>

<style scoped>
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .modal-enter-active .bg-white,
  .modal-leave-active .bg-white {
    transition: transform 0.3s ease;
  }

  .modal-enter-from .bg-white,
  .modal-leave-to .bg-white {
    transform: scale(0.95);
  }
</style>
