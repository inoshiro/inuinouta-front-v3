import { Playlist } from "~/types/playlist";
import { fetchDjangoApi } from "~/utils/api";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Playlist ID is required",
      });
    }

    const response = await fetchDjangoApi<Playlist>(`/playlists/${id}/`, {
      method: "GET",
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to fetch playlist",
    });
  }
});
