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

    const response = await fetchDjangoApi<SongsResponse>("/songs/", {
      method: "GET",
      query,
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to fetch songs",
    });
  }
});
