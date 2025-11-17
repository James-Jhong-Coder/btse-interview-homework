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
      :key="`${index}-${item.price}`"
      :class="{
        'sell-row-flash': item.rowHighlight === 'new',
      }"
    >
      <span class="sell-row-cell justify-self-start text-red-400">{{
        formatWithComma(item.price)
      }}</span>
      <div class="sell-row-cell">
        <div
          class="size-highlight"
          :class="{
            'size-highlight--increase': item.sizeHighlight === 'increase',
            'size-highlight--decrease': item.sizeHighlight === 'decrease',
          }"
        ></div>
        <span>{{ formatWithComma(item.size) }}</span>
      </div>
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
  gap: 0 0.5rem;
}
.sell-row {
  @apply grid leading-none;
  @apply text-gray-500 text-xs;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: min-content;
  @apply hover:bg-navy-700;
  gap: 0 0.5rem;
}
.sell-row.sell-row-flash {
  animation: row-flash-animation 0.2s ease-out;
}
.sell-row-cell {
  @apply py-1;
  @apply relative;
  @apply flex items-center justify-end;
}
.percent-bar {
  @apply absolute top-0.5 bottom-0.5 right-0;
  @apply bg-red-100;
  z-index: 0;
}
@keyframes row-flash-animation {
  0% {
    background-color: rgba(255, 91, 90, 0.5);
  }
  100% {
    background-color: transparent;
  }
}
.size-highlight {
  @apply absolute inset-0;
}
.size-highlight.size-highlight--increase {
  animation: size-highlight-increase-animation 2s ease-out;
}
.size-highlight.size-highlight--decrease {
  animation: size-highlight-decrease-animation 2s ease-out;
}
@keyframes size-highlight-increase-animation {
  0% {
    background-color: rgba(0, 177, 93, 0.5);
  }
  100% {
    background-color: transparent;
  }
}
@keyframes size-highlight-decrease-animation {
  0% {
    background-color: rgba(255, 90, 90, 0.12);
  }
  100% {
    background-color: transparent;
  }
}
</style>
