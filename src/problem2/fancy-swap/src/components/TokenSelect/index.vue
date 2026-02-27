<template>
  <div class="select-wrapper" ref="wrapper">
    <!-- Floating Label -->
    <label v-if="label" :for="selectId" class="floating-label">
      {{ label }}
      <span v-if="isRequired" class="required">*</span>
    </label>

    <!-- Select Display -->
    <div
      :id="selectId"
      class="select-display"
      :class="{ disabled }"
      @click="toggleOpen"
    >
      <div class="selected-content">
        <img
          v-if="modelValue"
          :src="getTokenIcon(modelValue)"
          class="token-icon"
        />
        <span>{{ selectedLabel || placeholder }}</span>
      </div>

      <!-- Loader -->
      <div v-if="isLoading || isLoadingMore" class="loading-overlay">
        <div class="dot-loader">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>

    <!-- Dropdown -->
    <transition name="fade-slide">
      <div
        v-if="isOpen"
        ref="dropdownList"
        class="dropdown"
        @scroll.passive="handleScroll"
      >
        <!-- Search -->
        <div v-if="isSearchable" class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            @input="handleSearchInput"
            placeholder="Search token..."
          />
          <button v-if="searchQuery" @click.stop="clearSearch">×</button>
        </div>

        <!-- Options -->
        <div
          v-for="opt in filteredOptions"
          :key="opt.value"
          class="option"
          :class="{ selected: opt.value === modelValue }"
          @click="selectOption(opt)"
        >
          <img :src="getTokenIcon(opt.value)" class="token-icon" />

          <div class="token-info">
            <div class="token-name">{{ opt.label }}</div>
            <div class="token-price">
              {{
                prices[opt.value]
                  ? "$" + prices[opt.value].toFixed(2)
                  : "-"
              }}
            </div>
          </div>
        </div>

        <div v-if="!filteredOptions.length" class="empty">
          No tokens found
        </div>

        <div v-if="isLoadingMore" class="loading-more">
          Loading more...
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import type { TokenOption } from "../../type/tokenSelect.type";


const props = defineProps<{
  modelValue: string;
  initialOptions: TokenOption[];
  prices: Record<string, number>;
  label?: string;
  placeholder?: string;
  isRequired?: boolean;
  isSearchable?: boolean;
  disabled?: boolean;
  hasMore?: boolean;
  parentLoadOptions?: () => Promise<void>;
  isLoading?: boolean;
}>();

const emit = defineEmits(["update:modelValue", "parentSearchOptions"]);

const wrapper = ref<HTMLElement | null>(null);
const dropdownList = ref<HTMLElement | null>(null);

const isOpen = ref(false);
const searchQuery = ref("");
const isLoadingMore = ref(false);

const selectId = `token-select-${Math.random().toString(36).slice(2, 9)}`;

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.initialOptions;
  return props.initialOptions.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const selectedLabel = computed(() => {
  const found = props.initialOptions.find(o => o.value === props.modelValue);
  return found?.label || "";
});

function getTokenIcon(symbol: string) {
  return new URL(`/src/assets/tokens/${symbol}.svg`, import.meta.url).href;
}

function toggleOpen() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
}

function selectOption(opt: TokenOption) {
  emit("update:modelValue", opt.value);
  isOpen.value = false;
}

function clearSearch() {
  searchQuery.value = "";
}

function handleSearchInput() {
  if (!props.isSearchable) return;
  emit("parentSearchOptions", searchQuery.value);
}

async function handleScroll() {
  const el = dropdownList.value;
  if (!el || !props.hasMore || isLoadingMore.value) return;

  const threshold = 40;
  const bottom = el.scrollHeight - (el.scrollTop + el.clientHeight);

  if (bottom < threshold && props.parentLoadOptions) {
    isLoadingMore.value = true;
    await props.parentLoadOptions();
    isLoadingMore.value = false;
  }
}

function handleClickOutside(e: MouseEvent) {
  if (!wrapper.value) return;
  if (!wrapper.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped src="./index.css"></style>