import type { Video, VideoWithSongs } from "~/types/video";

export interface VideoQuery {
  search?: string;
  title?: string;
  ordering?: string;
  per_page?: number;
  page?: number;
  // Django API filter{} parameters
  "filter{is_stream}"?: boolean;
  "filter{is_open}"?: boolean;
  "filter{is_member_only}"?: boolean;
  "filter{unplayable}"?: boolean;
  // 動的フィルタ用の catch-all
  [key: string]: any;
}

export interface VideosResponse {
  videos: Video[];
}

export const useVideos = () => {
  const videos = ref<Video[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchVideos = async (query: VideoQuery = {}) => {
    loading.value = true;
    error.value = null;

    // デフォルトのソート設定：投稿日時降順
    const defaultQuery = {
      ordering: "-published_at",
      ...query,
    };

    try {
      const response = await $fetch<VideosResponse>("/api/videos", {
        query: defaultQuery,
      });
      videos.value = response.videos;
      return response.videos;
    } catch (err: any) {
      error.value = err.message || "Failed to fetch videos";
      console.error("Failed to fetch videos:", err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  const searchVideos = async (
    searchTerm: string,
    options: Omit<VideoQuery, "search"> = {}
  ) => {
    return fetchVideos({ search: searchTerm, ...options });
  };

  const getVideoById = async (id: string): Promise<Video | null> => {
    const videoList = await fetchVideos();
    return videoList.find((video) => video.id === id) || null;
  };

  // video詳細APIでsongs情報も含めて取得
  const fetchVideoWithSongs = async (
    id: string
  ): Promise<VideoWithSongs | null> => {
    loading.value = true;
    error.value = null;

    try {
      const video = await $fetch<VideoWithSongs>(`/api/videos/${id}`);
      return video;
    } catch (err: any) {
      error.value = err.message || "Failed to fetch video details";
      console.error("Failed to fetch video details:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // 既存のuseFetchベースの関数も残しておく（互換性のため）
  const useFetchVideos = () => {
    return useFetch<VideosResponse>("/api/videos", {
      deep: true
    });
  };

  return {
    videos: readonly(videos),
    loading: readonly(loading),
    error: readonly(error),
    fetchVideos,
    searchVideos,
    getVideoById,
    fetchVideoWithSongs,
    useFetchVideos,
  };
};
