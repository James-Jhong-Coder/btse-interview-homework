// stores/orderBook.ts
import { defineStore } from "pinia";
import type {
  OrderBookData,
  OrderBookQuote,
} from "@/services/websocket/types/orderBook.types";

export interface OrderBookState {
  // 完整 socket data（最後一包，用於 debug）
  lastOrderBookData: OrderBookData | null;

  // 給 UI 用的格式化後 quotes（sorted + top8 + total + highlight）
  sortedBidQuotes: OrderBookQuote[];
  sortedAskQuotes: OrderBookQuote[];

  // snapshot / delta 用到的 meta
  lastSeqNum: number | null;
  isSequenceBroken: boolean;

  // 提供 UI 參考的額外資訊
  symbol: string | null;
  timestamp: number | null;
}

export const useOrderBookStore = defineStore("orderBook", {
  state: (): OrderBookState => ({
    lastOrderBookData: null,

    sortedBidQuotes: [],
    sortedAskQuotes: [],

    lastSeqNum: null,
    isSequenceBroken: false,

    symbol: null,
    timestamp: null,
  }),

  actions: {
    updateState(payload: Partial<OrderBookState>) {
      this.$patch(payload);
    },
  },
});
