/* * YouTube Player Component * * 連続再生の仕組み: * 1. autoJump:
時間ベースで1秒ごとに監視し、end_at到達時に次曲へ遷移（確実に動作） * 2.
onPlayerStateChange: CUED状態での自動再生開始のみ処理（ENDEDイベントは使わない）
* 3. onPlayerError: エラー時の次曲スキップ処理 * * iPhone/Chrome対応: * -
autoJumpによる時間ベース監視で確実な連続再生を実現 * -
ユーザーインタラクション後の自動再生をシンプルに処理 */

<script setup lang="ts">
  import { ref, onMounted, watch, nextTick, onBeforeUnmount } from "vue";
  import { usePlayerStore } from "~/stores/player";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";

  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  const playerId = "youtube-player";
  const playerContainer = ref<HTMLDivElement>();
  let updateInterval: NodeJS.Timeout | null = null;
  let playCurrentTrackDebounce: NodeJS.Timeout | null = null;
  let previousVideoId: string | null = null; // 前の動画IDを保存
  let previousSongId: number | null = null; // 前の楽曲IDを保存

  // プレイヤーの準備完了を待つヘルパー関数
  const waitForPlayerReady = (timeout = 5000): Promise<boolean> => {
    return new Promise((resolve) => {
      if (playerStore.ytPlayer && playerStore.isPlayerReady) {
        resolve(true);
        return;
      }

      const startTime = Date.now();
      const checkReady = () => {
        if (playerStore.ytPlayer && playerStore.isPlayerReady) {
          resolve(true);
        } else if (Date.now() - startTime < timeout) {
          setTimeout(checkReady, 50);
        } else {
          resolve(false);
        }
      };
      checkReady();
    });
  };

  // YouTube Player の初期化
  const initializePlayer = () => {
    if (!window.YT || !window.YT.Player) {
      console.warn("YouTube API not loaded");
      return;
    }

    if (playerStore.ytPlayer) {
      playerStore.ytPlayer.destroy();
      playerStore.isPlayerReady = false;
    }

    // 前の動画IDと楽曲IDをリセット
    previousVideoId = null;
    previousSongId = null;

    const player = new window.YT.Player(playerId, {
      height: "360",
      width: "640",
      videoId: "",
      playerVars: {
        autoplay: 1, // モバイル対応のため有効化
        controls: 0, // コントロールを非表示
        disablekb: 1, // キーボード操作を無効化
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        playsinline: 1, // iOS対応（旧プロジェクトと同じ設定）
        origin: window.location.origin, // モバイル対応強化
        vq: "tiny", // 初期画質を最低品質に設定
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    });

    playerStore.setPlayerInstance(player);
  };

  // プレイヤー準備完了時
  const onPlayerReady = (event: any) => {
    console.log("YouTube Player ready");

    // プレイヤーが準備完了したことを明示的に設定
    playerStore.isPlayerReady = true;

    // ページロード時の自動再生を防ぐため、初期状態ではshouldAutoPlayをfalseに設定
    playerStore.setShouldAutoPlay(false);

    console.log("Player ready - autoplay disabled for initial load");

    // 保存された音量設定をYouTubeプレイヤーに適用
    if (playerStore.ytPlayer) {
      playerStore.ytPlayer.setVolume(playerStore.volume);
      if (playerStore.isMuted) {
        playerStore.ytPlayer.mute();
      } else {
        playerStore.ytPlayer.unMute();
      }
      console.log("YouTube Player初期化時に音量設定を適用:", {
        volume: playerStore.volume,
        muted: playerStore.isMuted,
      });

      // 初期画質を最低品質に設定
      playerStore.ytPlayer.setPlaybackQuality("tiny");
      console.log("初期画質をtinyに設定");
    }

    // 現在時刻の更新を開始（旧プロジェクトと同じ1秒間隔）
    updateInterval = setInterval(() => {
      if (playerStore.ytPlayer && playerStore.isPlaying) {
        const currentTime = playerStore.ytPlayer.getCurrentTime();
        const duration = playerStore.ytPlayer.getDuration();

        playerStore.setCurrentTime(currentTime);
        playerStore.setDuration(duration);

        // 旧プロジェクトのように時間ベースで自動ジャンプを実行
        autoJump(currentTime);
      }
    }, 1000); // 旧プロジェクトと同じ1秒間隔
  };

  // 時間ベースの自動ジャンプ（古いプロジェクトの仕組みを参考）
  const autoJump = (currentTime: number) => {
    const currentTrack = queueStore.nowPlaying;
    if (!currentTrack || !playerStore.isPlaying) {
      return;
    }

    const endTime = currentTrack.end_at;
    if (!endTime) {
      return;
    }

    // 現在時刻が終了時刻に達したか（旧プロジェクトと同じ判定）
    if (Math.ceil(currentTime) >= Math.ceil(endTime)) {
      console.log("Track reached end time, auto-jumping with repeat logic");

      // リピートモードを考慮した遷移処理
      const repeatMode = playerStore.repeatMode;

      if (repeatMode === "one") {
        // 同じ曲をリピート（旧システムと同様）
        console.log("Repeat one: restarting current track");
        playerStore.seek(currentTrack.start_at || 0);
        if (!playerStore.isPlaying) {
          playerStore.play();
        }
        return;
      }

      // 一度再生を停止してから次の処理へ移行（旧プロジェクトの手法）
      if (playerStore.ytPlayer && playerStore.isPlayerReady) {
        playerStore.ytPlayer.pauseVideo();
      }

      // 遷移理由を設定
      playerStore.setTransitionReason("auto-jump");

      if (repeatMode === "all" && !queueStore.hasNext) {
        // 全体リピート: 最後の曲なら最初に戻る
        console.log("Repeat all: jumping to first track");
        queueStore.play(0);
      } else if (queueStore.hasNext) {
        // 通常の次の曲へ（明示的にnext()を呼び出す）
        queueStore.next();
      }
      // repeatMode === 'none' かつ最後の曲の場合は何もしない（再生停止）
    }
  };

  // プレイヤー状態変更時
  const onPlayerStateChange = (event: any) => {
    const states = {
      [-1]: "UNSTARTED",
      [0]: "ENDED",
      [1]: "PLAYING",
      [2]: "PAUSED",
      [3]: "BUFFERING",
      [5]: "CUED",
    } as const;

    const newState = states[event.data as keyof typeof states] || "UNSTARTED";
    playerStore.setPlayerState(newState);

    console.log(
      `Player state changed: ${playerStore.playerState} -> ${newState}`
    );

    // CUED状態から自動的にPLAYINGに移行（モバイル対応）
    if (newState === "CUED" && playerStore.shouldAutoPlay) {
      console.log("Video cued, attempting autoplay for mobile");
      setTimeout(() => {
        if (playerStore.ytPlayer && playerStore.isPlayerReady) {
          playerStore.ytPlayer.playVideo();
        }
      }, 100);
    }

    // ENDED状態での次曲自動再生（フォールバック機能）
    // autoJumpでカバーされない場合のみ実行
    if (newState === "ENDED" && playerStore.transitionReason !== "auto-jump") {
      console.log("Video ended naturally, handling with repeat logic");

      const repeatMode = playerStore.repeatMode;

      if (repeatMode === "one") {
        // 同じ曲をリピート
        console.log("Repeat one: restarting current track");
        const currentTrack = queueStore.nowPlaying;
        if (currentTrack) {
          playerStore.seek(currentTrack.start_at || 0);
          playerStore.play();
        }
        return;
      }

      // 遷移理由を設定
      playerStore.setTransitionReason("auto-end");

      if (repeatMode === "all" && !queueStore.hasNext) {
        // 全体リピート: 最後の曲なら最初に戻る
        console.log("Repeat all: jumping to first track");
        queueStore.play(0);
      } else if (queueStore.hasNext) {
        // 通常の次の曲へ（明示的にnext()を呼び出す）
        queueStore.next();
      }
      // repeatMode === 'none' かつ最後の曲の場合は何もしない（再生停止）
    }
  };

  // プレイヤーエラー時
  const onPlayerError = (event: any) => {
    console.error("YouTube Player Error:", event.data);

    // リトライ可能な場合は現在の曲を再試行
    if (playerStore.canRetry()) {
      console.log(
        `Retrying current track (attempt ${playerStore.retryCount + 1}/${
          playerStore.maxRetries
        })`
      );
      playerStore.incrementRetryCount();

      // 3秒後にリトライ
      setTimeout(() => {
        if (queueStore.nowPlaying) {
          playerStore.setTransitionReason("error");
          playCurrentTrack(true); // 自動再生でリトライ
        }
      }, 3000);
      return;
    }

    // リトライ回数上限に達した場合は次の曲へ
    console.log("Max retries reached, trying next track");
    playerStore.resetRetryCount(); // カウンターをリセット

    if (queueStore.hasNext) {
      console.log("Player error occurred, trying next track");
      playerStore.setTransitionReason("error");
      queueStore.next(); // 明示的にnext()を呼び出す
    }
  };

  // 現在のトラックを再生（デバウンス機能付き）
  const playCurrentTrack = async (isAutoPlay?: boolean) => {
    // 高速な連続操作を防ぐためのデバウンス
    if (playCurrentTrackDebounce) {
      clearTimeout(playCurrentTrackDebounce);
    }

    playCurrentTrackDebounce = setTimeout(async () => {
      await executePlayCurrentTrack(isAutoPlay);
    }, 50); // 50ms のデバウンス
  };

  // 実際の再生処理
  const executePlayCurrentTrack = async (isAutoPlay?: boolean) => {
    const currentTrack = queueStore.nowPlaying;
    if (!currentTrack) {
      console.log("No current track");
      return;
    }

    // プレイヤーの準備状態を厳密にチェック
    if (!playerStore.ytPlayer || !playerStore.isPlayerReady) {
      console.log("Player not ready, waiting...", {
        hasYtPlayer: !!playerStore.ytPlayer,
        isPlayerReady: playerStore.isPlayerReady,
      });

      const isReady = await waitForPlayerReady();
      if (!isReady) {
        console.warn("Player initialization timeout");
        return;
      }
    }

    // プレイヤーメソッドの存在確認（重要: TypeError防止）
    if (
      typeof playerStore.ytPlayer?.loadVideoById !== "function" ||
      typeof playerStore.ytPlayer?.seekTo !== "function" ||
      typeof playerStore.ytPlayer?.playVideo !== "function"
    ) {
      console.error(
        "YouTube Player methods are not available. Player may not be properly initialized.",
        {
          ytPlayer: playerStore.ytPlayer,
          hasLoadVideoById: typeof playerStore.ytPlayer?.loadVideoById,
          hasSeekTo: typeof playerStore.ytPlayer?.seekTo,
          hasPlayVideo: typeof playerStore.ytPlayer?.playVideo,
        }
      );

      // プレイヤーの再初期化を試みる
      console.log("Attempting to reinitialize player...");
      initializePlayer();

      // 再初期化後に再度待機
      const isReady = await waitForPlayerReady();
      if (!isReady) {
        console.error("Failed to reinitialize player");
        return;
      }
    }

    console.log("Player ready, continuing with playback");

    // 遷移理由に基づいて自動再生を決定
    const shouldAutoPlay =
      isAutoPlay ??
      (playerStore.transitionReason === "auto-jump" ||
        playerStore.transitionReason === "auto-end" ||
        playerStore.transitionReason === "error");

    console.log(
      "Playing track:",
      currentTrack.title,
      "autoPlay:",
      shouldAutoPlay,
      "reason:",
      playerStore.transitionReason
    );
    playerStore.setTrack(currentTrack);

    // 新しい曲の再生開始時にリトライカウンターをリセット
    if (playerStore.transitionReason !== "error") {
      playerStore.resetRetryCount();
    }

    const videoId = playerStore.currentVideoId;
    if (!videoId) {
      console.error("Invalid video URL:", currentTrack.video?.url);

      // 無効URLの場合、次の曲を自動的に試行
      if (queueStore.hasNext) {
        console.log("Skipping invalid video, trying next track");
        playerStore.setTransitionReason("error");
        queueStore.next(); // 明示的にnext()を呼び出す
      }
      return;
    }

    console.log("executePlayCurrentTrack - Analyzing transition:", {
      videoId,
      songId: currentTrack.id,
      title: currentTrack.title,
      start: currentTrack.start_at,
      end: currentTrack.end_at,
      previousVideoId,
      previousSongId,
      sameVideo: videoId === previousVideoId,
      sameSong: currentTrack.id === previousSongId,
      playerReady: playerStore.ytPlayer && playerStore.isPlayerReady,
    });

    // 同じ動画かつ同じ楽曲の場合の処理
    if (
      videoId === previousVideoId &&
      currentTrack.id === previousSongId &&
      playerStore.ytPlayer &&
      playerStore.isPlayerReady
    ) {
      // キューの移動（手動、前/次）の場合は必ず先頭から再生
      if (
        playerStore.transitionReason === "manual" ||
        playerStore.transitionReason === "queue-navigation"
      ) {
        console.log(
          "✅ CONDITION: Same song via queue navigation, restarting from beginning"
        );
        console.log("Track transition:", {
          videoId,
          songId: currentTrack.id,
          title: currentTrack.title,
          startTime: currentTrack.start_at || 0,
          endTime: currentTrack.end_at,
          shouldAutoPlay,
          reason: playerStore.transitionReason,
        });

        const startTime = currentTrack.start_at || 0;
        console.log(
          "🔍 DEBUG: Using loadVideoById for reliable restart at:",
          startTime
        );

        // 確実に指定位置から開始するためloadVideoByIdを使用
        playerStore.ytPlayer.loadVideoById({
          videoId,
          startSeconds: startTime,
          endSeconds: currentTrack.end_at || undefined,
        });

        // 自動再生フラグを設定
        playerStore.setShouldAutoPlay(true);

        // 遷移理由をリセット
        playerStore.setTransitionReason(null);

        // 前の動画IDと楽曲IDを更新
        previousVideoId = videoId;
        previousSongId = currentTrack.id;
        return;
      }

      // リピート再生の場合は従来通りの処理
      console.log(
        "✅ CONDITION: Same song via repeat, seeking to start and restart playback"
      );
      console.log("Track transition:", {
        videoId,
        songId: currentTrack.id,
        title: currentTrack.title,
        startTime: currentTrack.start_at || 0,
        endTime: currentTrack.end_at,
        shouldAutoPlay,
        reason: playerStore.transitionReason,
      });

      // 楽曲の開始時間にシーク
      const startTime = currentTrack.start_at || 0;
      playerStore.ytPlayer.seekTo(startTime, true);

      // 再生開始（同じ楽曲でも新しく再生開始する）
      playerStore.setShouldAutoPlay(true);
      playerStore.ytPlayer.playVideo();

      // 遷移理由をリセット
      playerStore.setTransitionReason(null);

      // 前の動画IDと楽曲IDを更新（既に同じだが明示的に更新）
      previousVideoId = videoId;
      previousSongId = currentTrack.id;
      return;
    }

    // 同じ動画だが異なる楽曲の場合はシークのみ実行
    if (
      videoId === previousVideoId &&
      currentTrack.id !== previousSongId &&
      playerStore.ytPlayer &&
      playerStore.isPlayerReady
    ) {
      console.log(
        "✅ CONDITION: Same video but different song, seeking to start position instead of reloading"
      );
      console.log("Track transition:", {
        videoId,
        songId: currentTrack.id,
        title: currentTrack.title,
        startTime: currentTrack.start_at || 0,
        endTime: currentTrack.end_at,
        shouldAutoPlay,
        reason: playerStore.transitionReason,
      });

      // 開始時間にシーク
      const startTime = currentTrack.start_at || 0;
      playerStore.ytPlayer.seekTo(startTime, true);

      // 確実に再生を開始
      playerStore.setShouldAutoPlay(true);
      playerStore.ytPlayer.playVideo();

      // 遷移理由をリセット
      playerStore.setTransitionReason(null);

      // 前の動画IDと楽曲IDを更新
      previousVideoId = videoId;
      previousSongId = currentTrack.id;
      return;
    }

    // 異なる動画の場合は通常の読み込み処理
    console.log(
      "✅ CONDITION: Different video or first load, loading new video"
    );

    // モバイル対応: 自動再生フラグを適切に設定
    if (shouldAutoPlay && playerStore.hasUserInteracted) {
      playerStore.setShouldAutoPlay(true);
    } else if (!shouldAutoPlay) {
      playerStore.setShouldAutoPlay(false);
    }

    // 動画を読み込み（旧プロジェクトと同様の方式）
    playerStore.ytPlayer.loadVideoById({
      videoId,
      startSeconds: currentTrack.start_at || 0,
      endSeconds: currentTrack.end_at || undefined,
    });

    // 手動再生の場合は明示的に再生開始
    if (!shouldAutoPlay) {
      const isReady = await waitForPlayerReady();
      if (isReady && playerStore.ytPlayer && playerStore.isPlayerReady) {
        playerStore.ytPlayer.playVideo();
      }
    }
    // 自動再生の場合はCUED状態からonStateChangeで処理される

    // 遷移理由をリセット
    playerStore.setTransitionReason(null);

    // 前の動画IDと楽曲IDを更新
    previousVideoId = videoId;
    previousSongId = currentTrack.id;
  };

  // 音量変更を監視
  watch(
    () => playerStore.volume,
    (newVolume) => {
      if (playerStore.ytPlayer && playerStore.isPlayerReady) {
        playerStore.ytPlayer.setVolume(newVolume);
      }
    }
  );

  // ミュート状態を監視
  watch(
    () => playerStore.isMuted,
    (isMuted) => {
      if (playerStore.ytPlayer && playerStore.isPlayerReady) {
        if (isMuted) {
          playerStore.ytPlayer.mute();
        } else {
          playerStore.ytPlayer.unMute();
        }
      }
    }
  );

  // キューの停止フラグを監視
  watch(
    () => queueStore.shouldStop,
    (shouldStop) => {
      if (shouldStop) {
        console.log("Queue requested to stop playback");
        // プレイヤーを停止
        playerStore.stop();
        // フラグをリセット
        queueStore.resetStopFlag();
      }
    }
  );

  // YouTubeプレイヤー表示状態の変更を監視して画質を切り替え
  watch(
    () => playerStore.showYouTubePlayer,
    (isVisible) => {
      if (!playerStore.ytPlayer || !playerStore.isPlayerReady) {
        return;
      }

      if (isVisible) {
        // 全面表示時は高画質に切り替え
        console.log("プレイヤー表示: 画質を高解像度に変更");
        // 利用可能な画質を取得
        const availableQualities =
          playerStore.ytPlayer.getAvailableQualityLevels();
        console.log("利用可能な画質:", availableQualities);

        // 優先順位: hd1080 > hd720 > large > medium
        if (availableQualities.includes("hd1080")) {
          playerStore.ytPlayer.setPlaybackQuality("hd1080");
          console.log("画質をhd1080に設定");
        } else if (availableQualities.includes("hd720")) {
          playerStore.ytPlayer.setPlaybackQuality("hd720");
          console.log("画質をhd720に設定");
        } else if (availableQualities.includes("large")) {
          playerStore.ytPlayer.setPlaybackQuality("large");
          console.log("画質をlargeに設定");
        } else if (availableQualities.includes("medium")) {
          playerStore.ytPlayer.setPlaybackQuality("medium");
          console.log("画質をmediumに設定");
        }
      } else {
        // 非表示時は最低画質に戻す
        console.log("プレイヤー非表示: 画質をtinyに変更");
        playerStore.ytPlayer.setPlaybackQuality("tiny");
      }
    }
  );

  onMounted(async () => {
    await nextTick();

    // queueStoreのplayCurrentTrack関数を設定
    // これにより、queueStoreから明示的に再生処理を呼び出せるようになる
    queueStore.playCurrentTrack = () => {
      playCurrentTrack();
    };

    // YouTube API の読み込みを待つ
    const checkYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
      } else {
        setTimeout(checkYouTubeAPI, 100);
      }
    };

    checkYouTubeAPI();
  });

  // コンポーネント破棄時のクリーンアップ
  onBeforeUnmount(() => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    if (playCurrentTrackDebounce) {
      clearTimeout(playCurrentTrackDebounce);
    }
  });
</script>

<template>
  <!-- プレイヤーコンテナ（常に存在、表示状態で切り替え） -->
  <div>
    <!-- フルスクリーン表示オーバーレイ（z-30でフッターより下） -->
    <div
      v-show="playerStore.showYouTubePlayer"
      class="fixed inset-0 z-30 flex items-center justify-center bg-black/80 pt-20 pb-50"
      @click.self="playerStore.toggleYouTubePlayer()"
    >
      <div class="relative w-full max-w-5xl mx-4 my-auto">
        <!-- YouTubeプレイヤーコンテナ（フッター分の下マージンを確保） -->
        <div
          class="relative w-full bg-black rounded-lg overflow-hidden shadow-2xl"
          style="padding-bottom: 56.25%"
        >
          <div class="absolute inset-0">
            <div ref="playerContainer" class="w-full h-full">
              <div :id="playerId" class="w-full h-full"></div>
            </div>
          </div>
        </div>

        <!-- 楽曲情報 -->
        <div
          v-if="queueStore.nowPlaying"
          class="mt-4 text-white text-center bg-gray-900/80 rounded-lg p-4"
        >
          <h3 class="text-xl font-bold">{{ queueStore.nowPlaying.title }}</h3>
          <p class="text-gray-300 mt-1">
            {{ queueStore.nowPlaying.artist || "Unknown Artist" }}
          </p>
        </div>
      </div>
    </div>

    <!-- 非表示時のプレイヤー位置（playerContainerとplayerIdを共有） -->
    <!-- v-showがfalseの時はここには何も表示されない（上のオーバーレイ内に存在） -->
  </div>
</template>
