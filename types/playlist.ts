import type { Song } from "./song";

export type Playlist = {
  id: number;
  name: string;
  songs: Song[];
  created_at: string;
  updated_at: string;
};
