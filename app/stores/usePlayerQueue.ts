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
    isInitializing: false, // 初期化中フラグ(ローカルストレージ復元時)
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
        isInitializing: this.isInitializing,
      });

      // キューが空だったかどうかを記録
      const wasEmpty = this.queue.length === 0;

      if (toTop) {
        this.queue.splice(this.nowPlayingIndex + 1, 0, song);
      } else {
        this.queue.push(song);
      }
      this.saveQueueSettings(); // 自動保存

      // キューが空から曲が追加された場合、先頭の曲を読み込んで再生待ち状態にする
      // ただし、初期化中(ローカルストレージからの復元)は除く
      if (wasEmpty && !this.isInitializing) {
        console.log(
          "Queue was empty, loading first track for ready state (cued)"
        );
        const playerStore = usePlayerStore();
        const firstTrack = this.queue[0];

        if (firstTrack) {
          // プレイヤーストアに現在のトラックを設定
          playerStore.setTrack(firstTrack);

          // 自動再生フラグをfalseに設定(再生待ち状態)
          playerStore.setShouldAutoPlay(false);

          // YouTube Playerが準備できている場合、動画をロード
          if (
            playerStore.isPlayerReady &&
            playerStore.ytPlayer &&
            typeof playerStore.ytPlayer.cueVideoById === "function" &&
            firstTrack.video?.url
          ) {
            // YouTube URLから動画IDを抽出
            const extractVideoId = (url: string): string | null => {
              const regExp =
                /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
              const match = url.match(regExp);
              return match && match[7] && match[7].length === 11
                ? match[7]
                : null;
            };

            const videoId = extractVideoId(firstTrack.video.url);
            if (videoId) {
              try {
                const startTime = firstTrack.start_at || 0;
                // cueVideoById を使用して動画を準備状態でロード
                playerStore.ytPlayer.cueVideoById(videoId, startTime);
                console.log("空キューへの追加後、動画をロードしました:", {
                  videoId,
                  songTitle: firstTrack.title,
                  startAt: startTime,
                });
              } catch (error) {
                console.warn("動画ロードに失敗:", error);
              }
            }
          }
        }
      }
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
          // 最後の曲を削除した場合、インデックスを調整して前の曲を再生
          this.nowPlayingIndex = this.queue.length - 1;
          const playerStore = usePlayerStore();
          playerStore.setTransitionReason("manual");
          this.saveQueueSettings(); // 自動保存
          // 明示的に再生処理を実行
          this.playCurrentTrack();
        } else {
          // 削除された曲の位置に新しい曲が入った場合、その曲を再生
          const playerStore = usePlayerStore();
          playerStore.setTransitionReason("manual");
          this.saveQueueSettings(); // 自動保存
          // 明示的に再生処理を実行
          this.playCurrentTrack();
        }
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
    // 明示的に楽曲を選択して再生する
    play(index: number) {
      if (index >= 0 && index < this.queue.length) {
        const playerStore = usePlayerStore();
        // 直接楽曲を選択する場合は常にmanual
        playerStore.setTransitionReason("manual");
        this.nowPlayingIndex = index;
        this.saveQueueSettings(); // 自動保存

        // 明示的に再生処理を実行
        this.playCurrentTrack();
      }
    },

    // 次の曲へ移動して再生
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

        // 明示的に再生処理を実行
        this.playCurrentTrack();
      }
    },

    // 前の曲へ移動して再生
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

        // 明示的に再生処理を実行
        this.playCurrentTrack();
      }
    },

    // 現在のトラックを再生（GlobalYouTubePlayerの処理を呼び出す）
    // この関数はGlobalYouTubePlayerから提供されるコールバック関数を格納
    playCurrentTrack() {
      // この関数は実行時にGlobalYouTubePlayerから設定される
      console.log(
        "playCurrentTrack called - should be overridden by GlobalYouTubePlayer"
      );
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
      if (this.queue.length <= 1) {
        console.log("キューが空または1曲のみのためシャッフル不要");
        return;
      }

      // 現在再生中の曲を記憶
      const currentTrack = this.nowPlaying;

      // Fisher-Yatesアルゴリズムでシャッフル
      for (let i = this.queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
      }

      // 現在再生中の曲がある場合、先頭に移動
      if (currentTrack) {
        const currentIndex = this.queue.findIndex(
          (item) =>
            item.id === currentTrack.id &&
            item.video?.id === currentTrack.video?.id
        );

        if (currentIndex !== -1 && currentIndex !== 0) {
          // 現在の曲をキューから取り出して先頭に挿入
          const [current] = this.queue.splice(currentIndex, 1);
          this.queue.unshift(current);
        }

        // 現在再生中のインデックスを先頭(0)に設定
        this.nowPlayingIndex = 0;
      }

      this.saveQueueSettings(); // 自動保存
      console.log("キューをシャッフルしました（現在再生中の曲を先頭に配置）");
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

        // 明示的に再生処理を実行
        this.playCurrentTrack();
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
      // 初期化開始
      this.isInitializing = true;

      if (typeof localStorage !== "undefined") {
        // 旧シャッフルシステムのデータをクリーンアップ
        localStorage.removeItem("player-original-queue");
        localStorage.removeItem("player-is-shuffled");

        try {
          const savedQueue = localStorage.getItem("player-queue");
          const savedIndex = localStorage.getItem("player-queue-index");

          let queueRestored = false;

          if (savedQueue) {
            const queueData = JSON.parse(savedQueue);
            if (Array.isArray(queueData) && queueData.length > 0) {
              this.queue = queueData;
              queueRestored = true;
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

          // キューが復元された場合、プレイヤーの再生を明示的に停止し、現在の楽曲をロード
          if (queueRestored) {
            const playerStore = usePlayerStore();

            // 現在再生中の楽曲を取得
            const currentTrack = this.nowPlaying;

            if (currentTrack) {
              // プレイヤーストアに現在のトラックを設定
              playerStore.setTrack(currentTrack);

              // 自動再生フラグを明示的にfalseに設定（ページロード時は自動再生しない）
              playerStore.setShouldAutoPlay(false);

              // YouTube Playerの初期化を待つため、遅延実行でロード処理を行う
              setTimeout(() => {
                const updatedPlayerStore = usePlayerStore();
                if (
                  updatedPlayerStore.isPlayerReady &&
                  updatedPlayerStore.ytPlayer &&
                  typeof updatedPlayerStore.ytPlayer.cueVideoById ===
                    "function" &&
                  currentTrack.video?.url
                ) {
                  // YouTube URLから動画IDを抽出
                  const extractVideoId = (url: string): string | null => {
                    const regExp =
                      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
                    const match = url.match(regExp);
                    return match && match[7] && match[7].length === 11
                      ? match[7]
                      : null;
                  };

                  const videoId = extractVideoId(currentTrack.video.url);
                  if (videoId) {
                    try {
                      const startTime = currentTrack.start_at || 0;
                      // cueVideoById を使用して動画を準備状態でロード
                      updatedPlayerStore.ytPlayer.cueVideoById(
                        videoId,
                        startTime
                      );
                      console.log("キュー復元後、動画をロードしました:", {
                        videoId,
                        songTitle: currentTrack.title,
                        startAt: startTime,
                      });
                    } catch (error) {
                      console.warn("動画ロードに失敗:", error);
                    }
                  }
                }
              }, 1000); // 1秒待機してからロード処理を実行

              // プレイヤーが再生中の場合は停止
              if (playerStore.isPlaying) {
                playerStore.pause();
                console.log("キュー復元後、プレイヤーを停止しました");
              }
            }
          }
        } catch (error) {
          console.warn("キュー設定の読み込みに失敗:", error);
          // エラー時は初期状態にリセット
          this.queue = [];
          this.nowPlayingIndex = 0;
        } finally {
          // 初期化完了
          this.isInitializing = false;
          console.log("キュー初期化完了");
        }
      } else {
        // localStorage が利用できない場合も初期化完了
        this.isInitializing = false;
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
          console.log("キュー設定を保存:", {
            queueLength: this.queue.length,
            index: this.nowPlayingIndex,
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
        console.log("キュー設定をクリア");
      }
    },
  },
});
