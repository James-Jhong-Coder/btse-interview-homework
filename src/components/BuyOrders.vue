<script setup lang="ts">
import { useOrderBookStore } from "@/stores/orderBook";
const orderBookStore = useOrderBookStore();
</script>

<template>
  <div class="flex flex-col">
    <!-- bid 是賣出 -->
    <div
      class="buy-row px-3"
      :class="{
        'mt-1': index > 0,
      }"
      v-for="(item, index) in orderBookStore.sortedBidQuotes"
      :key="`${index}`"
    >
      <span class="text-green-400">{{ item.price }}</span>
      <span class="text-right">{{ item.size }}</span>
      <span class="text-right">{{ item.totalSize }}</span>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/tailwind.css";
.buy-row {
  @apply grid leading-none;
  @apply text-gray-500 text-xs;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: min-content;
}
</style>
