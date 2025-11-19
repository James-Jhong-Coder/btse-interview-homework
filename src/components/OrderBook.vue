<script setup lang="ts">
import { useTradeHistory } from "@/hook/useTradeHistory";
import { useOrderBook } from "@/hook/useOrderBook";
import { ref } from "vue";
const { priceDirection, lastTradeHistory } = useTradeHistory(); // 訂閱 trade history
useTradeHistory();
useTradeHistory();
useTradeHistory();
useTradeHistory();
useOrderBook(); // 訂閱 order book
useOrderBook(); // 訂閱 order book
useOrderBook(); // 訂閱 order book
useOrderBook(); // 訂閱 order book
const testFlag1 = ref(true);
const testFlag2 = ref(true);
const testFlag3 = ref(true);
const testFlag4 = ref(true);
const testFlag5 = ref(true);
const testFlag6 = ref(true);

setTimeout(() => {
  testFlag1.value = false;
}, 1000);
setTimeout(() => {
  testFlag2.value = false;
}, 2000);
setTimeout(() => {
  testFlag3.value = false;
}, 3000);
setTimeout(() => {
  testFlag4.value = false;
}, 4000);
setTimeout(() => {
  testFlag5.value = false;
}, 5000);
setTimeout(() => {
  testFlag6.value = false;
}, 6000);
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
    <TestConnect v-if="testFlag1" />
    <TestConnect v-if="testFlag2" />
    <TestConnect v-if="testFlag3" />
    <TestConnect v-if="testFlag4" />
    <TestConnect v-if="testFlag5" />
    <TestConnect v-if="testFlag6" />
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
