import { Video } from "~/types/video";
import { Song } from "~/types/song";
import { fetchDjangoApi } from "~/utils/api";

export interface VideoDetailResponse {
  video: Video & {
    songs: Song[];
  };
}

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Video ID is required",
      });
    }

    // 動画の詳細情報を取得（楽曲も含む）
    const response = await fetchDjangoApi<VideoDetailResponse>(
      `/videos/${id}/`,
      {
        method: "GET",
        query: {
          "include[]": "songs",
        },
      }
    );

    // videoオブジェクトを直接返す
    return response.video || response;
  } catch (error: any) {
    console.error("Failed to fetch video detail:", error);
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to fetch video detail",
    });
  }
});
