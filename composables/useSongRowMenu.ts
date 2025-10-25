import { ref, watch, onMounted, onUnmounted } from "vue";
import type { Song } from "~/types/song";

/**
 * 楽曲行のコンテキストメニュー管理用Composable
 * SongRowとStreamRowで共通化
 */
export const useSongRowMenu = (menuStateKey: string = "songRowOpenMenuId") => {
  // グローバルなメニュー状態（複数のコンポーネントで共有）
  const globalOpenMenuId = useState<string | null>(menuStateKey, () => null);

  // このインスタンス用のユニークID
  const instanceId = ref(crypto.randomUUID());

  // 現在開いているメニューのID（楽曲IDやユニークキー）
  const openMenuId = ref<string | number | null>(null);

  // メニューの表示位置
  const menuPosition = ref({ top: 0, left: 0 });

  // プレイリスト追加モーダル
  const showPlaylistModal = ref(false);
  const selectedSong = ref<Song | null>(null);

  /**
   * メニューを開く
   * @param itemId 楽曲IDなどのユニークな識別子
   * @param event クリックイベント
   */
  const openMenu = (itemId: string | number, event: MouseEvent) => {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    // メニューのサイズ
    const menuWidth = 224; // w-56 = 14rem = 224px
    const menuHeight = 250; // おおよその高さ

    let left = rect.right + 8;
    let top = rect.top;

    // 画面右端に収まらない場合は左側に表示
    if (left + menuWidth > window.innerWidth) {
      left = rect.left - menuWidth - 8;
    }

    // 画面下端に収まらない場合は上に調整
    if (top + menuHeight > window.innerHeight) {
      top = Math.max(8, window.innerHeight - menuHeight - 8);
    }

    // 画面左端に収まらない場合
    if (left < 8) {
      left = 8;
    }

    menuPosition.value = { top, left };
    openMenuId.value = itemId;
    globalOpenMenuId.value = instanceId.value;
  };

  /**
   * メニューを閉じる
   */
  const closeMenu = () => {
    openMenuId.value = null;
    if (globalOpenMenuId.value === instanceId.value) {
      globalOpenMenuId.value = null;
    }
  };

  /**
   * メニューアクションを実行してメニューを閉じる
   * @param action 実行する関数
   */
  const handleMenuAction = (action: () => void) => {
    action();
    closeMenu();
  };

  /**
   * プレイリストに追加モーダルを開く
   * @param song 追加する楽曲
   */
  const openPlaylistModal = (song: Song) => {
    selectedSong.value = song;
    showPlaylistModal.value = true;
  };

  /**
   * プレイリスト追加完了時の処理
   */
  const handlePlaylistAdded = () => {
    showPlaylistModal.value = false;
    selectedSong.value = null;
  };

  /**
   * 特定のアイテムのメニューが開いているかチェック
   * @param itemId チェックするアイテムID
   */
  const isMenuOpen = (itemId: string | number): boolean => {
    return openMenuId.value === itemId;
  };

  // 他のメニューが開かれたら自分のメニューを閉じる
  watch(globalOpenMenuId, (newId) => {
    if (newId !== instanceId.value) {
      openMenuId.value = null;
    }
  });

  // メニュー外クリックで閉じる
  const handleOutsideClick = (event: Event) => {
    // メニュー内のクリックは無視
    const target = event.target as HTMLElement;
    if (target.closest("[data-song-menu]")) {
      return;
    }
    closeMenu();
  };

  // イベントリスナーの登録・解除
  onMounted(() => {
    document.addEventListener("click", handleOutsideClick);
    window.addEventListener("scroll", closeMenu, true);
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleOutsideClick);
    window.removeEventListener("scroll", closeMenu, true);
  });

  return {
    // State
    openMenuId,
    menuPosition,
    showPlaylistModal,
    selectedSong,

    // Methods
    openMenu,
    closeMenu,
    handleMenuAction,
    openPlaylistModal,
    handlePlaylistAdded,
    isMenuOpen,
  };
};

/**
 * 楽曲行の再生・キュー操作用Composable
 */
export const useSongRowActions = () => {
  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  /**
   * 楽曲を今すぐ再生（キューの先頭に追加して再生）
   * @param song 再生する楽曲
   */
  const playNow = (song: Song) => {
    queueStore.addToQueue(song, true); // toTop = true
    playerStore.setTrack(song);
    playerStore.play();
  };

  /**
   * 楽曲をキューに追加
   * @param song 追加する楽曲
   */
  const addToQueue = (song: Song) => {
    queueStore.addToQueue(song);
  };

  /**
   * YouTube URLを生成
   * @param videoUrl 動画のベースURL
   * @param startAt 開始時刻（秒）
   */
  const getYoutubeUrl = (videoUrl: string, startAt?: number | null): string => {
    if (startAt) {
      return `${videoUrl}&t=${Math.floor(startAt)}s`;
    }
    return videoUrl;
  };

  return {
    playNow,
    addToQueue,
    getYoutubeUrl,
  };
};
