<script setup lang="ts">
  import { computed, ref } from "vue";
  import { usePlayerStore } from "~/stores/player";
  import { usePlayerQueue } from "~/stores/usePlayerQueue";

  const playerStore = usePlayerStore();
  const queueStore = usePlayerQueue();

  // モバイルサブメニューの表示状態
  const showMobileMenu = ref(false);

  // ドラッグ状態の管理
  const isDragging = ref(false);
  const wasPlayingBeforeDrag = ref(false);

  // モバイルサブメニューの切り替え
  const toggleMobileMenu = () => {
    showMobileMenu.value = !showMobileMenu.value;
  };

  // 時間フォーマット関数
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 現在の楽曲情報
  const currentTrack = computed(() => queueStore.nowPlaying);
  const currentTrackTitle = computed(() => {
    if (!currentTrack.value) return "再生中の楽曲はありません";
    return `${currentTrack.value.title} - ${
      currentTrack.value.artist || "Unknown Artist"
    }`;
  });

  // 楽曲範囲での進行状況計算
  const trackProgress = computed(() => {
    if (!currentTrack.value || !playerStore.duration) return 0;

    const startTime = currentTrack.value.start_at || 0;
    const endTime = currentTrack.value.end_at || playerStore.duration;
    const trackDuration = endTime - startTime;
    const currentProgress = Math.max(0, playerStore.currentTime - startTime);

    return trackDuration > 0 ? (currentProgress / trackDuration) * 100 : 0;
  });

  // より細かい進行状況計算（1000分割）
  const trackProgressDetailed = computed(() => {
    if (!currentTrack.value || !playerStore.duration) return 0;

    const startTime = currentTrack.value.start_at || 0;
    const endTime = currentTrack.value.end_at || playerStore.duration;
    const trackDuration = endTime - startTime;
    const currentProgress = Math.max(0, playerStore.currentTime - startTime);

    return trackDuration > 0 ? (currentProgress / trackDuration) * 1000 : 0;
  });

  // 楽曲の表示時間計算
  const trackCurrentTime = computed(() => {
    if (!currentTrack.value) return 0;
    const startTime = currentTrack.value.start_at || 0;
    return Math.max(0, playerStore.currentTime - startTime);
  });

  const trackDuration = computed(() => {
    if (!currentTrack.value) return 0;
    const startTime = currentTrack.value.start_at || 0;
    const endTime = currentTrack.value.end_at || playerStore.duration;
    return Math.max(0, endTime - startTime);
  });

  // 再生/一時停止の切り替え
  const togglePlayPause = () => {
    if (playerStore.isPlaying) {
      playerStore.pause();
    } else {
      playerStore.play();
    }
  };

  // 前の曲
  const playPrevious = () => {
    queueStore.previous();
  };

  // 次の曲
  const playNext = () => {
    queueStore.next();
  };

  // シークバーの操作（楽曲範囲内）
  const onSeek = (event: Event) => {
    if (!currentTrack.value) return;

    const input = event.target as HTMLInputElement;
    const progressRatio = parseFloat(input.value) / 1000; // 1000分割に対応

    const startTime = currentTrack.value.start_at || 0;
    const endTime = currentTrack.value.end_at || playerStore.duration;
    const trackDuration = endTime - startTime;

    const seekTime = startTime + trackDuration * progressRatio;
    playerStore.seek(seekTime);
  };

  // ドラッグ開始
  const onSeekStart = () => {
    if (!currentTrack.value) return;

    isDragging.value = true;
    wasPlayingBeforeDrag.value = playerStore.isPlaying;

    if (playerStore.isPlaying) {
      playerStore.pause();
    }
  };

  // ドラッグ終了
  const onSeekEnd = () => {
    if (!currentTrack.value) return;

    isDragging.value = false;

    if (wasPlayingBeforeDrag.value) {
      playerStore.play();
    }
  };

  // 音量調整
  const onVolumeChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    playerStore.setVolume(parseInt(input.value));
  };

  // シャッフル機能
  const toggleShuffle = () => {
    playerStore.setUserInteracted(true);
    playerStore.toggleShuffle();
    queueStore.shuffleQueue();
  };

  // リピート機能
  const toggleRepeat = () => {
    playerStore.setUserInteracted(true);
    playerStore.cycleRepeatMode();
  };

  // Xでシェア用のURL生成
  const shareOnX = () => {
    if (!currentTrack.value) return;

    const songUrl = `${window.location.origin}/songs/${currentTrack.value.id}`;
    const text = `Now playing...\n\n『${currentTrack.value.title} / ${
      currentTrack.value.artist || "Unknown Artist"
    }』\n#いぬいのうた\n\n${songUrl}`;

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}`;
    window.open(tweetUrl, "_blank");
  };
</script>

<template>
  <!-- プレイヤーコントロール -->
  <div class="bg-gray-900 text-white border-t border-gray-700">
    <!-- プログレスバー（上部）- インタラクティブシークバー -->
    <div class="w-full bg-gray-700 h-2 relative overflow-hidden">
      <input
        type="range"
        min="0"
        max="1000"
        step="1"
        :value="trackProgressDetailed"
        class="absolute inset-0 w-full h-full bg-transparent appearance-none cursor-pointer progress-slider"
        :style="{ '--progress': `${trackProgress}%` }"
        @input="onSeek"
        @mousedown="onSeekStart"
        @mouseup="onSeekEnd"
        @touchstart="onSeekStart"
        @touchend="onSeekEnd"
        :disabled="!currentTrack"
      />
    </div>

    <!-- デスクトップ版 -->
    <div class="hidden md:block px-4 py-3">
      <div class="flex items-center gap-6">
        <!-- 左側: 動画サムネイル + 楽曲情報 (1/3) -->
        <div class="flex items-center gap-3 min-w-0 w-1/3">
          <!-- 動画サムネイル -->
          <div class="flex-shrink-0">
            <img
              v-if="currentTrack?.video?.thumbnail_path"
              :src="currentTrack.video.thumbnail_path"
              :alt="currentTrack.title"
              class="w-[6.22rem] h-14 rounded object-cover"
              @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
            />
            <div
              v-else
              class="w-[6.22rem] h-14 bg-gray-700 rounded flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"
                />
              </svg>
            </div>
          </div>

          <!-- 楽曲情報 -->
          <div class="min-w-0 flex-1">
            <div class="text-sm font-medium truncate">
              {{ currentTrack?.title || "楽曲を選択してください" }}
            </div>
            <div class="text-xs text-gray-400 flex items-center gap-2">
              <span>{{ formatTime(trackCurrentTime) }}</span>
              <span>/</span>
              <span>{{ formatTime(trackDuration) }}</span>
              <span v-if="currentTrack?.artist" class="truncate">
                · {{ currentTrack.artist }}
              </span>
            </div>
          </div>
        </div>

        <!-- 中央: 再生コントロール (1/3) -->
        <div class="flex items-center justify-center gap-3 w-1/3">
          <!-- シャッフルボタン -->
          <button
            :class="[
              'p-2 rounded-full transition-colors',
              playerStore.isShuffled
                ? 'text-blue-400 bg-blue-900/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-700',
            ]"
            @click="toggleShuffle"
            title="シャッフル"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"
              />
            </svg>
          </button>

          <!-- 前の曲 -->
          <button
            :disabled="!queueStore.hasPrevious"
            :class="[
              'p-2 rounded-full transition-colors',
              queueStore.hasPrevious
                ? 'hover:bg-gray-700 text-white'
                : 'text-gray-500 cursor-not-allowed',
            ]"
            @click="playPrevious"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <!-- 再生/一時停止 -->
          <button
            :disabled="!currentTrack"
            class="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors disabled:bg-gray-600"
            @click="togglePlayPause"
          >
            <svg
              v-if="playerStore.isPlaying"
              class="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
            <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          <!-- 次の曲 -->
          <button
            :disabled="!queueStore.hasNext"
            :class="[
              'p-2 rounded-full transition-colors',
              queueStore.hasNext
                ? 'hover:bg-gray-700 text-white'
                : 'text-gray-500 cursor-not-allowed',
            ]"
            @click="playNext"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          <!-- リピートボタン -->
          <button
            :class="[
              'p-2 rounded-full transition-colors',
              playerStore.repeatMode !== 'none'
                ? 'text-blue-400 bg-blue-900/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-700',
            ]"
            @click="toggleRepeat"
            :title="
              playerStore.repeatMode === 'none'
                ? 'リピートOFF'
                : playerStore.repeatMode === 'all'
                ? 'リピート: 全て'
                : 'リピート: 1曲'
            "
          >
            <svg
              v-if="playerStore.repeatMode === 'one'"
              class="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"
              />
            </svg>
            <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"
              />
            </svg>
          </button>
        </div>

        <!-- 右側: 追加コントロール (1/3) -->
        <div class="flex items-center gap-3 justify-end min-w-0 w-1/3">
          <!-- YouTubeリンク -->
          <a
            v-if="currentTrack?.video?.url"
            :href="currentTrack.video.url"
            target="_blank"
            rel="noopener noreferrer"
            class="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
            title="YouTubeで開く"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
              />
            </svg>
          </a>

          <!-- Xでシェアボタン -->
          <button
            v-if="currentTrack"
            @click="shareOnX"
            class="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
            title="Xでシェア"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
          </button>

          <!-- 音量コントロール -->
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <button
              class="p-1 hover:bg-gray-700 rounded transition-colors flex-shrink-0"
              @click="playerStore.toggleMute()"
            >
              <svg
                v-if="playerStore.isMuted"
                class="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                />
              </svg>
              <svg
                v-else
                class="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                />
              </svg>
            </button>
            <input
              type="range"
              min="0"
              max="100"
              :value="playerStore.volume"
              class="flex-1 h-1 appearance-none cursor-pointer volume-slider"
              :style="{ '--volume-progress': `${playerStore.volume}%` }"
              @input="onVolumeChange"
            />
            <span class="text-xs text-gray-400 w-8 text-right flex-shrink-0">
              {{ playerStore.volume }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- モバイル版 -->
    <div class="block md:hidden px-4 py-4">
      <!-- 全てを1行に配置 -->
      <div class="flex items-center justify-between gap-3">
        <!-- 左側: 楽曲情報 -->
        <div class="flex-1 min-w-0 mr-3">
          <div class="text-sm font-medium truncate">
            {{ currentTrack?.title || "楽曲を選択してください" }}
          </div>
          <div class="text-xs text-gray-400 mt-1">
            {{ formatTime(trackCurrentTime) }}/{{ formatTime(trackDuration) }}
          </div>
        </div>

        <!-- 中央: 再生コントロール -->
        <div class="flex items-center gap-2">
          <button
            :disabled="!queueStore.hasPrevious"
            :class="[
              'p-2 rounded-full transition-colors',
              queueStore.hasPrevious
                ? 'hover:bg-gray-700 text-white'
                : 'text-gray-500 cursor-not-allowed',
            ]"
            @click="playPrevious"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            :disabled="!currentTrack"
            class="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors disabled:bg-gray-600"
            @click="togglePlayPause"
          >
            <svg
              v-if="playerStore.isPlaying"
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          <button
            :disabled="!queueStore.hasNext"
            :class="[
              'p-2 rounded-full transition-colors',
              queueStore.hasNext
                ? 'hover:bg-gray-700 text-white'
                : 'text-gray-500 cursor-not-allowed',
            ]"
            @click="playNext"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        <!-- 右側: メニューボタンのみ -->
        <div class="flex items-center">
          <!-- メニューボタン -->
          <button
            class="p-2 rounded-full transition-colors text-gray-400 hover:text-white hover:bg-gray-700"
            @click="toggleMobileMenu"
            title="メニュー"
          >
            <svg
              class="w-4 h-4 transform transition-transform duration-200"
              :class="{ 'rotate-90': showMobileMenu }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- モバイルサブメニュー -->
      <div
        v-if="showMobileMenu"
        class="border-t border-gray-700 px-4 py-4 mt-2"
      >
        <!-- シャッフル・リピート・YouTubeボタン -->
        <div class="flex items-center justify-center gap-6 mb-4">
          <!-- シャッフルボタン -->
          <button
            :class="[
              'p-3 rounded-xl transition-colors',
              playerStore.isShuffled
                ? 'text-blue-400 bg-blue-900/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-700',
            ]"
            @click="toggleShuffle"
            title="シャッフル"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"
              />
            </svg>
          </button>

          <!-- リピートボタン -->
          <button
            :class="[
              'p-3 rounded-xl transition-colors',
              playerStore.repeatMode !== 'none'
                ? 'text-blue-400 bg-blue-900/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-700',
            ]"
            @click="toggleRepeat"
            :title="
              playerStore.repeatMode === 'none'
                ? 'リピートOFF'
                : playerStore.repeatMode === 'all'
                ? 'リピート: 全て'
                : 'リピート: 1曲'
            "
          >
            <svg
              v-if="playerStore.repeatMode === 'one'"
              class="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"
              />
            </svg>
            <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"
              />
            </svg>
          </button>

          <!-- YouTubeリンク -->
          <a
            v-if="currentTrack?.video?.url"
            :href="currentTrack.video.url"
            target="_blank"
            rel="noopener noreferrer"
            class="p-3 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-xl transition-colors"
            title="YouTubeで開く"
            @click="showMobileMenu = false"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
              />
            </svg>
          </a>

          <!-- Xでシェアボタン -->
          <button
            v-if="currentTrack"
            @click="
              shareOnX();
              showMobileMenu = false;
            "
            class="p-3 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-xl transition-colors"
            title="Xでシェア"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
          </button>
        </div>

        <!-- 音量コントロール -->
        <div class="flex items-center gap-3">
          <button
            class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            @click="playerStore.toggleMute()"
            title="ミュート切り替え"
          >
            <svg
              v-if="playerStore.isMuted"
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
              />
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
              />
            </svg>
          </button>
          <input
            type="range"
            min="0"
            max="100"
            :value="playerStore.volume"
            class="flex-1 h-2 appearance-none cursor-pointer volume-slider-mobile"
            :style="{ '--volume-progress': `${playerStore.volume}%` }"
            @input="onVolumeChange"
          />
          <span class="text-sm text-gray-400 w-10 text-right flex-shrink-0">
            {{ playerStore.volume }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* プログレスバー専用スタイル */
  .progress-slider {
    -webkit-appearance: none;
    appearance: none;
    background: linear-gradient(
      to right,
      #3b82f6 0%,
      #3b82f6 var(--progress, 0%),
      #4b5563 var(--progress, 0%),
      #4b5563 100%
    );
    outline: none;
    border: none;
    margin: 0;
    padding: 0;
    vertical-align: top;
  }

  /* つまみを非表示にする */
  .progress-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 0;
    height: 0;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .progress-slider::-moz-range-thumb {
    width: 0;
    height: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0;
  }

  .progress-slider::-webkit-slider-track {
    background: transparent;
    border-radius: 0;
    height: 8px;
  }

  .progress-slider::-moz-range-track {
    background: transparent;
    border-radius: 0;
    height: 8px;
  }

  .progress-slider:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* 音量スライダー用スタイル - デスクトップ版 */
  .volume-slider {
    width: 100%;
    background: linear-gradient(
      to right,
      #ffffff var(--volume-progress, 0%),
      #4b5563 var(--volume-progress, 0%)
    );
    border-radius: 4px;
    outline: none;
    border: none;
    vertical-align: middle;
  }

  .volume-slider::-webkit-slider-track {
    background: transparent;
    border-radius: 4px;
  }

  .volume-slider::-moz-range-track {
    background: transparent;
    border-radius: 4px;
  }

  .volume-slider::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .volume-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  /* 音量スライダー用スタイル - モバイル版 */
  .volume-slider-mobile {
    width: 100%;
    background: linear-gradient(
      to right,
      #ffffff var(--volume-progress, 0%),
      #4b5563 var(--volume-progress, 0%)
    );
    border-radius: 4px;
    outline: none;
    border: none;
    vertical-align: middle;
  }

  .volume-slider-mobile::-webkit-slider-track {
    background: transparent;
    border-radius: 4px;
  }

  .volume-slider-mobile::-moz-range-track {
    background: transparent;
    border-radius: 4px;
  }

  .volume-slider-mobile::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .volume-slider-mobile::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  /* 旧スライダー用スタイル（他の用途で使用される場合のために保持） */
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .slider::-webkit-slider-track {
    background: #4b5563;
    border-radius: 4px;
  }

  .slider::-moz-range-track {
    background: #4b5563;
    border-radius: 4px;
  }

  /* ホバー時のスライダー効果 */
  .volume-slider:hover::-webkit-slider-thumb,
  .volume-slider-mobile:hover::-webkit-slider-thumb,
  .slider:hover::-webkit-slider-thumb {
    background: #2563eb;
  }

  .volume-slider:hover::-moz-range-thumb,
  .volume-slider-mobile:hover::-moz-range-thumb,
  .slider:hover::-moz-range-thumb {
    background: #2563eb;
  }

  /* モバイル用のスライダー調整 */
  @media (max-width: 768px) {
    .volume-slider::-webkit-slider-thumb,
    .slider::-webkit-slider-thumb {
      width: 16px;
      height: 16px;
    }

    .volume-slider::-moz-range-thumb,
    .slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
    }
  }

  /* 320px幅での最適化 */
  @media (max-width: 320px) {
    .text-sm {
      font-size: 0.825rem;
    }

    .text-xs {
      font-size: 0.7rem;
    }
  }
</style>
