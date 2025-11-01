import { defineStore } from "pinia";

export type RightPanelMode = "queue" | "playlist";

interface UIContextState {
  rightPanelMode: RightPanelMode;
  selectedPlaylistId: string | null; // LocalPlaylistのIDはstring(UUID)
}

export const useUIContext = defineStore("uiContext", {
  state: (): UIContextState => ({
    rightPanelMode: "queue",
    selectedPlaylistId: null,
  }),

  getters: {
    isQueueMode: (state): boolean => state.rightPanelMode === "queue",
    isPlaylistMode: (state): boolean => state.rightPanelMode === "playlist",
  },

  actions: {
    setRightPanelMode(mode: RightPanelMode) {
      this.rightPanelMode = mode;
      console.log("右パネルモードを変更:", mode);
    },

    switchToQueue() {
      this.setRightPanelMode("queue");
    },

    switchToPlaylist() {
      this.setRightPanelMode("playlist");
    },

    selectPlaylist(playlistId: string | null) {
      this.selectedPlaylistId = playlistId;
      console.log("プレイリストを選択:", playlistId);
    },
  },
});
