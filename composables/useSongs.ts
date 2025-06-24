import type { Song } from "~/types/song";

export interface SongQuery {
  search?: string
  artist?: string
  is_original?: boolean
  video?: string
  ordering?: string
  limit?: number
  offset?: number
}

export interface SongsResponse {
  songs: Song[]
}

export const useSongs = () => {
  const songs = ref<Song[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSongs = async (query: SongQuery = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<SongsResponse>('/api/songs', {
        query,
      })
      songs.value = response.songs
      return response.songs
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch songs'
      console.error('Failed to fetch songs:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchRandomSong = async (): Promise<Song | null> => {
    loading.value = true
    error.value = null

    try {
      const song = await $fetch<Song>('/api/random')
      return song
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch random song'
      console.error('Failed to fetch random song:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const searchSongs = async (searchTerm: string, options: Omit<SongQuery, 'search'> = {}) => {
    return fetchSongs({ search: searchTerm, ...options })
  }

  const getSongsByArtist = async (artist: string, options: Omit<SongQuery, 'artist'> = {}) => {
    return fetchSongs({ artist, ...options })
  }

  const getOriginalSongs = async (options: Omit<SongQuery, 'is_original'> = {}) => {
    return fetchSongs({ is_original: true, ...options })
  }

  // 既存のuseFetchベースの関数も残しておく（互換性のため）
  const useFetchSongs = () => {
    return useFetch<SongsResponse>("/api/songs");
  }

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
  }
}
