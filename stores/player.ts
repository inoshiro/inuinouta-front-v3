import { defineStore } from "pinia";
import type { Song } from "~/types/song";

export type PlayerState =
  | "UNSTARTED"
  | "ENDED"
  | "PLAYING"
  | "PAUSED"
  | "BUFFERING"
  | "CUED";

export const usePlayerStore = defineStore("player", {
  state: () => ({
    currentTrack: null as Song | null,
    isPlaying: false,
    playerState: "UNSTARTED" as PlayerState,
    currentTime: 0,
    duration: 0,
    volume: 100,
    isMuted: false,
    isPlayerReady: false,
    ytPlayer: null as any, // YouTube Player インスタンス
  }),
  getters: {
    // 現在の楽曲の進行率（0-100）
    progress: (state) => {
      if (!state.duration) return 0;
      return (state.currentTime / state.duration) * 100;
    },
    // 現在再生中の動画ID
    currentVideoId: (state) => {
      return state.currentTrack?.video?.url
        ? extractYouTubeId(state.currentTrack.video.url)
        : null;
    },
  },
  actions: {
    setTrack(song: Song) {
      this.currentTrack = song;
    },
    setPlayerInstance(player: any) {
      this.ytPlayer = player;
      this.isPlayerReady = true;
    },
    setCurrentTime(time: number) {
      this.currentTime = time;
    },
    setDuration(duration: number) {
      this.duration = duration;
    },
    setPlayerState(state: PlayerState) {
      this.playerState = state;
      this.isPlaying = state === "PLAYING";
    },
    setVolume(volume: number) {
      this.volume = Math.max(0, Math.min(100, volume));
    },
    toggleMute() {
      this.isMuted = !this.isMuted;
    },
    play() {
      if (this.ytPlayer && this.isPlayerReady) {
        this.ytPlayer.playVideo();
      }
    },
    pause() {
      if (this.ytPlayer && this.isPlayerReady) {
        this.ytPlayer.pauseVideo();
      }
    },
    seek(time: number) {
      if (this.ytPlayer && this.isPlayerReady) {
        this.ytPlayer.seekTo(time, true);
      }
    },
  },
});

// YouTube URLから動画IDを抽出するヘルパー関数
function extractYouTubeId(url: string): string | null {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}
