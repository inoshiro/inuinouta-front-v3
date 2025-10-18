import { Song } from "~/types/song";
import { fetchDjangoApi } from "~/utils/api";

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Song ID is required",
      });
    }

    const response = await fetchDjangoApi<any>(`/songs/${id}/`, {
      method: "GET",
    });

    // レスポンスが { song: {...} } の形式の場合は song を返す
    // そうでない場合はそのまま返す
    if (response && typeof response === "object" && "song" in response) {
      return response.song as Song;
    }

    return response as Song;
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to fetch song",
    });
  }
});
