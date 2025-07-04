<script setup lang="ts">
  // シンプルで軽量なメインコンポーネント
  // 子コンポーネントに責務を委譲して保守性を向上
</script>

<template>
  <!-- YouTube Music風プレイヤーコントロール -->
  <div
    class="player-controls bg-gray-900 text-white border-t border-gray-700 relative"
  >
    <!-- プログレスバー（最上部ライン） -->
    <PlayerProgressBar />

    <!-- デスクトップ版 -->
    <div class="hidden lg:block">
      <div class="px-4 py-3 pt-4">
        <div class="flex items-center gap-4">
          <!-- 左側: 楽曲情報エリア (固定幅) -->
          <PlayerTrackInfo />

          <!-- 中央: 再生コントロール -->
          <div
            class="flex-1 flex items-center justify-center gap-4 max-w-2xl mx-auto"
          >
            <!-- コントロールボタン -->
            <PlayerControlButtons />

            <!-- 時間表示 -->
            <PlayerTimeDisplay />
          </div>

          <!-- 右側: 追加コントロール (固定幅) -->
          <PlayerExtraControls />
        </div>
      </div>
    </div>

    <!-- モバイル版 -->
    <div class="block lg:hidden">
      <!-- メインコントロール -->
      <div class="px-4 py-3 pt-4">
        <div class="flex items-center gap-3">
          <!-- 楽曲情報 -->
          <PlayerTrackInfo :is-mobile="true" />

          <!-- 再生コントロール -->
          <PlayerControlButtons :is-mobile="true" />

          <!-- 時間表示 -->
          <PlayerTimeDisplay />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* プレイヤーコントロールの高さ定義 */
  .player-controls {
    /* CSS変数を使用してグローバルな高さ設定と統一 */
    min-height: var(--player-height-mobile);
    transform: translateZ(0);
    will-change: transform;
  }

  /* デスクトップ版での高さ調整 */
  @media (min-width: 1024px) {
    .player-controls {
      min-height: var(--player-height-desktop);
    }

    .w-80 {
      width: auto;
      min-width: 0;
    }
  }

  @media (max-width: 768px) {
    .max-w-2xl {
      max-width: none;
    }

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
