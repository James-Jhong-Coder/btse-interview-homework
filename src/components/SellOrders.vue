<script setup lang="ts">
import { useOrderBookStore } from "@/stores/orderBook";
import { useBigNumber } from "@/hook/useBigNumber";
const { formatWithComma } = useBigNumber();
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
      v-for="(item, index) in orderBookStore.sortedAskQuotes"
      :key="`${index}`"
    >
      <span class="sell-row-cell justify-self-start text-red-400">{{
        formatWithComma(item.price)
      }}</span>
      <span class="sell-row-cell">{{ formatWithComma(item.size) }}</span>
      <div class="sell-row-cell">
        <span
          class="percent-bar"
          :style="{
            width: item.totalPercent * 100 + '%',
          }"
        ></span>
        <span>{{ formatWithComma(item.totalSize) }}</span>
      </div>
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
  @apply hover:bg-navy-700;
}
.sell-row-cell {
  @apply py-1;
  @apply relative;
  @apply flex items-center justify-end;
}
.percent-bar {
  @apply absolute top-0.5 bottom-0.5 right-0;
  @apply bg-red-100;
}
</style>
