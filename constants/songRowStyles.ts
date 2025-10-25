/**
 * 楽曲行のUIスタイル定義
 * 楽曲一覧、歌枠一覧、プレイリスト詳細で統一されたUIを提供
 */

export const SONG_ROW_STYLES = {
  // コンテナ
  container: {
    base: "flex items-center gap-4 p-4 hover:bg-gray-700/50 transition-colors group",
    mobile: "min-h-[72px] py-2",
  },

  // 番号表示（プレイリスト詳細用）
  index: {
    wrapper: "w-8 text-center text-gray-400 font-mono flex-shrink-0",
  },

  // サムネイル
  thumbnail: {
    wrapper: "w-20 h-12 flex-shrink-0 relative",
    mobile: "w-12 h-9",
    image: "w-full h-full object-cover rounded",
    placeholder:
      "w-full h-full bg-gray-200 rounded border border-gray-300 flex items-center justify-center",
    playingIndicator:
      "absolute inset-0 flex items-center justify-center bg-black/80 rounded",
  },

  // 楽曲情報
  info: {
    wrapper: "flex-1 min-w-0",
    title: "font-semibold truncate text-gray-100",
    titleMobile: "text-sm",
    artist: "text-sm text-gray-400 truncate",
    artistMobile: "text-xs",
    badge:
      "inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium",
  },

  // 時間表示
  duration: {
    wrapper: "text-sm text-gray-400 font-mono hidden sm:block flex-shrink-0",
    time: "text-xs text-gray-500",
  },

  // アクションボタン
  actions: {
    wrapper:
      "flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity",
    wrapperVisible: "flex items-center gap-2", // 常に表示する場合
    button: {
      base: "p-2 hover:bg-gray-600 rounded-full transition-colors",
      play: "p-2 hover:bg-blue-900/30 rounded-full transition-colors text-blue-400",
      queue:
        "p-2 hover:bg-green-900/30 rounded-full transition-colors text-green-400",
      playlist:
        "p-2 hover:bg-purple-900/30 rounded-full transition-colors text-purple-400",
      remove:
        "p-2 hover:bg-red-900/30 rounded-full transition-colors text-red-400",
      youtube:
        "p-2 hover:bg-red-900/30 rounded-full transition-colors text-red-500",
    },
    icon: "w-5 h-5",
    iconSmall: "w-4 h-4",
  },

  // 3点メニューボタン
  menuButton: {
    wrapper: "flex-shrink-0",
    button:
      "p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white",
    icon: "w-5 h-5",
  },

  // 区切り線
  divider: "divide-y divide-gray-700",
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
  menu: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
} as const;
