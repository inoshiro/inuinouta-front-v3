// 基本のSong型をインポート（循環参照回避のため必要時のみ）
import type { Song } from "./song";

export type Video = {
  id: string;
  title: string;
  url: string;
  thumbnail_path: string;
  is_open: boolean;
  is_member_only: boolean;
  is_stream: boolean;
  unplayable: boolean;
  published_at: string;
  songs_count?: number; // 一覧APIで使用
  songs?: Song[]; // 詳細APIで使用
};

// songsを含むVideo型（詳細API用）
export type VideoWithSongs = Video & {
  songs: Song[];
};
