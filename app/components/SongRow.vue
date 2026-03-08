<template>
  <div :class="rowClasses">
    <!-- モバイル表示 -->
    <div :class="SONG_ROW_STYLES.mobile.wrapper">
      <div :class="SONG_ROW_STYLES.mobile.content">
        <!-- サムネイル（モバイル） -->
        <div
          :class="SONG_ROW_STYLES.thumbnail.wrapperMobile"
          @click="clickSong"
        >
          <div :class="SONG_ROW_STYLES.thumbnail.container">
            <img
              v-if="song.video.thumbnail_path"
              :src="song.video.thumbnail_path"
              :alt="song.title"
              :class="SONG_ROW_STYLES.thumbnail.image"
              loading="lazy"
              @error="handleImageError"
            />
            <span v-else :class="SONG_ROW_STYLES.thumbnail.placeholder"
              ><FontAwesomeIcon :icon="['fad', 'music-note']" /></span
            >
          </div>
          <!-- 再生状態インジケーター -->
          <div
            v-if="isActivelyPlaying"
            :class="SONG_ROW_STYLES.thumbnail.playingIndicator"
          >
            <div class="playing-indicator">
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
            </div>
          </div>
          <div
            v-else-if="isPaused"
            :class="SONG_ROW_STYLES.thumbnail.playingIndicator"
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
        <div :class="SONG_ROW_STYLES.info.wrapperMobile" @click="clickSong">
          <div :class="SONG_ROW_STYLES.info.titleContainer">
            <h3 :class="SONG_ROW_STYLES.info.titleMobile">
              {{ song.title }}
            </h3>
          </div>
          <p :class="SONG_ROW_STYLES.info.artistMobile">
            {{ song.artist }}
          </p>
        </div>

        <!-- モバイル用ボタングループ -->
        <div class="shrink-0 flex items-center gap-0 pr-2 ml-2" @click.stop>
          <!-- キューに追加ボタン -->
          <button
            @click="addToQueue"
            class="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600 hover:text-green-700 flex items-center justify-center"
            title="キューに追加"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
          <!-- メニューボタン -->
          <button
            ref="mobileMenuButton"
            @click="toggleMenu"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
            title="メニューを開く"
          >
            <svg
              :class="SONG_ROW_STYLES.menuButton.iconMobile"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path :d="SONG_ROW_ICONS.menu" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- デスクトップ表示 -->
    <div :class="SONG_ROW_STYLES.desktop.wrapper">
      <!-- サムネイル -->
      <div :class="SONG_ROW_STYLES.thumbnail.wrapperDesktop" @click="clickSong">
        <div :class="SONG_ROW_STYLES.thumbnail.container">
          <img
            v-if="song.video.thumbnail_path"
            :src="song.video.thumbnail_path"
            :alt="song.title"
            :class="SONG_ROW_STYLES.thumbnail.image"
            loading="lazy"
            @error="handleImageError"
          />
          <span v-else :class="SONG_ROW_STYLES.thumbnail.placeholder"><FontAwesomeIcon :icon="['fad', 'music-note']" /></span>
        </div>
        <!-- 再生状態インジケーター -->
        <div
          v-if="isActivelyPlaying"
          :class="SONG_ROW_STYLES.thumbnail.playingIndicator"
        >
          <div class="playing-indicator">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          </div>
        </div>
        <div
          v-else-if="isPaused"
          :class="SONG_ROW_STYLES.thumbnail.playingIndicator"
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
      <div :class="SONG_ROW_STYLES.info.wrapperDesktop" @click="clickSong">
        <div :class="SONG_ROW_STYLES.info.titleContainer">
          <h3 :class="SONG_ROW_STYLES.info.titleDesktop">
            {{ song.title }}
          </h3>
          <span v-if="song.is_original" :class="SONG_ROW_STYLES.info.badge">
            オリジナル
          </span>
        </div>
        <p :class="SONG_ROW_STYLES.info.artistDesktop">
          {{ song.artist }}
        </p>
      </div>

      <!-- デスクトップ用ボタングループ -->
      <div
        :class="SONG_ROW_STYLES.menuButton.wrapperDesktop"
        class="flex items-center gap-2"
        @click.stop
      >
        <!-- キューに追加ボタン -->
        <button
          @click="addToQueue"
          class="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600 hover:text-green-700"
          title="キューに追加"
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
        </button>
        <!-- メニューボタン -->
        <button
          ref="desktopMenuButton"
          @click="toggleMenu"
          :class="SONG_ROW_STYLES.menuButton.buttonDesktop"
          title="メニューを開く"
        >
          <svg
            :class="SONG_ROW_STYLES.menuButton.iconDesktop"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path :d="SONG_ROW_ICONS.menu" />
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
        :class="SONG_ROW_STYLES.contextMenu.container"
        @click.stop
      >
        <button
          @click="handleMenuAction(addToPlaylist)"
          :class="SONG_ROW_STYLES.contextMenu.menuItem"
        >
          <svg
            :class="SONG_ROW_STYLES.contextMenu.iconPurple"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="SONG_ROW_ICONS.playlist"
            />
          </svg>
          <span>プレイリストに追加</span>
        </button>
        <NuxtLink
          :to="`/songs/${song.id}`"
          @click="closeMenu"
          :class="SONG_ROW_STYLES.contextMenu.menuItem"
        >
          <svg
            :class="SONG_ROW_STYLES.contextMenu.iconBlue"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="SONG_ROW_ICONS.info"
            />
          </svg>
          <span>楽曲詳細を開く</span>
        </NuxtLink>
        <a
          :href="youtubeUrl"
          target="_blank"
          rel="noopener noreferrer"
          @click="handleYouTubeClick"
          :class="SONG_ROW_STYLES.contextMenu.menuItem"
        >
          <svg
            :class="SONG_ROW_STYLES.contextMenu.iconRed"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path :d="SONG_ROW_ICONS.youtube" />
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

<script setup lang="ts">
  import { computed, ref, onMounted, onBeforeUnmount } from "vue";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";
  import { usePlayerStore } from "~/stores/player";
  import { SONG_ROW_STYLES, SONG_ROW_ICONS } from "~/constants/songRowStyles";
  import type { Song } from "~/types/song";

  // グローバルな現在開いているメニューの管理
  // （他のSongRowインスタンスと共有される）
  const globalOpenMenuId = useState<string | null>(
    "songRowOpenMenuId",
    () => null
  );

  // Props
  const props = defineProps<{
    song: Song;
  }>();

  // Stores
  const queue = usePlayerQueue();
  const player = usePlayerStore();
  const analytics = useAnalytics();
  const uiContext = useUIContext();
  const { addSongToPlaylist: addSongToPlaylistFn, getPlaylistById } =
    useLocalPlaylist();

  // Emits（外部との互換性を保持）
  const emit = defineEmits<{
    "play-now": [song: Song];
    "add-to-queue": [song: Song];
    "add-to-playlist": [payload: { song: Song; playlistId: string }];
  }>();

  // プレイリストモーダル
  const showAddToPlaylistModal = ref(false);

  // このコンポーネントインスタンスの一意なID
  const instanceId = ref(Math.random().toString(36).substr(2, 9));

  // メニュー表示状態（このインスタンスのメニューが開いているか）
  const showMenu = computed(() => globalOpenMenuId.value === instanceId.value);

  // メニューボタンの参照
  const mobileMenuButton = ref<HTMLButtonElement | null>(null);
  const desktopMenuButton = ref<HTMLButtonElement | null>(null);

  // メニューの位置
  const menuPosition = ref<Record<string, string>>({});

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
  const handleMenuAction = (action: () => void) => {
    action();
    closeMenu();
  };

  // メニュー外クリックで閉じる
  const handleClickOutside = (event: MouseEvent) => {
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
    // アナリティクス: 楽曲再生を追跡
    analytics.trackSongPlay(props.song);

    // ユーザーインタラクション記録（モバイル対応強化）
    player.setUserInteracted(true);

    // 新しいキューとして設定して即座に再生
    queue.setQueue([props.song]);
    queue.play(0); // これが内部的にplayCurrentTrack()を呼び出すため、player.play()は不要
    emit("play-now", props.song);
  };

  // サムネイル・曲情報クリック時の再生（前プロジェクトスタイル）
  const clickSong = () => {
    console.log("Song clicked:", props.song.title);
    playNow();
  };

  // キューまたはプレイリストに追加
  const addToQueue = async () => {
    const toast = useToast();

    // UIコンテキストに応じて追加先を判定
    if (uiContext.isPlaylistMode && uiContext.selectedPlaylistId) {
      // プレイリストモードで、かつプレイリストが選択されている場合はプレイリストに追加
      const playlistId = uiContext.selectedPlaylistId;
      const playlist = getPlaylistById(playlistId);

      if (!playlist) {
        toast.error("プレイリストが見つかりません");
        return;
      }

      try {
        await addSongToPlaylistFn(playlistId, props.song.id);
        console.log("Adding to playlist:", props.song.title);
        toast.success(`「${props.song.title}」をプレイリストに追加しました`);

        // アナリティクス: プレイリストに追加を追跡
        analytics.trackPlaylistAction(
          "add_song",
          playlistId,
          playlist.name,
          props.song.id,
          props.song.title
        );
      } catch (e) {
        console.warn("Failed to add to playlist:", e);
        // エラーメッセージは useLocalPlaylist 内で設定されている
      }
    } else {
      // キューモード、またはプレイリスト一覧表示時はキューに追加
      console.log("Adding to queue:", props.song.title);

      // アナリティクス: キューに追加を追跡
      analytics.trackAddToQueue(props.song);

      queue.addToQueue(props.song);
      emit("add-to-queue", props.song);
      
      toast.success(`「${props.song.title}」をキューに追加しました`);

      // プレイリストモードだがプレイリストが選択されていない場合、キュータブに切り替え
      if (uiContext.isPlaylistMode) {
        uiContext.setRightPanelMode("queue");
      }
    }
  };

  // プレイリストに追加
  const addToPlaylist = () => {
    console.log("Opening playlist modal for:", props.song.title);
    showAddToPlaylistModal.value = true;
  };

  // プレイリスト追加完了ハンドラ
  const handlePlaylistAdded = (playlistId: string) => {
    console.log("Song added to playlist:", playlistId);

    // プレイリスト名を取得
    const { getPlaylistById } = useLocalPlaylist();
    const playlist = getPlaylistById(playlistId);
    const playlistName = playlist?.name || undefined;

    // アナリティクス: プレイリストに追加を追跡
    analytics.trackPlaylistAction(
      "add_song",
      playlistId,
      playlistName,
      props.song.id,
      props.song.title
    );

    showAddToPlaylistModal.value = false;
    emit("add-to-playlist", { song: props.song, playlistId });
  };

  // YouTubeリンククリックハンドラ
  const handleYouTubeClick = () => {
    // アナリティクス: YouTubeリンククリックを追跡
    if (props.song.video) {
      analytics.trackYouTubeClick(
        props.song.id,
        props.song.title,
        props.song.video.id
      );
    }
    closeMenu();
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
  const rowClasses = computed(() =>
    isCurrentlyPlaying.value
      ? `${SONG_ROW_STYLES.container.base} ${SONG_ROW_STYLES.container.active} -active`
      : SONG_ROW_STYLES.container.base
  );

  // 画像読み込みエラーハンドリング
  const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement;
    target.style.display = "none";
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
