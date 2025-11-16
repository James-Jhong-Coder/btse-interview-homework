<script setup lang="ts">
import { useOrderBookStore } from "@/stores/orderBook";
const orderBookStore = useOrderBookStore();
</script>

<template>
  <div class="flex flex-col">
    <div class="sell-head px-3 pb-2">
      <span>Price(USD)</span>
      <span class="text-right">Size</span>
      <span class="text-right">Total</span>
    </div>
    <!-- ask 是賣出 -->
    <div
      class="sell-row px-3"
      :class="{
        'mt-1': index > 0,
      }"
      v-for="(item, index) in orderBookStore.sortedAskQuotes"
      :key="`${index}`"
    >
      <span class="text-red-400">{{ item.price }}</span>
      <span class="text-right">{{ item.size }}</span>
      <span class="text-right">{{ item.totalSize }}</span>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/tailwind.css";
.sell-head {
  @apply grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: min-content;
  @apply text-gray-300 text-xs;
}
.sell-row {
  @apply grid leading-none;
  @apply text-gray-500 text-xs;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: min-content;
}
</style>
