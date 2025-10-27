import type { Song } from "~/types/song";

/**
 * Google Analytics イベント追跡用のComposable
 *
 * 使用例:
 * const analytics = useAnalytics()
 * analytics.trackSongPlay(song)
 */
export const useAnalytics = () => {
  const { gtag } = useGtag();

  /**
   * イベントを送信する内部メソッド
   */
  const sendEvent = (eventName: string, eventParams?: Record<string, any>) => {
    if (typeof gtag === "function") {
      gtag("event", eventName, eventParams);
    } else {
      // 開発環境などでGA4が無効な場合はコンソールに出力
      console.log("Analytics Event:", eventName, eventParams);
    }
  };

  /**
   * ページビューを手動で送信
   * (通常はプラグインが自動で送信するため、SPAの特殊なケースのみ使用)
   */
  const trackPageView = (pagePath: string, pageTitle?: string) => {
    sendEvent("page_view", {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  };

  /**
   * 楽曲再生イベントを追跡
   */
  const trackSongPlay = (song: Song) => {
    sendEvent("play_song", {
      song_id: song.id,
      song_title: song.title,
      artist: song.artist,
      is_original: song.is_original,
      has_video: !!song.video,
      is_stream: song.video?.is_stream || false,
    });
  };

  /**
   * 楽曲をキューに追加したイベントを追跡
   */
  const trackAddToQueue = (song: Song) => {
    sendEvent("add_to_queue", {
      song_id: song.id,
      song_title: song.title,
      artist: song.artist,
    });
  };

  /**
   * 検索イベントを追跡
   */
  const trackSearch = (query: string, resultCount?: number) => {
    sendEvent("search", {
      search_term: query,
      result_count: resultCount,
    });
  };

  /**
   * プレイリスト操作イベントを追跡
   */
  const trackPlaylistAction = (
    action: "create" | "edit" | "delete" | "play" | "add_song",
    playlistId?: string,
    playlistName?: string,
    songId?: number,
    songTitle?: string
  ) => {
    sendEvent("playlist_action", {
      action,
      playlist_id: playlistId,
      playlist_name: playlistName,
      song_id: songId,
      song_title: songTitle,
    });
  };

  /**
   * YouTubeリンククリックを追跡
   */
  const trackYouTubeClick = (
    songId: number,
    songTitle: string,
    videoId: string
  ) => {
    sendEvent("youtube_click", {
      song_id: songId,
      song_title: songTitle,
      video_id: videoId,
    });
  };

  /**
   * パーマリンクコピーを追跡
   */
  const trackPermalinkCopy = (songId: number, songTitle: string) => {
    sendEvent("permalink_copy", {
      song_id: songId,
      song_title: songTitle,
    });
  };

  /**
   * ソート変更を追跡
   */
  const trackSortChange = (sortBy: string, order: string) => {
    sendEvent("sort_change", {
      sort_by: sortBy,
      order: order,
    });
  };

  /**
   * フィルター適用を追跡
   */
  const trackFilterApply = (filterType: string, filterValue: any) => {
    sendEvent("filter_apply", {
      filter_type: filterType,
      filter_value: filterValue,
    });
  };

  return {
    trackPageView,
    trackSongPlay,
    trackAddToQueue,
    trackSearch,
    trackPlaylistAction,
    trackYouTubeClick,
    trackPermalinkCopy,
    trackSortChange,
    trackFilterApply,
  };
};
