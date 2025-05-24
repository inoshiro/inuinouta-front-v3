import { defineStore } from "pinia";
import type { Song } from "~/types/song";

export type QueueItem = Song & {
  addedFrom?: "search" | "playlist" | "history";
  playlistId?: number;
};

export const usePlayerQueue = defineStore("playerQueue", {
  state: () => ({
    queue: [] as QueueItem[],
    nowPlayingIndex: 0,
  }),
  getters: {
    nowPlaying: (state) => state.queue[state.nowPlayingIndex] || null,
    hasNext: (state) => state.nowPlayingIndex < state.queue.length - 1,
    hasPrevious: (state) => state.nowPlayingIndex > 0,
  },
  actions: {
    setQueue(songs: QueueItem[]) {
      this.queue = songs;
      this.nowPlayingIndex = 0;
    },
    addToQueue(song: QueueItem, toTop = false) {
      if (toTop) {
        this.queue.splice(this.nowPlayingIndex + 1, 0, song);
      } else {
        this.queue.push(song);
      }
    },
    play(index: number) {
      if (index >= 0 && index < this.queue.length) {
        this.nowPlayingIndex = index;
      }
    },
    next() {
      if (this.hasNext) this.nowPlayingIndex++;
    },
    previous() {
      if (this.hasPrevious) this.nowPlayingIndex--;
    },
    clear() {
      this.queue = [];
      this.nowPlayingIndex = 0;
    },
  },
});
