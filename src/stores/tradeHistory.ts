import type { TradeHistoryItem } from "@/services/websocket/types/tradeHistory.types";
import { defineStore } from "pinia";

interface TradeHistoryState {
  lastTradeHistory: TradeHistoryItem | null;
}

export const useTradeHistoryStore = defineStore("tradeHistory", {
  state: (): TradeHistoryState => ({
    lastTradeHistory: null,
  }),
  actions: {
    updateState(payload: Partial<TradeHistoryState>) {
      this.$patch(payload);
    },
  },
});
