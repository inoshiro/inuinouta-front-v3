<template>
  <div :class="rowClasses">
    <!-- モバイル表示 -->
    <div class="block md:hidden">
      <div class="flex items-stretch min-h-[72px]">
        <!-- サムネイル（モバイル） -->
        <div
          class="flex-shrink-0 w-12 h-9 my-auto ml-3 relative cursor-pointer"
          @click="clickSong"
        >
          <div
            class="w-full h-full bg-gray-200 rounded border border-gray-300 flex items-center justify-center overflow-hidden"
          >
            <img
              v-if="song.video.thumbnail_path"
              :src="song.video.thumbnail_path"
              :alt="song.title"
              class="w-full h-full object-cover"
              loading="lazy"
              @error="handleImageError"
            />
            <span v-else class="text-xs text-gray-400">🎵</span>
          </div>
          <!-- 再生状態インジケーター -->
          <div
            v-if="isActivelyPlaying"
            class="absolute inset-0 flex items-center justify-center bg-black/80 rounded"
          >
            <div class="playing-indicator">
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
            </div>
          </div>
          <div
            v-else-if="isPaused"
            class="absolute inset-0 flex items-center justify-center bg-black/80 rounded"
          >
            <svg
              class="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>

        <!-- 楽曲情報（モバイル） -->
        <div class="flex-1 min-w-0 cursor-pointer py-2 px-3" @click="clickSong">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-sm font-medium text-gray-900 truncate">
              {{ song.title }}
            </h3>
            <span
              v-if="song.is_original"
              class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0"
            >
              オリジナル
            </span>
          </div>
          <p class="text-xs text-gray-500 truncate mb-1">
            {{ song.artist }}
          </p>
        </div>

        <!-- モバイル用メニューボタン -->
        <div class="flex-shrink-0 flex items-center pr-2" @click.stop>
          <button
            ref="mobileMenuButton"
            @click="toggleMenu"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="メニューを開く"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- デスクトップ表示 -->
    <div class="hidden md:flex items-stretch p-0 min-h-[80px]">
      <!-- サムネイル -->
      <div
        class="flex-shrink-0 w-16 h-12 my-auto ml-4 mr-4 relative cursor-pointer"
        @click="clickSong"
      >
        <div
          class="w-full h-full bg-gray-200 rounded border border-gray-300 flex items-center justify-center overflow-hidden"
        >
          <img
            v-if="song.video.thumbnail_path"
            :src="song.video.thumbnail_path"
            :alt="song.title"
            class="w-full h-full object-cover"
            loading="lazy"
            @error="handleImageError"
          />
          <span v-else class="text-xs text-gray-400">🎵</span>
        </div>
        <!-- 再生状態インジケーター -->
        <div
          v-if="isActivelyPlaying"
          class="absolute inset-0 flex items-center justify-center bg-black/80 rounded"
        >
          <div class="playing-indicator">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          </div>
        </div>
        <div
          v-else-if="isPaused"
          class="absolute inset-0 flex items-center justify-center bg-black/80 rounded"
        >
          <svg
            class="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>

      <!-- 楽曲情報 -->
      <div class="flex-1 min-w-0 cursor-pointer py-4" @click="clickSong">
        <div class="flex items-center space-x-2 mb-1">
          <h3 class="text-sm font-medium text-gray-900 truncate">
            {{ song.title }}
          </h3>
          <span
            v-if="song.is_original"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
          >
            オリジナル
          </span>
        </div>
        <p class="text-sm text-gray-500 truncate">
          {{ song.artist }}
        </p>
      </div>

      <!-- デスクトップ用メニューボタン -->
      <div class="flex-shrink-0 flex items-center py-4 pr-4" @click.stop>
        <button
          ref="desktopMenuButton"
          @click="toggleMenu"
          class="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-150"
          title="メニューを開く"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- コンテキストメニュー（Teleportでbody直下にレンダリング） -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="showMenu"
        :style="menuPosition"
        class="fixed w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[9999]"
        @click.stop
      >
        <button
          @click="handleMenuAction(addToQueue)"
          class="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <svg
            class="w-5 h-5 text-green-600"
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
          <span>キューに追加</span>
        </button>
        <button
          @click="handleMenuAction(addToPlaylist)"
          class="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <svg
            class="w-5 h-5 text-purple-600"
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
          <span>プレイリストに追加</span>
        </button>
        <NuxtLink
          :to="`/songs/${song.id}`"
          @click="closeMenu"
          class="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <svg
            class="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>楽曲詳細を開く</span>
        </NuxtLink>
        <a
          :href="youtubeUrl"
          target="_blank"
          rel="noopener noreferrer"
          @click="closeMenu"
          class="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <svg
            class="w-5 h-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
            />
          </svg>
          <span>YouTubeで開く</span>
        </a>
      </div>
    </Transition>
  </Teleport>

  <!-- プレイリスト追加モーダル（Teleportでbody直下にレンダリング） -->
  <Teleport to="body">
    <AddToPlaylistModal
      :is-open="showAddToPlaylistModal"
      :song="song"
      @close="showAddToPlaylistModal = false"
      @added="handlePlaylistAdded"
    />
  </Teleport>
</template>

<script setup>
  import { computed, ref, onMounted, onBeforeUnmount } from "vue";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";
  import { usePlayerStore } from "~/stores/player";

  // グローバルな現在開いているメニューの管理
  // （他のSongRowインスタンスと共有される）
  const globalOpenMenuId = useState("songRowOpenMenuId", () => null);

  // Props
  const props = defineProps({
    song: {
      type: Object,
      required: true,
    },
  });

  // Stores
  const queue = usePlayerQueue();
  const player = usePlayerStore();

  // Emits（外部との互換性を保持）
  const emit = defineEmits(["play-now", "add-to-queue", "add-to-playlist"]);

  // プレイリストモーダル
  const showAddToPlaylistModal = ref(false);

  // このコンポーネントインスタンスの一意なID
  const instanceId = ref(Math.random().toString(36).substr(2, 9));

  // メニュー表示状態（このインスタンスのメニューが開いているか）
  const showMenu = computed(() => globalOpenMenuId.value === instanceId.value);

  // メニューボタンの参照
  const mobileMenuButton = ref(null);
  const desktopMenuButton = ref(null);

  // メニューの位置
  const menuPosition = ref({});

  // メニューの位置を計算
  const calculateMenuPosition = () => {
    // モバイルとデスクトップの両方のボタンをチェック
    let button = null;

    // まずモバイルボタンをチェック（表示されているか確認）
    if (mobileMenuButton.value) {
      const rect = mobileMenuButton.value.getBoundingClientRect();
      // ボタンが実際に表示されている場合（幅と高さが0でない）
      if (rect.width > 0 && rect.height > 0) {
        button = mobileMenuButton.value;
      }
    }

    // モバイルボタンが見つからない場合、デスクトップボタンをチェック
    if (!button && desktopMenuButton.value) {
      const rect = desktopMenuButton.value.getBoundingClientRect();
      // ボタンが実際に表示されている場合（幅と高さが0でない）
      if (rect.width > 0 && rect.height > 0) {
        button = desktopMenuButton.value;
      }
    }

    if (!button) {
      console.error("Menu button not found or not visible");
      return;
    }

    const rect = button.getBoundingClientRect();
    const menuWidth = 224; // w-56 = 14rem = 224px
    const menuHeight = 180; // 概算（3つのメニュー項目）

    // 画面の右端に近い場合は左に表示
    let left = rect.right - menuWidth;
    if (left < 10) {
      left = rect.left;
    }

    // 画面の下端に近い場合は上に表示
    let top = rect.bottom + 4;
    if (top + menuHeight > window.innerHeight) {
      top = rect.top - menuHeight - 4;
    }

    // 念のため範囲チェック
    if (left < 0) left = 10;
    if (top < 0) top = 10;

    menuPosition.value = {
      left: `${left}px`,
      top: `${top}px`,
    };
  };

  // メニューの開閉
  const toggleMenu = () => {
    if (globalOpenMenuId.value === instanceId.value) {
      // 既に開いている場合は閉じる
      globalOpenMenuId.value = null;
    } else {
      // 他のメニューが開いている場合は閉じて、このメニューを開く
      calculateMenuPosition();
      globalOpenMenuId.value = instanceId.value;
    }
  };

  const closeMenu = () => {
    if (globalOpenMenuId.value === instanceId.value) {
      globalOpenMenuId.value = null;
    }
  };

  // メニューアクション実行後に閉じる
  const handleMenuAction = (action) => {
    action();
    closeMenu();
  };

  // メニュー外クリックで閉じる
  const handleClickOutside = (event) => {
    if (showMenu.value) {
      closeMenu();
    }
  };

  // スクロール時にメニューを閉じる
  const handleScroll = () => {
    if (showMenu.value) {
      closeMenu();
    }
  };

  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("click", handleClickOutside);
    window.removeEventListener("scroll", handleScroll, true);
  });

  // 直接再生（前プロジェクトのclickSongを参考）
  const playNow = () => {
    // ユーザーインタラクション記録（モバイル対応強化）
    player.setUserInteracted(true);

    // 新しいキューとして設定して即座に再生
    queue.setQueue([props.song]);
    queue.play(0);
    emit("play-now", props.song);

    // 再生コマンドを確実に実行（旧プロジェクトの手法）
    setTimeout(() => {
      if (player.ytPlayer && player.isPlayerReady) {
        player.play();
      }
    }, 100);
  };

  // サムネイル・曲情報クリック時の再生（前プロジェクトスタイル）
  const clickSong = () => {
    console.log("Song clicked:", props.song.title);
    playNow();
  };

  // キューに追加
  const addToQueue = () => {
    console.log("Adding to queue:", props.song.title);
    queue.addToQueue(props.song);
    emit("add-to-queue", props.song);
  };

  // プレイリストに追加
  const addToPlaylist = () => {
    console.log("Opening playlist modal for:", props.song.title);
    showAddToPlaylistModal.value = true;
  };

  // プレイリスト追加完了ハンドラ
  const handlePlaylistAdded = (playlistId) => {
    console.log("Song added to playlist:", playlistId);
    showAddToPlaylistModal.value = false;
    emit("add-to-playlist", { song: props.song, playlistId });
  };

  // 現在再生中の楽曲かどうか（シンプルな判定）
  const isCurrentlyPlaying = computed(() => {
    return queue.nowPlaying?.id === props.song.id;
  });

  // 再生中且つ実際に音楽が流れているかどうか
  const isActivelyPlaying = computed(() => {
    return isCurrentlyPlaying.value && player.isPlaying;
  });

  // 一時停止中かどうか
  const isPaused = computed(() => {
    return (
      isCurrentlyPlaying.value &&
      !player.isPlaying &&
      player.playerState === "PAUSED"
    );
  });

  // 計算プロパティ（メモ化）
  const youtubeUrl = computed(() => {
    const base = "https://youtube.com/watch?";
    const params = new URLSearchParams();
    params.append("v", props.song.video.id);
    if (props.song.start_at) {
      params.append("t", props.song.start_at.toString());
    }
    return base + params.toString();
  });

  // CSS動的クラス（前プロジェクトのようにシンプルに）
  const rowClasses = computed(() => [
    "song-row border-b border-gray-200 transition-colors duration-150",
    isCurrentlyPlaying.value
      ? "bg-blue-50 hover:bg-blue-100 -active"
      : "bg-white hover:bg-gray-50",
  ]);

  // 画像読み込みエラーハンドリング
  const handleImageError = (event) => {
    event.target.style.display = "none";
  };
</script>

<style scoped>
  /* GPU 加速の最適化 */
  .song-row {
    transform: translateZ(0);
    will-change: background-color;
    contain: layout style paint;
    /* 高さを明示的に設定してレイアウトシフトを防ぐ */
    min-height: 80px; /* デスクトップ */
  }

  /* 前プロジェクトのようなアクティブ状態の強調 */
  .song-row.-active {
    background-color: rgb(239 246 255) !important; /* bg-blue-50 */
    border-color: rgb(147 197 253); /* border-blue-300 */
  }

  /* 再生中インジケーター（前プロジェクトスタイル） */
  .playing-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1px;
  }

  .playing-indicator .bar {
    width: 2px;
    height: 8px;
    background: white;
    animation: playing-animation 1s ease-in-out infinite;
  }

  .playing-indicator .bar:nth-child(1) {
    animation-delay: 0s;
  }

  .playing-indicator .bar:nth-child(2) {
    animation-delay: 0.2s;
  }

  .playing-indicator .bar:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes playing-animation {
    0%,
    100% {
      height: 4px;
    }
    50% {
      height: 12px;
    }
  }

  /* 画像の最適化 */
  .song-row img {
    transform: translateZ(0);
    will-change: auto;
  }

  /* ボタンのアニメーション最適化 */
  .song-row button {
    transform: translateZ(0);
    will-change: color, background-color;
  }

  /* モバイルでの高さ調整 */
  @media (max-width: 768px) {
    .song-row {
      min-height: 72px; /* モバイル */
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }

    .song-row button {
      min-height: 52px;
      min-width: 52px;
    }
  }

  /* デスクトップでの調整 */
  @media (min-width: 769px) {
    .song-row {
      min-height: 80px;
    }

    /* パディングの調整 */
    .song-row .hidden.md\\:flex {
      padding: 1rem; /* p-4 相当 */
    }
  }

  /* コンテンツが切れないようにするための調整 */
  .song-row .flex-1 {
    min-width: 0;
    overflow: hidden;
  }

  .song-row .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ボーダーの調整 */
  .song-row:last-child {
    border-bottom: none;
  }
</style>
