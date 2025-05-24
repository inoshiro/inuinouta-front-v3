import { defineStore } from "pinia";
import type { Song } from "~/types/song";

export const usePlayerStore = defineStore("player", {
  state: () => ({
    currentTrack: null as Song | null,
    isPlaying: false,
  }),
  actions: {
    setTrack(song: Song) {
      this.currentTrack = song;
      this.isPlaying = true;
    },
    setCurrentTime(time: number) {
      if (this.currentTrack) {
        this.currentTrack.start_at = time;
      }
    },
    play() {
      this.isPlaying = true;
    },
    pause() {
      this.isPlaying = false;
    },
  },
});
