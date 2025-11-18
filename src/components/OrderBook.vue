<script setup lang="ts">
import { useTradeHistory } from "@/hook/useTradeHistory";
import { useOrderBook } from "@/hook/useOrderBook";
const { priceDirection, lastTradeHistory } = useTradeHistory(); // 訂閱 trade history
useOrderBook(); // 訂閱 order book
</script>

<template>
  <div class="order-book-box pb-2">
    <div class="title-box px-3 py-2">
      <span>Order Book</span>
    </div>
    <div class="divider mb-2"></div>
    <SellOrders />
    <LastPrice
      class="my-2.5"
      :direction="priceDirection"
      :price="lastTradeHistory?.price"
    />
    <BuyOrders />
  </div>
</template>

<style scoped>
@reference "@/assets/tailwind.css";

.order-book-box {
  @apply flex flex-col;
  @apply bg-navy-600;
}

.order-book-box .divider {
  @apply bg-navy-400 h-px shrink-0;
}

.title-box {
  @apply flex items-center leading-none;
  @apply text-gray-500 text-base font-medium;
}
</style>
