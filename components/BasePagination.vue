<template>
  <div class="flex items-center justify-center space-x-2">
    <!-- 最初のページ -->
    <button
      :disabled="currentPage === 1"
      :class="[
        'px-3 py-2 text-sm border rounded-md transition-colors',
        currentPage === 1
          ? 'border-gray-300 text-gray-400 cursor-not-allowed'
          : 'border-gray-300 text-gray-700 hover:bg-gray-50',
      ]"
      @click="goToPage(1)"
    >
      «
    </button>

    <!-- 前のページ -->
    <button
      :disabled="currentPage === 1"
      :class="[
        'px-3 py-2 text-sm border rounded-md transition-colors',
        currentPage === 1
          ? 'border-gray-300 text-gray-400 cursor-not-allowed'
          : 'border-gray-300 text-gray-700 hover:bg-gray-50',
      ]"
      @click="goToPage(currentPage - 1)"
    >
      ‹
    </button>

    <!-- ページ番号 -->
    <template v-for="page in visiblePages" :key="page">
      <button
        v-if="page !== '...'"
        :class="[
          'px-3 py-2 text-sm border rounded-md transition-colors',
          page === currentPage
            ? 'border-blue-500 bg-blue-500 text-white'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50',
        ]"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
      <span v-else class="px-2 py-2 text-sm text-gray-500">...</span>
    </template>

    <!-- 次のページ -->
    <button
      :disabled="currentPage === totalPages"
      :class="[
        'px-3 py-2 text-sm border rounded-md transition-colors',
        currentPage === totalPages
          ? 'border-gray-300 text-gray-400 cursor-not-allowed'
          : 'border-gray-300 text-gray-700 hover:bg-gray-50',
      ]"
      @click="goToPage(currentPage + 1)"
    >
      ›
    </button>

    <!-- 最後のページ -->
    <button
      :disabled="currentPage === totalPages"
      :class="[
        'px-3 py-2 text-sm border rounded-md transition-colors',
        currentPage === totalPages
          ? 'border-gray-300 text-gray-400 cursor-not-allowed'
          : 'border-gray-300 text-gray-700 hover:bg-gray-50',
      ]"
      @click="goToPage(totalPages)"
    >
      »
    </button>
  </div>
</template>

<script setup>
// Props
defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  visiblePages: {
    type: Array,
    required: true,
  },
});

// Emits
const emit = defineEmits(['go-to-page']);

// Methods
const goToPage = (page) => {
  emit('go-to-page', page);
};
</script>

<style scoped>
/* ページネーションボタンのホバー効果 */
button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* アニメーション効果 */
button {
  transition: all 0.2s ease;
}
</style>
