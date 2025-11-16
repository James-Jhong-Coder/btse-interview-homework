import { VISIBLE_MAX_QUOTE } from "@/common/const";
import type {
  OrderBookData,
  OrderBookQuote,
  OrderSide,
  RowHighlight,
  SizeHightLight,
} from "@/services/websocket/types/orderBook.types";
import { useOrderBookStore } from "@/stores/orderBook";

let bidsMap = new Map<number, number>();
let asksMap = new Map<number, number>();

let prevBidsMap = new Map<number, number>();
let prevAsksMap = new Map<number, number>();
let lastSeqNum: number | null = null;
let initialized = false;

export const useOrderBook = () => {
  return {
    parseOrderBookData,
  };
};

const syncPrevMaps = () => {
  prevBidsMap.clear();
  prevAsksMap.clear();
  bidsMap.forEach((price, size) => {
    prevBidsMap.set(price, size);
  });
  asksMap.forEach((price, size) => {
    prevAsksMap.set(price, size);
  });
};

const formatSortedQuotes = (side: OrderSide) => {
  let entries = null;
  let prevMap = side === "buy" ? prevBidsMap : prevAsksMap;
  if (side === "buy") {
    // 買入由高到低
    entries = Array.from(bidsMap.entries()).sort((a, b) => b[0] - a[0]);
  } else {
    // 賣出由低到高
    entries = Array.from(asksMap.entries()).sort((a, b) => a[0] - b[0]);
  }
  const result: OrderBookQuote[] = [];
  const visibleQuotes = entries.slice(0, VISIBLE_MAX_QUOTE);
  // 所有 size 加總
  const accumulativeTotalSize =
    entries.reduce((result, item) => {
      const size = item[1];
      result += size;
      return result;
    }, 0) || 1;
  // 目前 size 加總
  let currentAccumulativeSize = 0;
  visibleQuotes.forEach(([price, size]) => {
    let rowHighlight: RowHighlight = "none";
    let sizeHighlight: SizeHightLight = "none";
    currentAccumulativeSize += size;
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
  return result;
};

// 第一次收到 snap shot 的處理
const handleSnapShot = (snapshot: OrderBookData) => {
  const orderBookStore = useOrderBookStore();
  bidsMap.clear();
  asksMap.clear();
  prevBidsMap.clear();
  prevAsksMap.clear();
  snapshot.bids.forEach(([price, size]) => {
    bidsMap.set(price, size);
    prevBidsMap.set(price, size);
  });
  snapshot.asks.forEach(([price, size]) => {
    asksMap.set(price, size);
    prevAsksMap.set(price, size);
  });
  lastSeqNum = snapshot.seqNum;
  initialized = true;
  orderBookStore.updateState({
    lastOrderBookData: snapshot,
  });
};

const handleDelta = (delta: OrderBookData) => {
  const orderBookStore = useOrderBookStore();
  if (!initialized) return;
  if (delta.prevSeqNum !== lastSeqNum) {
    // 待實作 這邊收到的 seqNum 不一樣要重新訂閱
    return;
  }
  delta.bids.forEach(([price, size]) => {
    // 當 size 為 0 要刪除
    if (size === 0) {
      bidsMap.delete(price);
    } else {
      // 其餘就依靠 map 自動新增或更新既有的 map
      bidsMap.set(price, size);
    }
  });

  delta.asks.forEach(([price, size]) => {
    // 當 size 為 0 要刪除
    if (size === 0) {
      asksMap.delete(price);
    } else {
      // 其餘就依靠 map 自動新增或更新既有的 map
      asksMap.set(price, size);
    }
  });
  lastSeqNum = delta.seqNum;

  const sortedBidQuotes = formatSortedQuotes("buy");
  const sortedAskQuotes = formatSortedQuotes("sell");
  orderBookStore.updateState({
    sortedBidQuotes,
    sortedAskQuotes,
  });
  syncPrevMaps();
};

const parseOrderBookData = (orderBookData: OrderBookData) => {
  if (!orderBookData) {
    return;
  }
  if (orderBookData.type === "snapshot") {
    handleSnapShot(orderBookData);
  } else if (orderBookData.type === "delta") {
    handleDelta(orderBookData);
  }
  // console.log("parseOrderBookData = ", orderBookData);
};
