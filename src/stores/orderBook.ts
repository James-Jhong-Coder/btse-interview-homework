import type { TradeHistoryItem } from "@/services/websocket/types/tradeHistory.types";
import { defineStore } from "pinia";

interface OrderBookState {
  lastTradeHistory: TradeHistoryItem | {};
}

export const useOrderBookStore = defineStore("orderBook", {
  state: (): OrderBookState => ({
    lastTradeHistory: {},
  }),
  actions: {
    updateState(payload: Partial<OrderBookState>) {
      this.$patch(payload);
    },
  },
});
