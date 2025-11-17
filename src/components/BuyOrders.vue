<script setup lang="ts">
import { useOrderBookStore } from "@/stores/orderBook";
import { useBigNumber } from "@/hook/useBigNumber";
const { formatWithComma } = useBigNumber();
const orderBookStore = useOrderBookStore();
</script>

<template>
  <div class="flex flex-col">
    <!-- bid 是賣出 -->
    <div
      class="buy-row px-3"
      v-for="(item, index) in orderBookStore.sortedBidQuotes"
      :key="`${index}-${item.price}`"
      :class="{
        'buy-row-flash': item.rowHighlight === 'new',
      }"
    >
      <span class="buy-row-cell justify-self-start text-green-400">{{
        formatWithComma(item.price)
      }}</span>
      <span class="buy-row-cell">{{ formatWithComma(item.size) }}</span>
      <div class="buy-row-cell">
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
.buy-row {
  @apply grid leading-none;
  @apply text-gray-500 text-xs;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: min-content;
  @apply hover:bg-navy-700;
}
.buy-row-cell {
  @apply py-1;
  @apply relative;
  @apply flex items-center justify-end;
}
.buy-row.buy-row-flash {
  animation: rowFlashAnimation 2s ease-out;
}
.percent-bar {
  @apply absolute top-0.5 bottom-0.5 right-0;
  @apply bg-green-100;
}

@keyframes rowFlashAnimation {
  0% {
    background-color: rgba(0, 177, 93, 0.5);
  }
  100% {
    background-color: transparent;
  }
}
</style>
