import { Song } from "~/types/song";
import { fetchDjangoApi } from "~/utils/api";

export default defineEventHandler(async (event) => {
  try {
    const response = await fetchDjangoApi<Song>("/random/", {
      method: "GET",
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to fetch random song",
    });
  }
});
