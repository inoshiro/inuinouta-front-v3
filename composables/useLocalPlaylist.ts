import type { LocalPlaylist, LocalPlaylistItem } from "~/types/playlist";
import type { Song } from "~/types";

const STORAGE_KEY = "local_playlists";

interface CreatePlaylistData {
  name: string;
  description?: string;
}

interface UpdatePlaylistData {
  name?: string;
  description?: string;
}

interface PlaylistWithSongs {
  playlist: LocalPlaylist;
  songs: Song[];
}

/**
 * LocalStorageベースのプレイリスト管理Composable
 *
 * 設計方針:
 * - LocalStorageには楽曲IDのみを保存（軽量化）
 * - 表示時にAPIから楽曲情報を一括取得（N+1問題を回避）
 * - 将来のAPI実装と同じインターフェースを提供
 */
export const useLocalPlaylist = () => {
  const playlists = ref<LocalPlaylist[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * LocalStorageからプレイリスト一覧を読み込む
   */
  const loadPlaylists = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        playlists.value = JSON.parse(stored);
      } else {
        playlists.value = [];
      }
    } catch (e) {
      error.value = "プレイリストの読み込みに失敗しました";
      console.error("Failed to load playlists:", e);
      playlists.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * LocalStorageにプレイリスト一覧を保存
   */
  const savePlaylists = (): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists.value));
    } catch (e) {
      error.value = "プレイリストの保存に失敗しました";
      console.error("Failed to save playlists:", e);
      throw e;
    }
  };

  /**
   * 新しいプレイリストを作成
   */
  const createPlaylist = async (
    data: CreatePlaylistData
  ): Promise<LocalPlaylist> => {
    loading.value = true;
    error.value = null;

    try {
      const newPlaylist: LocalPlaylist = {
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description || "",
        items: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      playlists.value.push(newPlaylist);
      savePlaylists();

      return newPlaylist;
    } catch (e) {
      error.value = "プレイリストの作成に失敗しました";
      console.error("Failed to create playlist:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /**
   * プレイリストを更新
   */
  const updatePlaylist = async (
    id: string,
    data: UpdatePlaylistData
  ): Promise<LocalPlaylist> => {
    loading.value = true;
    error.value = null;

    try {
      const index = playlists.value.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error("Playlist not found");
      }

      const updatedPlaylist: LocalPlaylist = {
        ...playlists.value[index],
        ...data,
        updated_at: new Date().toISOString(),
      };

      playlists.value[index] = updatedPlaylist;
      savePlaylists();

      return updatedPlaylist;
    } catch (e) {
      error.value = "プレイリストの更新に失敗しました";
      console.error("Failed to update playlist:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /**
   * プレイリストを削除
   */
  const deletePlaylist = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const index = playlists.value.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error("Playlist not found");
      }

      playlists.value.splice(index, 1);
      savePlaylists();
    } catch (e) {
      error.value = "プレイリストの削除に失敗しました";
      console.error("Failed to delete playlist:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /**
   * プレイリストに楽曲を追加
   */
  const addSongToPlaylist = async (
    playlistId: string,
    songId: number
  ): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const playlist = playlists.value.find((p) => p.id === playlistId);
      if (!playlist) {
        throw new Error("Playlist not found");
      }

      // 既に追加済みかチェック
      if (playlist.items.some((item) => item.song_id === songId)) {
        error.value = "この曲は既にプレイリストに追加されています";
        return;
      }

      // 新しい曲を追加
      const newItem: LocalPlaylistItem = {
        id: crypto.randomUUID(),
        song_id: songId,
        order: playlist.items.length,
        added_at: new Date().toISOString(),
      };

      playlist.items.push(newItem);
      playlist.updated_at = new Date().toISOString();
      savePlaylists();
    } catch (e) {
      error.value = "楽曲の追加に失敗しました";
      console.error("Failed to add song to playlist:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /**
   * プレイリストから楽曲を削除
   */
  const removeSongFromPlaylist = async (
    playlistId: string,
    itemId: string
  ): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const playlist = playlists.value.find((p) => p.id === playlistId);
      if (!playlist) {
        throw new Error("Playlist not found");
      }

      const itemIndex = playlist.items.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) {
        throw new Error("Item not found");
      }

      playlist.items.splice(itemIndex, 1);

      // order を再計算
      playlist.items.forEach((item, index) => {
        item.order = index;
      });

      playlist.updated_at = new Date().toISOString();
      savePlaylists();
    } catch (e) {
      error.value = "楽曲の削除に失敗しました";
      console.error("Failed to remove song from playlist:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /**
   * プレイリスト内の曲順を変更
   */
  const reorderPlaylistItems = async (
    playlistId: string,
    fromIndex: number,
    toIndex: number
  ): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const playlist = playlists.value.find((p) => p.id === playlistId);
      if (!playlist) {
        throw new Error("Playlist not found");
      }

      // 配列を並び替え
      const [movedItem] = playlist.items.splice(fromIndex, 1);
      playlist.items.splice(toIndex, 0, movedItem);

      // order を再計算
      playlist.items.forEach((item, index) => {
        item.order = index;
      });

      playlist.updated_at = new Date().toISOString();
      savePlaylists();
    } catch (e) {
      error.value = "曲順の変更に失敗しました";
      console.error("Failed to reorder playlist items:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  /**
   * IDでプレイリストを取得
   */
  const getPlaylistById = (id: string): LocalPlaylist | null => {
    return playlists.value.find((p) => p.id === id) || null;
  };

  /**
   * プレイリストと楽曲情報を一括取得
   * LocalStorageには楽曲IDのみ保存し、APIから楽曲情報を取得
   */
  const getPlaylistWithSongs = async (
    id: string
  ): Promise<PlaylistWithSongs | null> => {
    loading.value = true;
    error.value = null;

    try {
      const playlist = getPlaylistById(id);
      if (!playlist) {
        return null;
      }

      // 楽曲IDを抽出
      const songIds = playlist.items.map((item) => item.song_id);

      if (songIds.length === 0) {
        return { playlist, songs: [] };
      }

      // Django APIから一括取得（filter{id.in}を使用）
      const params = new URLSearchParams();
      songIds.forEach((songId) => {
        params.append("filter{id.in}", songId.toString());
      });

      const response = await $fetch<{ songs: Song[] } | Song[]>(
        `/api/songs?${params.toString()}`
      );
      const songs = Array.isArray(response) ? response : response.songs;

      // プレイリストの並び順でソート
      const sortedSongs = playlist.items
        .map((item) => songs.find((s: Song) => s.id === item.song_id))
        .filter((song): song is Song => song !== undefined);

      return { playlist, songs: sortedSongs };
    } catch (e) {
      error.value = "楽曲情報の取得に失敗しました";
      console.error("Failed to fetch songs:", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    playlists: readonly(playlists),
    loading: readonly(loading),
    error: readonly(error),

    // Actions
    loadPlaylists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    reorderPlaylistItems,
    getPlaylistById,
    getPlaylistWithSongs,
  };
};
