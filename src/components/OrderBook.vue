<script setup lang="ts">
import { subscribeOrderBook } from "@/services/websocket/OrderBookService";
import { subscribeTradeHistory } from "@/services/websocket/TradeHistoryApiService";
import { ref } from "vue";
import { useTradeHistory } from "@/hook/useTradeHistory";
import { useTradeHistoryStore } from "@/stores/tradeHistory";
const tradeHistoryStore = useTradeHistoryStore();
const { getLastPriceDirection } = useTradeHistory();
const priceDirection = ref("");
const onSubscribeOrderBook = () => {
  const subscribeOrderBook$ = subscribeOrderBook({
    symbol: "BTCPFC",
    grouping: 0,
  });
  subscribeOrderBook$.subscribe((data) => {
    console.log("subscribeOrderBook", data);
  });
};
const onSubscribeTradeHistory = () => {
  const subscribeTradeHistory$ = subscribeTradeHistory({
    symbol: "BTCPFC",
  });
  subscribeTradeHistory$.subscribe((data) => {
    priceDirection.value = getLastPriceDirection({
      newestTradeHistory: data,
    });
    tradeHistoryStore.updateState({
      lastTradeHistory: data,
    });
  });
};
onSubscribeOrderBook();
onSubscribeTradeHistory();
</script>

<template>
  <div class="order-book-box">
    <div class="title-box px-3 py-2">
      <span>Order Book</span>
    </div>
    <SellOrders />
    <LastPrice
      :direction="priceDirection"
      :price="tradeHistoryStore.lastTradeHistory?.price"
    />
    <BuyOrders class="mt-4" />
  </div>
</template>

<style scoped>
@reference "@/assets/tailwind.css";

.order-book-box {
  @apply flex flex-col;
  @apply bg-navy-600;
}

.title-box {
  @apply flex items-center;
  @apply text-gray-500 text-base;
}
</style>
