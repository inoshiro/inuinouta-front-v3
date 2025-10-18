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
    volume: 50, // デフォルト値を50%に変更
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
      | "queue-navigation"
      | null, // 遷移理由
    retryCount: 0, // リトライ回数
    maxRetries: 3, // 最大リトライ回数
    // 新機能：リピート・シャッフル機能
    repeatMode: "none" as "none" | "one" | "all", // リピートモード
    isShuffled: false, // シャッフル状態
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
    // 初期化時にlocalStorageから音量設定を読み込み
    initializeVolumeSettings() {
      if (typeof localStorage !== "undefined") {
        const savedVolume = localStorage.getItem("player-volume");
        const savedMuted = localStorage.getItem("player-muted");

        if (savedVolume !== null) {
          const volume = parseInt(savedVolume);
          if (!isNaN(volume) && volume >= 0 && volume <= 100) {
            this.volume = volume;
          }
        }

        if (savedMuted !== null) {
          this.isMuted = savedMuted === "true";
        }

        console.log("音量設定を読み込み:", {
          volume: this.volume,
          muted: this.isMuted,
        });
      }
    },

    // 音量設定をlocalStorageに保存
    saveVolumeSettings() {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("player-volume", this.volume.toString());
        localStorage.setItem("player-muted", this.isMuted.toString());
        console.log("音量設定を保存:", {
          volume: this.volume,
          muted: this.isMuted,
        });
      }
    },

    // プレイヤー状態の永続化機能
    initializePlayerSettings() {
      if (typeof localStorage !== "undefined") {
        try {
          const savedTrack = localStorage.getItem("player-current-track");
          const savedRepeatMode = localStorage.getItem("player-repeat-mode");
          const savedIsShuffled = localStorage.getItem("player-is-shuffled");

          if (savedTrack) {
            const trackData = JSON.parse(savedTrack);
            this.currentTrack = trackData;
            console.log("現在の楽曲を復元:", trackData.title);
          }

          if (savedRepeatMode) {
            const mode = savedRepeatMode as "none" | "one" | "all";
            if (["none", "one", "all"].includes(mode)) {
              this.repeatMode = mode;
              console.log("リピートモードを復元:", mode);
            }
          }

          if (savedIsShuffled !== null) {
            this.isShuffled = savedIsShuffled === "true";
            console.log("シャッフル状態を復元:", this.isShuffled);
          }
        } catch (error) {
          console.warn("プレイヤー設定の読み込みに失敗:", error);
        }
      }
    },

    savePlayerSettings() {
      if (typeof localStorage !== "undefined") {
        try {
          if (this.currentTrack) {
            localStorage.setItem(
              "player-current-track",
              JSON.stringify(this.currentTrack)
            );
          } else {
            localStorage.removeItem("player-current-track");
          }
          localStorage.setItem("player-repeat-mode", this.repeatMode);
          localStorage.setItem(
            "player-is-shuffled",
            this.isShuffled.toString()
          );
          console.log("プレイヤー設定を保存:", {
            track: this.currentTrack?.title || "なし",
            repeatMode: this.repeatMode,
            isShuffled: this.isShuffled,
          });
        } catch (error) {
          console.warn("プレイヤー設定の保存に失敗:", error);
        }
      }
    },
    setTrack(song: Song) {
      this.currentTrack = song;
      this.savePlayerSettings(); // 自動保存
    },
    setPlayerInstance(player: any) {
      this.ytPlayer = player;
      // isPlayerReadyはonPlayerReadyコールバックで設定されるべき
      // this.isPlayerReady = true; // この行を削除
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
      this.saveVolumeSettings(); // 音量変更時に自動保存
    },
    toggleMute() {
      this.isMuted = !this.isMuted;
      this.saveVolumeSettings(); // ミュート状態変更時に自動保存
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
    stop() {
      if (this.ytPlayer && this.isPlayerReady) {
        this.shouldAutoPlay = false;
        this.hasUserInteracted = true;
        this.ytPlayer.stopVideo();
      }
      // プレイヤー状態をリセット
      this.currentTrack = null;
      this.isPlaying = false;
      this.playerState = "UNSTARTED";
      this.currentTime = 0;
      this.transitionReason = null;
    },
    setShouldAutoPlay(value: boolean) {
      this.shouldAutoPlay = value;
    },
    setUserInteracted(value: boolean) {
      this.hasUserInteracted = value;
    },
    setTransitionReason(
      reason:
        | "manual"
        | "auto-jump"
        | "auto-end"
        | "error"
        | "queue-navigation"
        | null
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
    // 新機能：リピート・シャッフル制御
    setRepeatMode(mode: "none" | "one" | "all") {
      this.repeatMode = mode;
      this.savePlayerSettings(); // 自動保存
      console.log(`リピートモード変更: ${mode}`);
    },
    cycleRepeatMode() {
      const modes: ("none" | "one" | "all")[] = ["none", "one", "all"];
      const currentIndex = modes.indexOf(this.repeatMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      this.setRepeatMode(modes[nextIndex]);
    },
    setShuffled(enabled: boolean) {
      this.isShuffled = enabled;
      this.savePlayerSettings(); // 自動保存
      console.log(`シャッフル${enabled ? "有効" : "無効"}`);
    },
    toggleShuffle() {
      this.setShuffled(!this.isShuffled);
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
