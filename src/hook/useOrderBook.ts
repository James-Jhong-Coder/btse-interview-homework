import { onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { useOrderBookStore } from "@/stores/orderBook";

export const useOrderBook = () => {
  const orderBookStore = useOrderBookStore();
  const { sortedBidQuotes, sortedAskQuotes } = storeToRefs(orderBookStore);

  onMounted(() => {
    orderBookStore.onSubscribeOrderBook({ isReconnect: false });
  });

  onUnmounted(() => {
    orderBookStore.unSubscribeOrderBook();
  });

  return {
    sortedBidQuotes,
    sortedAskQuotes,
  };
};
