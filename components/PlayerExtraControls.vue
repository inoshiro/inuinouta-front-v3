<script setup lang="ts">
  // 現在はプロップスなしですが、将来的に設定の管理などを追加する可能性があります
</script>

<template>
  <!-- 追加コントロール -->
  <div class="flex items-center gap-2 w-80 justify-end">
    <!-- キューボタン -->
    <button
      class="p-2 hover:bg-gray-700 rounded transition-colors opacity-75 hover:opacity-100"
      title="キューを表示"
    >
      <svg
        class="w-5 h-5 text-gray-400 hover:text-white"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"
        />
      </svg>
    </button>

    <!-- デバイス選択 -->
    <button
      class="p-2 hover:bg-gray-700 rounded transition-colors opacity-75 hover:opacity-100"
      title="デバイスを選択"
    >
      <svg
        class="w-5 h-5 text-gray-400 hover:text-white"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M21 3H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM1 18v3h3c0-1.66-1.34-3-3-3z"
        />
      </svg>
    </button>

    <!-- 音量コントロール -->
    <PlayerVolumeControl />

    <!-- フルスクリーンボタン -->
    <button
      class="p-2 hover:bg-gray-700 rounded transition-colors opacity-75 hover:opacity-100"
      title="フルスクリーン"
    >
      <svg
        class="w-5 h-5 text-gray-400 hover:text-white"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
        />
      </svg>
    </button>
  </div>
</template>
