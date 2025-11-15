<script setup lang="ts">
import { subscribeOrderBook } from "@/services/websocket/OrderBookService";
import { subscribeTradeHistory } from "@/services/websocket/TradeHistoryApiService";
import { computed, ref } from "vue";
import { useTradeHistory } from "@/hook/useTradeHistory";
import { useTradeHistoryStore } from "@/stores/tradeHistory";
import { PriceDirection } from "@/common/const";
import { useBigNumber } from "@/hook/useBigNumber";
const { formatWithComma } = useBigNumber();
const tradeHistoryStore = useTradeHistoryStore();
const { getLastPriceDirection } = useTradeHistory();
const priceDirection = ref("");
const computedPriceDirectionStyle = computed(() => {
  if (!priceDirection.value) {
    return [];
  }
  const styleMap = {
    [PriceDirection.UP]: ["text-green-400", "bg-green-100"],
    [PriceDirection.DOWN]: ["text-red-400", "bg-red-100"],
    [PriceDirection.SAME]: ["text-gray-400", "bg-gray-100"],
  };
  return styleMap[priceDirection.value] ?? [];
});
const computedLastPrice = computed(() => {
  if (tradeHistoryStore.lastTradeHistory?.price === undefined) {
    return "";
  }
  return formatWithComma(tradeHistoryStore.lastTradeHistory?.price);
});
const onSubscribeOrderBook = () => {
  const subscribeOrderBook$ = subscribeOrderBook({
    symbol: "BTCPFC",
    grouping: 0,
  });
  subscribeOrderBook$.subscribe((data) => {
    // console.log("subscribeOrderBook", data);
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
    <div class="last-price py-1" :class="[...computedPriceDirectionStyle]">
      <span>{{ computedLastPrice }}</span>
      <SvgIcon
        v-if="priceDirection !== PriceDirection.SAME"
        name="icon_arrow_down"
        class="ml-2"
        :class="{
          'icon-up': priceDirection === PriceDirection.UP,
        }"
      />
    </div>
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

.last-price {
  @apply font-medium text-base;
  @apply flex items-center justify-center;
}
.icon-up {
  transform: rotate(180deg);
}
</style>
