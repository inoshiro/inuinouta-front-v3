import type { Playlist } from "~/types/playlist";

export const usePlaylist = (id: number) => {
  return useFetch<Playlist>(`/api/playlists/${id}`, {
    deep: true
  });
};
