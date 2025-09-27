<template>
  <div class="relative" ref="selectRef">
    <!-- 入力フィールド -->
    <input
      v-model="searchQuery"
      :placeholder="placeholder"
      :class="inputClass"
      type="text"
      autocomplete="off"
      @focus="openDropdown"
      @input="handleInput"
      @keydown="handleKeydown"
    />

    <!-- クリア用のボタン -->
    <button
      v-if="modelValue || searchQuery"
      type="button"
      class="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      @click="clearSelection"
    >
      <svg
        class="w-4 h-4"
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
    </button>

    <!-- ドロップダウンアイコン -->
    <button
      type="button"
      class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      @click="toggleDropdown"
    >
      <svg
        class="w-4 h-4 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- ドロップダウンリスト -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
      >
        <!-- 全件オプション -->
        <button
          v-if="showAllOption"
          type="button"
          class="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
          :class="{
            'bg-blue-100 text-blue-900': !modelValue,
            'text-gray-700': modelValue,
          }"
          @click="selectOption('')"
        >
          {{ allOptionText }}
        </button>

        <!-- フィルタされたオプション -->
        <button
          v-for="(option, index) in filteredOptions"
          :key="option"
          type="button"
          class="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
          :class="{
            'bg-blue-100 text-blue-900': modelValue === option,
            'text-gray-700': modelValue !== option,
            'bg-gray-100': focusedIndex === index + (showAllOption ? 1 : 0),
          }"
          @click="selectOption(option)"
        >
          {{ option }}
        </button>

        <!-- オプションが見つからない場合 -->
        <div
          v-if="filteredOptions.length === 0 && searchQuery"
          class="px-4 py-2 text-gray-500 text-sm"
        >
          該当するオプションが見つかりません
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
  // Props
  const props = defineProps({
    modelValue: {
      type: String,
      default: "",
    },
    options: {
      type: Array,
      required: true,
    },
    placeholder: {
      type: String,
      default: "選択してください...",
    },
    allOptionText: {
      type: String,
      default: "全て",
    },
    showAllOption: {
      type: Boolean,
      default: true,
    },
    inputClass: {
      type: String,
      default:
        "w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    },
  });

  // Emits
  const emit = defineEmits(["update:modelValue"]);

  // リアクティブデータ
  const isOpen = ref(false);
  const searchQuery = ref("");
  const focusedIndex = ref(-1);
  const selectRef = ref(null);

  // 計算プロパティ
  const filteredOptions = computed(() => {
    if (!searchQuery.value.trim()) {
      return props.options;
    }

    const query = searchQuery.value.toLowerCase();
    return props.options.filter((option) =>
      option.toLowerCase().includes(query)
    );
  });

  // 表示テキストの管理
  const displayText = computed(() => {
    return props.modelValue || searchQuery.value;
  });

  // メソッド
  const openDropdown = () => {
    isOpen.value = true;
    focusedIndex.value = -1;
  };

  const closeDropdown = () => {
    isOpen.value = false;
    focusedIndex.value = -1;
    // 選択された値または空文字を表示
    if (props.modelValue) {
      searchQuery.value = props.modelValue;
    } else {
      searchQuery.value = "";
    }
  };

  const toggleDropdown = () => {
    if (isOpen.value) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const selectOption = (option) => {
    emit("update:modelValue", option);
    searchQuery.value = option;
    closeDropdown();
  };

  const clearSelection = () => {
    emit("update:modelValue", "");
    searchQuery.value = "";
    openDropdown();
  };

  const handleInput = () => {
    if (!isOpen.value) {
      openDropdown();
    }
    focusedIndex.value = -1;
  };

  const handleKeydown = (event) => {
    if (
      !isOpen.value &&
      ["ArrowDown", "ArrowUp", "Enter"].includes(event.key)
    ) {
      openDropdown();
      return;
    }

    if (!isOpen.value) return;

    const totalOptions =
      filteredOptions.value.length + (props.showAllOption ? 1 : 0);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusedIndex.value = Math.min(focusedIndex.value + 1, totalOptions - 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusedIndex.value = Math.max(focusedIndex.value - 1, -1);
        break;
      case "Enter":
        event.preventDefault();
        if (focusedIndex.value === -1) {
          return;
        }
        if (props.showAllOption && focusedIndex.value === 0) {
          selectOption("");
        } else {
          const optionIndex = props.showAllOption
            ? focusedIndex.value - 1
            : focusedIndex.value;
          if (optionIndex >= 0 && optionIndex < filteredOptions.value.length) {
            selectOption(filteredOptions.value[optionIndex]);
          }
        }
        break;
      case "Escape":
        event.preventDefault();
        closeDropdown();
        break;
    }
  };

  // 外部クリック検出
  const handleClickOutside = (event) => {
    if (selectRef.value && !selectRef.value.contains(event.target)) {
      closeDropdown();
    }
  };

  // ライフサイクル
  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
    // 初期値の設定
    if (props.modelValue) {
      searchQuery.value = props.modelValue;
    }
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });

  // modelValueの変更を監視
  watch(
    () => props.modelValue,
    (newValue) => {
      if (!isOpen.value) {
        searchQuery.value = newValue || "";
      }
    }
  );
</script>

<style scoped>
  .dropdown-enter-active,
  .dropdown-leave-active {
    transition: all 0.15s ease-out;
  }

  .dropdown-enter-from {
    opacity: 0;
    transform: translateY(-4px);
  }

  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
</style>
