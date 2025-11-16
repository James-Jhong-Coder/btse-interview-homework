import { PRICE_DIRECTION } from "@/common/const";
import type { TradeHistoryItem } from "@/services/websocket/types/tradeHistory.types";
import { useTradeHistoryStore } from "@/stores/tradeHistory";
import { subscribeTradeHistory } from "@/services/websocket/TradeHistoryApiService";
import { onMounted, onUnmounted, ref } from "vue";
import type { Subscription } from "rxjs";
import { storeToRefs } from "pinia";

export const useTradeHistory = () => {
  const tradeHistoryStore = useTradeHistoryStore();
  const { lastTradeHistory } = storeToRefs(tradeHistoryStore);

  const priceDirection = ref<string>("");
  let subscription: Subscription | null = null;

  const getLastPriceDirection = (newestTradeHistory: TradeHistoryItem) => {
    const last = lastTradeHistory.value;

    // 沒有上一筆 or 價格相同
    if (!last || newestTradeHistory.price === last.price) {
      return PRICE_DIRECTION.SAME;
    }

    if (newestTradeHistory.price > last.price) {
      return PRICE_DIRECTION.INCREASE; // 確認 enum 有這個 key
    }

    return PRICE_DIRECTION.DECREASE;
  };

  const startSubscribe = () => {
    if (subscription) return; // 避免重複訂閱

    const tradeHistory$ = subscribeTradeHistory({
      symbol: "BTCPFC",
    });

    subscription = tradeHistory$.subscribe((data) => {
      priceDirection.value = getLastPriceDirection(data);
      tradeHistoryStore.updateState({
        lastTradeHistory: data,
      });
    });
  };

  onMounted(() => {
    startSubscribe();
  });

  onUnmounted(() => {
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }
  });

  return {
    priceDirection,
    lastTradeHistory,
  };
};
