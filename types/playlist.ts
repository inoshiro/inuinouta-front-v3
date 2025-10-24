import type { Song } from "./song";

// API版のPlaylist型（Django REST API用）
export type Playlist = {
  id: number;
  name: string;
  songs: Song[];
  created_at: string;
  updated_at: string;
};

// LocalStorage版のPlaylist型
export interface LocalPlaylist {
  id: string; // UUID
  name: string;
  description?: string;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  items: LocalPlaylistItem[];
}

export interface LocalPlaylistItem {
  id: string; // UUID
  song_id: number; // 楽曲ID
  order: number; // 並び順
  added_at: string; // ISO 8601
}

// プレイリストと楽曲の完全データ（表示用）
export interface PlaylistWithSongs {
  playlist: LocalPlaylist;
  songs: Song[]; // APIから取得した完全な楽曲データ
}
