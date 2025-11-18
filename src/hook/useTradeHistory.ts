import { useTradeHistoryStore } from "@/stores/tradeHistory";
import { onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";

export const useTradeHistory = () => {
  const tradeHistoryStore = useTradeHistoryStore();
  const { lastTradeHistory, priceDirection } = storeToRefs(tradeHistoryStore);
  onMounted(() => {
    tradeHistoryStore.onSubscribeTradeHistory();
  });

  onUnmounted(() => {
    tradeHistoryStore.unsubscribeTradeHistory();
  });

  return {
    priceDirection,
    lastTradeHistory,
  };
};
