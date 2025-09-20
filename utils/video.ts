import type { Video } from "~/types/video";

/**
 * YouTube動画IDを抽出する関数
 */
export const extractYouTubeId = (url: string): string => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : "";
};

/**
 * YouTube埋め込みURLを生成する関数
 */
export const getYouTubeEmbedUrl = (
  video: Video,
  startTime?: number
): string => {
  const videoId = extractYouTubeId(video.url);
  if (videoId) {
    let url = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`;
    if (startTime) {
      url += `&start=${startTime}`;
    }
    return url;
  }
  return "";
};

/**
 * サムネイルURLを生成
 */
export const getThumbnailUrl = (video: Video): string => {
  // まずVideo型のthumbnail_pathを確認
  if (video.thumbnail_path && video.thumbnail_path.trim() !== "") {
    return video.thumbnail_path;
  }

  // フォールバックとしてYouTubeサムネイルを使用
  const videoId = extractYouTubeId(video.url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }

  // 最後のフォールバック：デフォルト画像
  return "/images/default-thumbnail.svg";
};

/**
 * 画像読み込みエラー時の処理
 */
export const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (img.src !== "/images/default-thumbnail.svg") {
    img.src = "/images/default-thumbnail.svg";
  }
};

/**
 * 日付フォーマット
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * 時間を HH:MM:SS フォーマットに変換する関数
 */
export const formatTime = (timeStr: string): string => {
  if (!timeStr) return "00:00:00";

  // 既に HH:MM:SS 形式の場合はそのまま返す
  if (timeStr.includes(":")) {
    const parts = timeStr.split(":");
    if (parts.length === 2) {
      // MM:SS を HH:MM:SS に変換
      return `00:${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
    } else if (parts.length === 3) {
      // HH:MM:SS はそのまま（ゼロパディング）
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(
        2,
        "0"
      )}:${parts[2].padStart(2, "0")}`;
    }
  }

  // 秒数の場合は HH:MM:SS に変換
  const totalSeconds = parseInt(timeStr);
  if (!isNaN(totalSeconds)) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return "00:00:00";
};

/**
 * 時間文字列を秒数に変換する関数
 */
export const convertTimeToSeconds = (timeStr: string): number => {
  if (!timeStr) return 0;

  const parts = timeStr.split(":").map(Number);
  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
};
