import type { Song } from "~/types/song";

export interface SongQuery {
  search?: string;
  artist?: string;
  is_original?: boolean;
  video?: string;
  ordering?: string;
  per_page?: number;
  page?: number;
  // Django API filter{} parameters
  "filter{is_original}"?: boolean;
  "filter{video.is_stream}"?: boolean;
  "filter{video.is_open}"?: boolean;
  "filter{video.is_member_only}"?: boolean;
  // 動的フィルタ用の catch-all
  [key: string]: any;
}

export interface SongsResponse {
  songs: Song[];
}

export const useSongs = () => {
  const songs = ref<Song[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchSongs = async (query: SongQuery = {}) => {
    loading.value = true;
    error.value = null;

    // デフォルトのソート設定：動画の投稿日時降順、楽曲の開始時間昇順
    const defaultQuery = {
      ordering: "-video.published_at,start_at",
      ...query,
    };

    try {
      const response = await $fetch<SongsResponse>("/api/songs", {
        query: defaultQuery,
      });
      songs.value = response.songs;
      return response.songs;
    } catch (err: any) {
      error.value = err.message || "Failed to fetch songs";
      console.error("Failed to fetch songs:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const fetchRandomSong = async (): Promise<Song | null> => {
    loading.value = true;
    error.value = null;

    try {
      const song = await $fetch<Song>("/api/random");
      return song;
    } catch (err: any) {
      error.value = err.message || "Failed to fetch random song";
      console.error("Failed to fetch random song:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const searchSongs = async (
    searchTerm: string,
    options: Omit<SongQuery, "search"> = {}
  ) => {
    return fetchSongs({ search: searchTerm, ...options });
  };

  const getSongsByArtist = async (
    artist: string,
    options: Omit<SongQuery, "artist"> = {}
  ) => {
    return fetchSongs({ artist, ...options });
  };

  const getOriginalSongs = async (
    options: Omit<SongQuery, "is_original"> = {}
  ) => {
    return fetchSongs({ is_original: true, ...options });
  };

  // 既存のuseFetchベースの関数も残しておく（互換性のため）
  const useFetchSongs = () => {
    return useFetch<SongsResponse>("/api/songs");
  };

  return {
    songs: readonly(songs),
    loading: readonly(loading),
    error: readonly(error),
    fetchSongs,
    fetchRandomSong,
    searchSongs,
    getSongsByArtist,
    getOriginalSongs,
    useFetchSongs,
  };
};
