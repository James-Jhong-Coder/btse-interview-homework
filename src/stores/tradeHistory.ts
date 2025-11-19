import type { TradeHistoryItem } from "@/services/websocket/types/tradeHistory.types";
import { defineStore } from "pinia";
import type { Subscription } from "rxjs";
import { subscribeTradeHistory } from "@/services/websocket/TradeHistoryApiService";
import { PRICE_DIRECTION } from "@/common/const";

interface TradeHistoryState {
  lastTradeHistory: TradeHistoryItem | null;
  tradeHistorySubscription: Subscription | null;
  priceDirection: string | null;
  consumerCount: number;
}

export const useTradeHistoryStore = defineStore("tradeHistory", {
  state: (): TradeHistoryState => ({
    lastTradeHistory: null,
    tradeHistorySubscription: null,
    consumerCount: 0,
    priceDirection: null,
  }),
  actions: {
    updateState(payload: Partial<TradeHistoryState>) {
      this.$patch(payload);
    },
    onSubscribeTradeHistory() {
      this.consumerCount += 1;
      if (this.tradeHistorySubscription) {
        return;
      }
      const tradeHistoryObservable = subscribeTradeHistory({
        symbol: "BTCPFC",
      });
      this.tradeHistorySubscription = tradeHistoryObservable.subscribe(
        (data) => {
          this.priceDirection = this.getLastPriceDirection(data);
          this.lastTradeHistory = data;
        }
      );
    },
    getLastPriceDirection(newestTradeHistory: TradeHistoryItem) {
      const lastTradeHistory = this.lastTradeHistory;
      if (
        !lastTradeHistory ||
        newestTradeHistory.price === lastTradeHistory.price
      ) {
        return PRICE_DIRECTION.SAME;
      }
      // 新的價格 > 舊的價格
      if (newestTradeHistory.price > lastTradeHistory.price) {
        return PRICE_DIRECTION.INCREASE;
      }
      // 新的價格 < 舊的價格
      return PRICE_DIRECTION.DECREASE;
    },
    unsubscribeTradeHistory() {
      this.consumerCount = Math.max(0, this.consumerCount - 1);
      if (this.consumerCount > 0) return;
      if (this.tradeHistorySubscription) {
        this.tradeHistorySubscription.unsubscribe();
        this.tradeHistorySubscription = null;
        this.$reset();
        console.log("[TradeHistoryStore] unsubscribed");
      }
    },
  },
});
