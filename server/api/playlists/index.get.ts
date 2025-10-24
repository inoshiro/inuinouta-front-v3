import { Playlist } from "~/types/playlist";
import { fetchDjangoApi } from "~/utils/api";

export interface PlaylistsResponse {
  playlists: Playlist[];
}

export interface PlaylistQuery {
  search?: string;
  ordering?: string;
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event) as PlaylistQuery;

    const response = await fetchDjangoApi<Playlist[]>("/playlists/", {
      method: "GET",
      query,
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to fetch playlists",
    });
  }
});
