import type { Video } from "./video";

export type Song = {
  id: number;
  video: Video;
  title: string;
  artist: string;
  is_original: boolean;
  start_at: number | null;
  end_at: number | null;
};
