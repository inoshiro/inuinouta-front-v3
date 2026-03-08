<script setup lang="ts">
  import { ref } from "vue";

  const isMenuOpen = ref(false);
  const isSiteInfoModalOpen = ref(false);

  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
  };

  const closeMenu = () => {
    isMenuOpen.value = false;
  };

  const openSiteInfoModal = () => {
    isSiteInfoModalOpen.value = true;
  };

  const closeSiteInfoModal = () => {
    isSiteInfoModalOpen.value = false;
  };

  // ナビゲーションアイテム
  const navItems = [
    { to: "/", label: "ホーム", icon: "🏠" },
    { to: "/songs", label: "楽曲一覧", icon: "🎶" },
    { to: "/streams", label: "歌枠一覧", icon: "📺" },
    { to: "/playlists", label: "プレイリスト", icon: "📝" },
    { to: "/timeline", label: "タイムライン", icon: "📅" },
  ];
</script>

<template>
  <header class="bg-gray-800 text-white relative z-60 shrink-0">
    <div class="px-4 py-3">
      <div class="flex items-center justify-between">
        <!-- 左側: ロゴ -->
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/"
            class="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/icon-192x192.png" alt="ロゴ" class="w-8 h-8 rounded" />
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

          <!-- サイト情報ボタン -->
          <button
            class="hidden sm:block p-2 rounded-md hover:bg-gray-700 transition-colors"
            aria-label="サイト情報"
            @click="openSiteInfoModal"
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <!-- ユーザーアバター -->
          <!--
          <img
            src="https://placehold.jp/32x32.png"
            alt="ユーザー"
            class="w-8 h-8 rounded-full border border-gray-600 cursor-pointer hover:border-gray-400 transition-colors"
          />
          -->
        </div>
      </div>
    </div>

    <!-- モバイルメニューオーバーレイ（モバイルメニューが開いているとき） -->
    <Transition
      enter-active-class="transition-opacity ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMenuOpen"
        class="md:hidden fixed inset-0 bg-gradient-to-b from-black/40 to-black/20 z-50"
        @click="closeMenu"
      />
    </Transition>

    <!-- モバイルメニュー（プルダウン） -->
    <Transition
      enter-active-class="transition-all ease-out duration-300"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isMenuOpen"
        class="md:hidden absolute top-full left-0 right-0 bg-gray-800 border-t border-gray-700 z-60 shadow-lg"
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
            <!-- モバイル専用サイト情報項目 -->
            <li class="pt-2 border-t border-gray-700 mt-2">
              <button
                class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-700 w-full text-left"
                @click="openSiteInfoModal"
              >
                <span class="text-base">ℹ️</span>
                サイト情報
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </Transition>

    <!-- サイト情報モーダル -->
    <SiteInfoModal :is-open="isSiteInfoModalOpen" @close="closeSiteInfoModal" />
  </header>
</template>
