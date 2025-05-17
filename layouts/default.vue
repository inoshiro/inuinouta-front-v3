<script setup lang="ts">
  import { ref } from "vue";

  const isSidebarOpen = ref(false);
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };

  const closeSidebar = () => {
    isSidebarOpen.value = false;
  };
</script>

<template>
  <div class="flex flex-col min-h-screen overflow-x-hidden">
    <LayoutHeader @toggle-sidebar="toggleSidebar" />
    <div class="flex">
      <LayoutSidebar :is-open="isSidebarOpen" @close-sidebar="closeSidebar" />
      <main class="flex-1 w-full p-4 bg-white overflow-y-auto pb-20">
        <slot />
      </main>
    </div>
    <LayoutFooter />
  </div>
</template>
