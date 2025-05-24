import type { Song } from "~/types/song";

export const useSongs = () => {
  return useFetch<Song[]>("/api/songs");
};
