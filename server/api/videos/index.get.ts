import { Video } from "~/types/video";
import { fetchDjangoApi } from "~/utils/api";

export interface VideosResponse {
  videos: Video[];
}

export interface VideoQuery {
  search?: string;
  title?: string;
  ordering?: string;
  limit?: number;
  offset?: number;
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event) as VideoQuery;

    const response = await fetchDjangoApi<VideosResponse>("/videos/", {
      method: "GET",
      query,
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to fetch videos",
    });
  }
});
