import type { Video } from "~/types/video";

export const useVideos = () => {
  return useFetch<Video[]>("/api/videos");
};
