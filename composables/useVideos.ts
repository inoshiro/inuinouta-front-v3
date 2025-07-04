import type { Video } from "~/types/video";

export interface VideoQuery {
  search?: string
  title?: string
  ordering?: string
  limit?: number
  offset?: number
}

export interface VideosResponse {
  videos: Video[]
}

export const useVideos = () => {
  const videos = ref<Video[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchVideos = async (query: VideoQuery = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<VideosResponse>('/api/videos', {
        query,
      })
      videos.value = response.videos
      return response.videos
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch videos'
      console.error('Failed to fetch videos:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const searchVideos = async (searchTerm: string, options: Omit<VideoQuery, 'search'> = {}) => {
    return fetchVideos({ search: searchTerm, ...options })
  }

  const getVideoById = async (id: string): Promise<Video | null> => {
    const videoList = await fetchVideos()
    return videoList.find(video => video.id === id) || null
  }

  // 既存のuseFetchベースの関数も残しておく（互換性のため）
  const useFetchVideos = () => {
    return useFetch<VideosResponse>("/api/videos");
  }

  return {
    videos: readonly(videos),
    loading: readonly(loading),
    error: readonly(error),
    fetchVideos,
    searchVideos,
    getVideoById,
    useFetchVideos,
  }
}
