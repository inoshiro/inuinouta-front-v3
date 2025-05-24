<script setup lang="ts">
const emit = defineEmits(["toggleSidebar"]);
</script>

<template>
  <header
    class="bg-gray-800 text-white p-4 relative flex items-center justify-between"
  >
    <div class="flex items-center gap-2">
      <button
        aria-label="メニューを開く"
        class="md:hidden"
        @click="emit('toggleSidebar')"
      >
        <span aria-hidden="true">&#9776;</span>
      </button>
      <img src="/favicon.ico" alt="ロゴ" class="w-8 h-8 rounded" />
      <span class="font-bold text-lg">いぬいのうた</span>
    </div>
    <div class="flex items-center gap-3">
      <button aria-label="設定" class="hover:bg-gray-700 p-2 rounded">
        <span aria-hidden="true">⚙️</span>
      </button>
      <img
        src="https://placehold.jp/32x32.png"
        alt="ユーザー"
        class="w-8 h-8 rounded-full border border-gray-600"
      />
    </div>
  </header>
</template>
