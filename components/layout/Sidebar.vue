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
    <!-- モバイル用オーバーレイ -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/80 z-40 md:hidden"
      @click="handleOverlayClick"
    />

    <!-- サイドバー本体 -->
    <aside
      class="bg-gray-700 text-white overflow-y-auto"
      :class="[
        // デスクトップ: 常に表示、静的配置
        'md:static md:w-56 md:h-full md:translate-x-0',
        // モバイル: 固定位置、条件付き表示
        'md:hidden fixed top-0 left-0 h-full w-56 z-50 transform transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
      aria-label="サイドバー"
    >
      <div class="p-4">
        <!-- モバイル用閉じるボタン -->
        <button
          class="md:hidden mb-4 text-white hover:text-gray-300"
          @click="emit('closeSidebar')"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span class="ml-2">閉じる</span>
        </button>

        <!-- ナビゲーション -->
        <nav>
          <ul class="space-y-2">
            <li>
              <NuxtLink
                to="/"
                class="flex items-center gap-2 hover:bg-gray-600 rounded px-2 py-1 transition-colors"
              >
                <span aria-hidden="true">🏠</span> ホーム
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/songs"
                class="flex items-center gap-2 hover:bg-gray-600 rounded px-2 py-1 transition-colors"
              >
                <span aria-hidden="true">🎶</span> 楽曲一覧
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/streams"
                class="flex items-center gap-2 hover:bg-gray-600 rounded px-2 py-1 transition-colors"
              >
                <span aria-hidden="true">🎤</span> 歌枠一覧
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/playlists"
                class="flex items-center gap-2 hover:bg-gray-600 rounded px-2 py-1 transition-colors"
              >
                <span aria-hidden="true">🎵</span> プレイリスト
              </NuxtLink>
            </li>
            <li>
              <span
                class="flex items-center gap-2 text-gray-400 px-2 py-1 cursor-not-allowed"
              >
                <span aria-hidden="true">⭐</span> お気に入り (準備中)
              </span>
            </li>
            <li>
              <span
                class="flex items-center gap-2 text-gray-400 px-2 py-1 cursor-not-allowed"
              >
                <span aria-hidden="true">⚙️</span> 設定 (準備中)
              </span>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  </div>
</template>
