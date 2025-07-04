<script setup lang="ts">
  import { ref } from "vue";

  const isMenuOpen = ref(false);

  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
  };

  const closeMenu = () => {
    isMenuOpen.value = false;
  };

  // ナビゲーションアイテム
  const navItems = [
    { to: "/", label: "ホーム", icon: "🏠" },
    { to: "/songs", label: "楽曲一覧", icon: "🎶" },
    { to: "/streams", label: "歌枠一覧", icon: "🎤" },
    { to: "/playlists", label: "プレイリスト", icon: "🎵" },
  ];
</script>

<template>
  <header class="bg-gray-800 text-white relative z-50 shrink-0">
    <div class="px-4 py-3">
      <div class="flex items-center justify-between">
        <!-- 左側: ロゴ -->
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/"
            class="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/favicon.ico" alt="ロゴ" class="w-8 h-8 rounded" />
            <span class="font-bold text-lg">いぬいのうた</span>
          </NuxtLink>
        </div>

        <!-- 中央: デスクトップナビゲーション -->
        <nav class="hidden md:block">
          <ul class="flex items-center space-x-6">
            <li v-for="item in navItems" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-700 hover:text-white"
                :class="{ 'bg-gray-700 text-white': $route.path === item.to }"
              >
                <span class="text-base">{{ item.icon }}</span>
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- 右側: ユーザーアクション -->
        <div class="flex items-center gap-3">
          <!-- モバイルメニューボタン -->
          <button
            aria-label="メニューを開く"
            class="md:hidden p-2 rounded-md hover:bg-gray-700 transition-colors"
            @click="toggleMenu"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                v-if="!isMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- 設定ボタン -->
          <button
            class="hidden sm:block p-2 rounded-md hover:bg-gray-700 transition-colors"
            aria-label="設定"
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          <!-- ユーザーアバター -->
          <img
            src="https://placehold.jp/32x32.png"
            alt="ユーザー"
            class="w-8 h-8 rounded-full border border-gray-600 cursor-pointer hover:border-gray-400 transition-colors"
          />
        </div>
      </div>
    </div>

    <!-- オーバーレイ（モバイルメニューが開いているとき） -->
    <div
      v-if="isMenuOpen"
      class="md:hidden fixed inset-0 bg-opacity-30 z-40"
      @click="closeMenu"
    />

    <!-- モバイルメニュー（プルダウン） -->
    <div
      v-if="isMenuOpen"
      class="md:hidden absolute top-full left-0 right-0 bg-gray-800 border-t border-gray-700 z-50 shadow-lg"
    >
      <nav class="px-4 py-3">
        <ul class="space-y-1">
          <li v-for="item in navItems" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-700"
              :class="{ 'bg-gray-700 text-white': $route.path === item.to }"
              @click="closeMenu"
            >
              <span class="text-base">{{ item.icon }}</span>
              {{ item.label }}
            </NuxtLink>
          </li>
          <!-- モバイル専用設定項目 -->
          <li class="pt-2 border-t border-gray-700 mt-2">
            <button
              class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-700 w-full text-left"
            >
              <span class="text-base">⚙️</span>
              設定 (準備中)
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
