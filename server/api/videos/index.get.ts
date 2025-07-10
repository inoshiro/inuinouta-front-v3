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
    
    // DjangoのDynamic RESTに対応したクエリパラメータに変換
    const djangoQuery: Record<string, any> = { ...query };
    
    // orderingパラメータをsort[]形式に変換
    if (query.ordering) {
      delete djangoQuery.ordering;
      const sortFields = query.ordering.split(',');
      sortFields.forEach((field, index) => {
        djangoQuery[`sort[${index}]`] = field.trim();
      });
    }

    const response = await fetchDjangoApi<VideosResponse>("/videos/", {
      method: "GET",
      query: djangoQuery,
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to fetch videos",
    });
  }
});
