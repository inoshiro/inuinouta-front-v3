import { Song } from "~/types/song";
import { fetchDjangoApi } from "~/utils/api";

export interface SongsResponse {
  songs: Song[];
}

export interface SongQuery {
  search?: string;
  artist?: string;
  is_original?: boolean;
  video?: string;
  ordering?: string;
  limit?: number;
  offset?: number;
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event) as SongQuery;
    
    // DjangoのDynamic RESTに対応したクエリパラメータに変換
    const djangoQuery: Record<string, any> = { ...query };
    
    // orderingパラメータをsort[]形式に変換（Django Dynamic REST仕様）
    if (query.ordering) {
      delete djangoQuery.ordering;
      const sortFields = query.ordering.split(',');
      // Django Dynamic RESTは sort[] 形式（インデックスなし）を期待
      djangoQuery['sort[]'] = sortFields.map(field => field.trim());
    }

    const response = await fetchDjangoApi<SongsResponse>("/songs/", {
      method: "GET",
      query: djangoQuery,
    });
    
    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to fetch songs",
    });
  }
});
