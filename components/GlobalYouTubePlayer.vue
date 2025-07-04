<script setup lang="ts">
  import { ref, onMounted, watch, nextTick, onBeforeUnmount } from "vue";
  import { usePlayerStore } from "~/stores/player";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";

  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  const playerId = "youtube-player";
  const playerContainer = ref<HTMLDivElement>();
  let updateInterval: NodeJS.Timeout | null = null;

  // YouTube Player の初期化
  const initializePlayer = () => {
    if (!window.YT || !window.YT.Player) {
      console.warn("YouTube API not loaded");
      return;
    }

    if (playerStore.ytPlayer) {
      playerStore.ytPlayer.destroy();
    }

    const player = new window.YT.Player(playerId, {
      height: "0",
      width: "0",
      videoId: "",
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
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

    // 現在時刻の更新を開始
    updateInterval = setInterval(() => {
      if (playerStore.ytPlayer && playerStore.isPlaying) {
        const currentTime = playerStore.ytPlayer.getCurrentTime();
        const duration = playerStore.ytPlayer.getDuration();

        playerStore.setCurrentTime(currentTime);
        playerStore.setDuration(duration);
      }
    }, 1000);
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

    // 曲終了時は次の曲を再生
    if (newState === "ENDED" && queueStore.hasNext) {
      queueStore.next();
      playCurrentTrack();
    }
  };

  // プレイヤーエラー時
  const onPlayerError = (event: any) => {
    console.error("YouTube Player Error:", event.data);

    // エラー時は次の曲を試す
    if (queueStore.hasNext) {
      queueStore.next();
      playCurrentTrack();
    }
  };

  // 現在のトラックを再生
  const playCurrentTrack = async () => {
    const currentTrack = queueStore.nowPlaying;
    if (!currentTrack || !playerStore.ytPlayer) {
      console.log("No current track or player not ready:", {
        currentTrack,
        player: playerStore.ytPlayer,
      });
      return;
    }

    console.log("Playing track:", currentTrack);
    playerStore.setTrack(currentTrack);

    const videoId = playerStore.currentVideoId;
    if (!videoId) {
      console.error("Invalid video URL:", currentTrack.video?.url);
      return;
    }

    console.log(
      "Loading video:",
      videoId,
      "start:",
      currentTrack.start_at,
      "end:",
      currentTrack.end_at
    );

    // 動画を読み込み
    playerStore.ytPlayer.loadVideoById({
      videoId,
      startSeconds: currentTrack.start_at || 0,
      endSeconds: currentTrack.end_at || undefined,
    });
  };

  // キューの変更を監視
  watch(
    () => queueStore.nowPlaying,
    (newTrack) => {
      if (newTrack) {
        playCurrentTrack();
      }
    },
    { immediate: true }
  );

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

  onMounted(async () => {
    await nextTick();

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
  });
</script>

<template>
  <!-- 非表示のYouTubeプレイヤー（音声のみ） -->
  <div class="hidden">
    <div ref="playerContainer">
      <div :id="playerId"></div>
    </div>
  </div>
</template>
