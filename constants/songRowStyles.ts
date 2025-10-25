/**
 * 楽曲行のUIスタイル定義
 * 楽曲一覧、歌枠一覧、プレイリスト詳細で統一されたUIを提供
 */

export const SONG_ROW_STYLES = {
  // コンテナ（行全体）
  container: {
    base: "song-row border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-150",
    active: "bg-blue-50 hover:bg-blue-100", // 再生中の状態
    playlist:
      "song-row border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-150 flex items-stretch min-h-[80px]", // プレイリスト詳細用（番号付き）
  },

  // モバイル表示用
  mobile: {
    wrapper: "block md:hidden",
    content: "flex items-stretch min-h-[72px]",
  },

  // デスクトップ表示用
  desktop: {
    wrapper: "hidden md:flex items-stretch p-0 min-h-[80px]",
  },

  // 番号表示（プレイリスト詳細用）
  index: {
    wrapper:
      "flex-shrink-0 w-12 flex items-center justify-center text-sm text-gray-500",
  },

  // サムネイル
  thumbnail: {
    wrapperMobile:
      "flex-shrink-0 w-12 h-9 my-auto ml-3 relative cursor-pointer",
    wrapperDesktop:
      "flex-shrink-0 w-16 h-12 my-auto ml-4 mr-4 relative cursor-pointer",
    container:
      "w-full h-full bg-gray-200 rounded border border-gray-300 flex items-center justify-center overflow-hidden",
    image: "w-full h-full object-cover",
    placeholder: "text-xs text-gray-400",
    playingIndicator:
      "absolute inset-0 flex items-center justify-center bg-black/80 rounded",
  },

  // 楽曲情報
  info: {
    wrapperMobile: "flex-1 min-w-0 cursor-pointer py-2 px-3",
    wrapperDesktop: "flex-1 min-w-0 cursor-pointer py-4",
    titleContainer: "flex items-center gap-2 mb-1",
    titleMobile: "text-sm font-medium text-gray-900 truncate",
    titleDesktop: "text-sm font-medium text-gray-900 truncate",
    artistMobile: "text-xs text-gray-500 truncate mb-1",
    artistDesktop: "text-sm text-gray-500 truncate",
    badge:
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0",
    badgeMobile:
      "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0",
  },

  // 時間表示
  duration: {
    wrapper: "text-sm text-gray-500 font-mono hidden sm:block flex-shrink-0",
    time: "text-xs text-gray-500",
  },

  // アクションボタン
  actions: {
    wrapperVisible: "flex-shrink-0 flex items-center gap-2 py-4 pr-4",
    button: {
      queue:
        "p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors duration-150",
      remove:
        "p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-150",
    },
    icon: "w-5 h-5",
  },

  // 3点メニューボタン
  menuButton: {
    wrapperMobile: "flex-shrink-0 flex items-center pr-2",
    wrapperDesktop: "flex-shrink-0 flex items-center py-4 pr-4",
    buttonMobile:
      "p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors",
    buttonDesktop:
      "p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-150",
    iconMobile: "w-6 h-6",
    iconDesktop: "w-6 h-6",
  },

  // 区切り線
  divider: "divide-y divide-gray-200",

  // コンテキストメニュー
  contextMenu: {
    container:
      "fixed w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[9999]",
    menuItem:
      "w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors",
    iconGreen: "w-5 h-5 text-green-600",
    iconPurple: "w-5 h-5 text-purple-600",
    iconBlue: "w-5 h-5 text-blue-600",
    iconRed: "w-5 h-5 text-red-500",
  },
} as const;

/**
 * 楽曲行用のユーティリティ関数
 */
export const songRowUtils = {
  /**
   * 時間をフォーマット (秒 → mm:ss)
   */
  formatDuration: (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },

  /**
   * 開始時刻と終了時刻から再生時間を計算してフォーマット
   */
  formatSongDuration: (startAt?: number, endAt?: number): string => {
    if (!startAt && !endAt) return "-";
    const duration = (endAt || 0) - (startAt || 0);
    return songRowUtils.formatDuration(duration);
  },

  /**
   * 時刻をフォーマット (秒 → HH:MM:SS or MM:SS)
   */
  formatTime: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },

  /**
   * 時間範囲をフォーマット
   */
  formatTimeRange: (startAt?: number, endAt?: number): string => {
    if (!startAt && !endAt) return "";
    if (startAt && endAt) {
      return `${songRowUtils.formatTime(startAt)} - ${songRowUtils.formatTime(
        endAt
      )}`;
    }
    if (startAt) {
      return songRowUtils.formatTime(startAt);
    }
    if (endAt) {
      return songRowUtils.formatTime(endAt);
    }
    return "";
  },
};

/**
 * アイコンのSVGパス定義（共通化）
 */
export const SONG_ROW_ICONS = {
  play: "M8 5v14l11-7z",
  pause: "M6 4h4v16H6V4zm8 0h4v16h-4V4z",
  queue: "M12 6v6m0 0v6m0-6h6m-6 0H6",
  playlist:
    "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
  remove: "M6 18L18 6M6 6l12 12",
  youtube:
    "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  menu: "M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
} as const;
