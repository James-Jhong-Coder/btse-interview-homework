// stores/orderBook.ts
import { defineStore } from "pinia";
import type {
  OrderBookData,
  OrderBookQuote,
  OrderSide,
  RowHighlight,
  SizeHightLight,
} from "@/services/websocket/types/orderBook.types";
import type { Subscription } from "rxjs";
import { subscribeOrderBook } from "@/services/websocket/OrderBookService";
import { VISIBLE_MAX_QUOTE } from "@/common/const";
import { useBigNumber } from "@/hook/useBigNumber";
const { sumArray } = useBigNumber();

export interface OrderBookState {
  sortedBidQuotes: OrderBookQuote[];
  sortedAskQuotes: OrderBookQuote[];

  lastSeqNum: number | null;

  orderBookSubscription: Subscription | null;
  consumerCount: number;

  bidsMap: Map<number, number>;
  asksMap: Map<number, number>;
  prevBidsMap: Map<number, number>;
  prevAsksMap: Map<number, number>;
  initialized: boolean;
}

export const useOrderBookStore = defineStore("orderBook", {
  state: (): OrderBookState => ({
    sortedBidQuotes: [],
    sortedAskQuotes: [],
    lastSeqNum: null,
    orderBookSubscription: null,
    consumerCount: 0,
    bidsMap: new Map<number, number>(),
    asksMap: new Map<number, number>(),
    prevBidsMap: new Map<number, number>(),
    prevAsksMap: new Map<number, number>(),
    initialized: false,
  }),

  actions: {
    updateState(payload: Partial<OrderBookState>) {
      this.$patch(payload);
    },
    formatSortedQuotes(side: OrderSide): OrderBookQuote[] {
      const isBuy = side === "buy";
      const prevMap = isBuy ? this.prevBidsMap : this.prevAsksMap;
      let entries = isBuy
        ? Array.from(this.bidsMap.entries()).sort((a, b) => b[0] - a[0])
        : Array.from(this.asksMap.entries()).sort((a, b) => a[0] - b[0]);
      const visibleQuotes = entries.slice(0, VISIBLE_MAX_QUOTE);
      const accumulativeTotalSize =
        visibleQuotes.reduce((acc, [, size]) => {
          return sumArray([acc, size]);
        }, 0) || 1;
      const result: OrderBookQuote[] = [];
      let currentAccumulativeSize = 0;
      visibleQuotes.forEach(([price, size]) => {
        let rowHighlight: RowHighlight = "none";
        let sizeHighlight: SizeHightLight = "none";
        currentAccumulativeSize = sumArray([currentAccumulativeSize, size]);
        const prevSize = prevMap.get(price);
        if (prevSize === undefined) {
          rowHighlight = "new";
        } else if (size > prevSize) {
          sizeHighlight = "increase";
        } else if (size < prevSize) {
          sizeHighlight = "decrease";
        }

        result.push({
          side,
          price,
          size,
          totalSize: currentAccumulativeSize,
          totalPercent: currentAccumulativeSize / accumulativeTotalSize,
          rowHighlight,
          sizeHighlight,
        });
      });

      // 5. Buy：高→低 顯示；Sell：計算是低→高，但顯示要反轉成高→低
      return isBuy ? result : result.reverse();
    },
    checkCrossedOrderBook() {
      const bestBid = this.sortedBidQuotes[0]?.price;
      const bestAsk =
        this.sortedAskQuotes[this.sortedAskQuotes.length - 1]?.price;
      if (bestBid == null || bestAsk == null) return;
      // 最佳買點 > 最佳賣點
      if (bestBid >= bestAsk) {
        console.error("crossed order book!!");
        this.forceReconnectOrderBook();
      }
    },
    forceReconnectOrderBook() {
      const currentConsumers = this.consumerCount;
      this.orderBookSubscription?.unsubscribe();
      this.orderBookSubscription = null;
      this.$reset();
      this.consumerCount = currentConsumers;
      this.onSubscribeOrderBook({ isReconnect: true });
    },
    handleSnapShot(snapshot: OrderBookData) {
      this.bidsMap.clear();
      this.asksMap.clear();
      this.prevBidsMap.clear();
      this.prevAsksMap.clear();

      snapshot.bids.forEach(([price, size]) => {
        const _price = Number(price);
        const _size = Number(size);
        this.bidsMap.set(_price, _size);
        this.prevBidsMap.set(_price, _size);
      });

      snapshot.asks.forEach(([price, size]) => {
        const _price = Number(price);
        const _size = Number(size);
        this.asksMap.set(_price, _size);
        this.prevAsksMap.set(_price, _size);
      });
      this.lastSeqNum = snapshot.seqNum;
      this.initialized = true;
      this.sortedBidQuotes = this.formatSortedQuotes("buy");
      this.sortedAskQuotes = this.formatSortedQuotes("sell");
    },
    handleDelta(delta: OrderBookData) {
      if (!this.initialized) return;
      if (delta.prevSeqNum !== this.lastSeqNum) {
        this.forceReconnectOrderBook();
        return;
      }
      delta.bids.forEach(([price, size]) => {
        const _price = Number(price);
        const _size = Number(size);
        if (_size === 0) {
          this.bidsMap.delete(_price);
        } else {
          this.bidsMap.set(_price, _size);
        }
      });
      delta.asks.forEach(([price, size]) => {
        const _price = Number(price);
        const _size = Number(size);
        if (_size === 0) {
          this.asksMap.delete(_price);
        } else {
          this.asksMap.set(_price, _size);
        }
      });
      this.lastSeqNum = delta.seqNum;
      this.sortedBidQuotes = this.formatSortedQuotes("buy");
      this.sortedAskQuotes = this.formatSortedQuotes("sell");
      this.syncPrevMaps();
    },
    syncPrevMaps() {
      this.prevBidsMap.clear();
      this.prevAsksMap.clear();

      this.bidsMap.forEach((size, price) => {
        this.prevBidsMap.set(price, size);
      });

      this.asksMap.forEach((size, price) => {
        this.prevAsksMap.set(price, size);
      });
    },
    parseOrderBookData(orderBookData: OrderBookData) {
      if (!orderBookData) {
        return;
      }
      if (orderBookData.type === "snapshot") {
        this.handleSnapShot(orderBookData);
      } else if (orderBookData.type === "delta") {
        this.handleDelta(orderBookData);
      }
      this.checkCrossedOrderBook();
    },
    onSubscribeOrderBook({ isReconnect }: { isReconnect: boolean }) {
      if (!isReconnect) {
        this.consumerCount++;
      }
      if (this.orderBookSubscription) {
        return;
      }
      const observable$ = subscribeOrderBook({
        symbol: "BTCPFC",
        grouping: 0,
      });
      this.orderBookSubscription = observable$.subscribe((data) => {
        this.parseOrderBookData(data);
      });
    },
    unSubscribeOrderBook() {
      this.consumerCount = Math.max(0, this.consumerCount - 1);
      if (this.consumerCount > 0) return;
      if (this.orderBookSubscription) {
        this.orderBookSubscription.unsubscribe();
        this.orderBookSubscription = null;
        this.$reset();
      }
    },
  },
});
