import { Song } from "~/types/song";
import { fetchDjangoApi } from "~/utils/api";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const response = await fetchDjangoApi<Song[]>("/random/", {
      method: "GET",
      query,
    });

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to fetch random songs",
    });
  }
});
