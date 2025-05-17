<script setup lang="ts">
  import { onMounted, onUnmounted } from "vue";
  defineProps({
    isOpen: Boolean,
  });
  const emit = defineEmits(["closeSidebar"]);
  // オーバーレイのクリックで閉じる
  const handleOverlayClick = () => emit("closeSidebar");
  // エスケープキーで閉じる
  const onKeydown = (e) => {
    if (e.key === "Escape") emit("closeSidebar");
  };
  onMounted(() => window.addEventListener("keydown", onKeydown));
  onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>
<template>
  <div>
    <!-- オーバーレイ -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
      @click="handleOverlayClick"
    />
    <aside
      class="bg-gray-700 text-white p-4 fixed md:static top-0 left-0 h-full w-56 transform transition-transform duration-300 z-50"
      :class="{
        '-translate-x-full md:translate-x-0': !isOpen,
        'translate-x-0': isOpen,
      }"
      :style="{ height: 'calc(100vh - 64px)' }"
      aria-label="サイドバー"
    >
      <button class="md:hidden mb-4" @click="emit('closeSidebar')">
        ✖ 閉じる
      </button>
      <nav>
        <ul class="space-y-2">
          <li>
            <NuxtLink
              to="/"
              class="flex items-center gap-2 hover:bg-gray-600 rounded px-2 py-1"
            >
              <span aria-hidden="true">🏠</span> ホーム
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/playlist"
              class="flex items-center gap-2 hover:bg-gray-600 rounded px-2 py-1"
            >
              <span aria-hidden="true">🎵</span> プレイリスト
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/favorites"
              class="flex items-center gap-2 hover:bg-gray-600 rounded px-2 py-1"
            >
              <span aria-hidden="true">⭐</span> お気に入り
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/settings"
              class="flex items-center gap-2 hover:bg-gray-600 rounded px-2 py-1"
            >
              <span aria-hidden="true">⚙️</span> 設定
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>
