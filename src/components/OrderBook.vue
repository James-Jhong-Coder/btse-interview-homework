<script setup>
import { subscribeOrderBook } from "@/services/websocket/OrderBookService";
import { subscribeTradeHistory } from "@/services/websocket/TradeHistoryApiService";

const onSubscribeOrderBook = () => {
  const subscribeOrderBook$ = subscribeOrderBook({
    symbol: "BTCPFC",
    grouping: 0,
  });
  subscribeOrderBook$.subscribe((data) => {
    // console.log("in component", data);
  });
};
const onSubscribeTradeHistory = () => {
  const subscribeTradeHistory$ = subscribeTradeHistory({
    symbol: "BTCPFC",
  });
  subscribeTradeHistory$.subscribe((data) => {
    console.log("subscribeTradeHistory", data);
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
