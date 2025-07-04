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
    shouldAutoPlay: false, // 自動再生フラグ
    hasUserInteracted: false, // ユーザーインタラクションフラグ
    transitionReason: null as
      | "manual"
      | "auto-jump"
      | "auto-end"
      | "error"
      | null, // 遷移理由
    retryCount: 0, // リトライ回数
    maxRetries: 3, // 最大リトライ回数
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
        try {
          this.shouldAutoPlay = true; // 自動再生フラグを設定
          this.hasUserInteracted = true; // ユーザーインタラクションを記録
          this.ytPlayer.playVideo();
          console.log("Play command executed");
        } catch (error) {
          console.warn("Play failed:", error);
        }
      } else {
        console.warn("Player not ready for play command");
      }
    },
    pause() {
      if (this.ytPlayer && this.isPlayerReady) {
        this.shouldAutoPlay = false; // 自動再生フラグをクリア
        this.hasUserInteracted = true; // ユーザーインタラクションを記録
        this.ytPlayer.pauseVideo();
      }
    },
    setShouldAutoPlay(value: boolean) {
      this.shouldAutoPlay = value;
    },
    setUserInteracted(value: boolean) {
      this.hasUserInteracted = value;
    },
    setTransitionReason(
      reason: "manual" | "auto-jump" | "auto-end" | "error" | null
    ) {
      this.transitionReason = reason;
    },
    incrementRetryCount() {
      this.retryCount++;
    },
    resetRetryCount() {
      this.retryCount = 0;
    },
    canRetry(): boolean {
      return this.retryCount < this.maxRetries;
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
