<script setup lang="ts">
  // シンプルで軽量なメインコンポーネント
  // 子コンポーネントに責務を委譲して保守性を向上
</script>

<template>
  <!-- YouTube Music風プレイヤーコントロール -->
  <div class="player-controls bg-gray-900 text-white border-t border-gray-700">
    <!-- プログレスバー（コントロールエリアに統合） -->
    <div class="relative">
      <!-- プログレスバー -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gray-700 z-10">
        <PlayerProgressBar />
      </div>

      <!-- デスクトップ版コントロール -->
      <div class="hidden lg:block px-4 pt-2 pb-3">
        <div class="flex items-center gap-4 h-14">
          <!-- 左側: 楽曲情報エリア -->
          <div class="flex-shrink-0 w-80">
            <PlayerTrackInfo />
          </div>

          <!-- 中央: 再生コントロール -->
          <div class="flex-1 flex items-center justify-center gap-4">
            <PlayerControlButtons />
            <PlayerTimeDisplay />
          </div>

          <!-- 右側: 追加コントロール -->
          <div class="flex-shrink-0 w-80 flex justify-end">
            <PlayerExtraControls />
          </div>
        </div>
      </div>

      <!-- モバイル版コントロール -->
      <div class="block lg:hidden px-3 pt-2 pb-3">
        <div class="flex items-center gap-2 h-12">
          <!-- 楽曲情報（広いエリア） -->
          <div class="flex-1 min-w-0 pr-2">
            <PlayerTrackInfo :is-mobile="true" />
          </div>

          <!-- 再生コントロール（コンパクト） -->
          <div class="flex-shrink-0">
            <PlayerControlButtons :is-mobile="true" />
          </div>

          <!-- 時間表示（コンパクト） -->
          <div class="flex-shrink-0 text-xs">
            <PlayerTimeDisplay />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* プレイヤーコントロールの基本スタイル */
  .player-controls {
    transform: translateZ(0);
    will-change: transform;
  }

  /* レスポンシブ調整 */
  @media (max-width: 768px) {
    .gap-4 {
      gap: 0.75rem;
    }

    .px-4 {
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }

  /* アニメーション性能向上 */
  * {
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  /* 重いトランジションの削減 */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
