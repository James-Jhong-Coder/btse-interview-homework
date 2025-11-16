<script setup lang="ts">
import { ref } from "vue";
import { subscribeOrderBook } from "@/services/websocket/OrderBookService";
import { subscribeTradeHistory } from "@/services/websocket/TradeHistoryApiService";
import { useTradeHistory } from "@/hook/useTradeHistory";
import { useTradeHistoryStore } from "@/stores/tradeHistory";
import { useOrderBook } from "@/hook/useOrderBook";
const { parseOrderBookData } = useOrderBook();
const tradeHistoryStore = useTradeHistoryStore();
const { getLastPriceDirection } = useTradeHistory();
const priceDirection = ref("");
const onSubscribeOrderBook = () => {
  const subscribeOrderBook$ = subscribeOrderBook({
    symbol: "BTCPFC",
    grouping: 0,
  });
  subscribeOrderBook$.subscribe((data) => {
    parseOrderBookData(data);
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
  <div class="order-book-box pb-2">
    <div class="title-box px-3 py-2">
      <span>Order Book</span>
    </div>
    <div class="divider mb-2"></div>
    <SellOrders />
    <LastPrice
      class="my-2.5"
      :direction="priceDirection"
      :price="tradeHistoryStore.lastTradeHistory?.price"
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
