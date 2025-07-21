import { defineStore } from "pinia";
import type { Song } from "~/types/song";
import { usePlayerStore } from "./player";

export type QueueItem = Song & {
  addedFrom?: "search" | "playlist" | "history" | "stream";
  playlistId?: number;
};

export const usePlayerQueue = defineStore("playerQueue", {
  state: () => ({
    queue: [] as QueueItem[],
    nowPlayingIndex: 0,
    shouldStopPlayback: false, // 再生停止要求フラグ
    originalQueue: [] as QueueItem[], // シャッフル前の元キュー保存用
  }),
  getters: {
    nowPlaying: (state) => state.queue[state.nowPlayingIndex] || null,
    hasNext: (state) => state.nowPlayingIndex < state.queue.length - 1,
    hasPrevious: (state) => state.nowPlayingIndex > 0,
    shouldStop: (state) => state.shouldStopPlayback,
    // 次の楽曲が同じ動画かつ同じ曲かどうかを判定
    isNextSameSong: (state) => {
      const current = state.queue[state.nowPlayingIndex];
      const next = state.queue[state.nowPlayingIndex + 1];
      return (
        current &&
        next &&
        current.id === next.id &&
        current.video?.id === next.video?.id
      );
    },
    // 前の楽曲が同じ動画かつ同じ曲かどうかを判定
    isPreviousSameSong: (state) => {
      const current = state.queue[state.nowPlayingIndex];
      const previous = state.queue[state.nowPlayingIndex - 1];
      return (
        current &&
        previous &&
        current.id === previous.id &&
        current.video?.id === previous.video?.id
      );
    },
  },
  actions: {
    setQueue(songs: QueueItem[]) {
      this.queue = songs;
      this.nowPlayingIndex = 0;
      this.saveQueueSettings(); // 自動保存
    },
    addToQueue(song: QueueItem, toTop = false) {
      console.log("Adding to queue:", {
        song: { id: song.id, title: song.title },
        toTop,
        currentQueueLength: this.queue.length,
      });
      if (toTop) {
        this.queue.splice(this.nowPlayingIndex + 1, 0, song);
      } else {
        this.queue.push(song);
      }
      this.saveQueueSettings(); // 自動保存
    },
    removeFromQueue(index: number) {
      if (index < 0 || index >= this.queue.length) return;

      const wasCurrentlyPlaying = index === this.nowPlayingIndex;

      // 現在再生中の曲を削除する場合
      if (index === this.nowPlayingIndex) {
        this.queue.splice(index, 1);
        // キューが空になった場合
        if (this.queue.length === 0) {
          this.nowPlayingIndex = 0;
          // 再生停止フラグを設定
          console.log("Queue became empty - setting stop flag");
          this.shouldStopPlayback = true;
        } else if (this.nowPlayingIndex >= this.queue.length) {
          // 最後の曲を削除した場合、インデックスを調整
          this.nowPlayingIndex = this.queue.length - 1;
        }
        // インデックスはそのままで次の曲が自動で再生される
      } else if (index < this.nowPlayingIndex) {
        // 現在再生中より前の曲を削除した場合、インデックスを1つ減らす
        this.queue.splice(index, 1);
        this.nowPlayingIndex--;
      } else {
        // 現在再生中より後の曲を削除した場合、インデックスはそのまま
        this.queue.splice(index, 1);
      }
      this.saveQueueSettings(); // 自動保存
    },
    moveInQueue(fromIndex: number, toIndex: number) {
      if (
        fromIndex < 0 ||
        fromIndex >= this.queue.length ||
        toIndex < 0 ||
        toIndex >= this.queue.length ||
        fromIndex === toIndex
      )
        return;

      const [movedItem] = this.queue.splice(fromIndex, 1);
      this.queue.splice(toIndex, 0, movedItem);

      // 現在再生中のインデックスを調整
      if (fromIndex === this.nowPlayingIndex) {
        this.nowPlayingIndex = toIndex;
      } else if (
        fromIndex < this.nowPlayingIndex &&
        toIndex >= this.nowPlayingIndex
      ) {
        this.nowPlayingIndex--;
      } else if (
        fromIndex > this.nowPlayingIndex &&
        toIndex <= this.nowPlayingIndex
      ) {
        this.nowPlayingIndex++;
      }
      this.saveQueueSettings(); // 自動保存
    },
    play(index: number) {
      if (index >= 0 && index < this.queue.length) {
        const playerStore = usePlayerStore();
        // 直接楽曲を選択する場合は常にmanual
        playerStore.setTransitionReason("manual");
        this.nowPlayingIndex = index;
        this.saveQueueSettings(); // 自動保存
      }
    },
    next() {
      console.log("Queue next() called:", {
        currentIndex: this.nowPlayingIndex,
        hasNext: this.hasNext,
        isNextSameSong: this.isNextSameSong,
        nextSong: this.hasNext
          ? {
              id: this.queue[this.nowPlayingIndex + 1].id,
              title: this.queue[this.nowPlayingIndex + 1].title,
              videoId: this.queue[this.nowPlayingIndex + 1].video?.id,
            }
          : null,
      });
      if (this.hasNext) {
        // 次の曲が同じ曲の場合はqueue-navigation、そうでなければmanual
        const playerStore = usePlayerStore();
        if (this.isNextSameSong) {
          playerStore.setTransitionReason("queue-navigation");
        } else {
          playerStore.setTransitionReason("manual");
        }
        this.nowPlayingIndex++;
        this.saveQueueSettings(); // 自動保存
      }
    },
    previous() {
      console.log("Queue previous() called:", {
        currentIndex: this.nowPlayingIndex,
        hasPrevious: this.hasPrevious,
        isPreviousSameSong: this.isPreviousSameSong,
        previousSong: this.hasPrevious
          ? {
              id: this.queue[this.nowPlayingIndex - 1].id,
              title: this.queue[this.nowPlayingIndex - 1].title,
              videoId: this.queue[this.nowPlayingIndex - 1].video?.id,
            }
          : null,
      });

      // 旧システムの5秒ルールを実装（5秒以上再生時は頭出し）
      const playerStore = usePlayerStore();
      const currentTrack = this.nowPlaying;

      if (currentTrack && playerStore.currentTime && playerStore.ytPlayer) {
        const startTime = currentTrack.start_at || 0;
        const currentTime = Math.ceil(playerStore.currentTime);

        // 5秒以上再生している場合は頭出し
        if (currentTime > startTime + 5) {
          console.log("5秒ルール適用: 現在の楽曲の頭出し");
          // 同じ曲の先頭に戻る場合はqueue-navigationを設定
          playerStore.setTransitionReason("queue-navigation");
          playerStore.seek(startTime);
          return;
        }
      }

      // 5秒未満または条件を満たさない場合は前の曲へ
      if (this.hasPrevious) {
        // 前の曲が同じ曲の場合はqueue-navigation、そうでなければmanual
        if (this.isPreviousSameSong) {
          playerStore.setTransitionReason("queue-navigation");
        } else {
          playerStore.setTransitionReason("manual");
        }
        this.nowPlayingIndex--;
        this.saveQueueSettings(); // 自動保存
      }
    },
    clear() {
      // 再生停止フラグを設定
      console.log("Queue clear requested - setting stop flag");
      this.shouldStopPlayback = true;
      this.queue = [];
      this.nowPlayingIndex = 0;
      this.clearQueueSettings(); // localStorage からも削除
    },
    // フラグをリセットするためのメソッド
    resetStopFlag() {
      console.log("Resetting stop flag");
      this.shouldStopPlayback = false;
    },
    // シャッフル機能（Fisher-Yatesアルゴリズム）
    shuffleQueue() {
      const playerStore = usePlayerStore();

      if (playerStore.isShuffled) {
        // 元のキューを保存
        this.originalQueue = [...this.queue];

        // Fisher-Yatesアルゴリズムでシャッフル
        for (let i = this.queue.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
        }

        // 現在再生中の楽曲のインデックスを同期
        this.syncCurrentTrackIndex();
        this.saveQueueSettings(); // 自動保存
        console.log("キューをシャッフルしました");
      } else {
        // 元のキューに戻す
        if (this.originalQueue.length > 0) {
          this.queue = [...this.originalQueue];
          this.syncCurrentTrackIndex();
          this.saveQueueSettings(); // 自動保存
          console.log("シャッフルを解除しました");
        }
      }
    },
    // 現在再生中の楽曲のインデックスを同期
    syncCurrentTrackIndex() {
      const playerStore = usePlayerStore();
      if (playerStore.currentTrack) {
        const index = this.queue.findIndex(
          (item) => item.id === playerStore.currentTrack?.id
        );
        if (index !== -1) {
          this.nowPlayingIndex = index;
          this.saveQueueSettings(); // 自動保存
        }
      }
    },
    // リピート対応の次の曲
    nextWithRepeat() {
      const playerStore = usePlayerStore();

      if (this.hasNext) {
        this.next();
      } else if (playerStore.repeatMode === "all") {
        this.nowPlayingIndex = 0; // 最初に戻る
        playerStore.setTransitionReason("auto-end");
        this.saveQueueSettings(); // 自動保存
      } else if (playerStore.repeatMode === "one") {
        // 現在の曲を再再生（インデックス変更なし）
        const currentTrack = this.nowPlaying;
        if (currentTrack) {
          playerStore.setTransitionReason("auto-end");
          playerStore.seek(currentTrack.start_at || 0);
          if (!playerStore.isPlaying) {
            playerStore.play();
          }
        }
      }
      // repeatMode === 'none' の場合は何もしない（再生停止）
    },

    // キューの永続化機能
    initializeQueueSettings() {
      if (typeof localStorage !== "undefined") {
        try {
          const savedQueue = localStorage.getItem("player-queue");
          const savedIndex = localStorage.getItem("player-queue-index");
          const savedOriginalQueue = localStorage.getItem(
            "player-original-queue"
          );

          if (savedQueue) {
            const queueData = JSON.parse(savedQueue);
            if (Array.isArray(queueData) && queueData.length > 0) {
              this.queue = queueData;
              console.log("キューを復元:", queueData.length + "曲");
            }
          }

          if (savedIndex !== null) {
            const index = parseInt(savedIndex);
            if (!isNaN(index) && index >= 0 && index < this.queue.length) {
              this.nowPlayingIndex = index;
              console.log("再生位置を復元:", index);
            }
          }

          if (savedOriginalQueue) {
            const originalQueueData = JSON.parse(savedOriginalQueue);
            if (Array.isArray(originalQueueData)) {
              this.originalQueue = originalQueueData;
              console.log(
                "オリジナルキューを復元:",
                originalQueueData.length + "曲"
              );
            }
          }
        } catch (error) {
          console.warn("キュー設定の読み込みに失敗:", error);
          // エラー時は初期状態にリセット
          this.queue = [];
          this.nowPlayingIndex = 0;
          this.originalQueue = [];
        }
      }
    },

    saveQueueSettings() {
      if (typeof localStorage !== "undefined") {
        try {
          localStorage.setItem("player-queue", JSON.stringify(this.queue));
          localStorage.setItem(
            "player-queue-index",
            this.nowPlayingIndex.toString()
          );
          localStorage.setItem(
            "player-original-queue",
            JSON.stringify(this.originalQueue)
          );
          console.log("キュー設定を保存:", {
            queueLength: this.queue.length,
            index: this.nowPlayingIndex,
            originalQueueLength: this.originalQueue.length,
          });
        } catch (error) {
          console.warn("キュー設定の保存に失敗:", error);
        }
      }
    },

    clearQueueSettings() {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("player-queue");
        localStorage.removeItem("player-queue-index");
        localStorage.removeItem("player-original-queue");
        console.log("キュー設定をクリア");
      }
    },
  },
});
