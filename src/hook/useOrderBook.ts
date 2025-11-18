import { VISIBLE_MAX_QUOTE } from "@/common/const";
import { onMounted, onUnmounted } from "vue";
import type { Subscription } from "rxjs";
import type {
  OrderBookData,
  OrderBookQuote,
  OrderSide,
  RowHighlight,
  SizeHightLight,
} from "@/services/websocket/types/orderBook.types";
import { useOrderBookStore } from "@/stores/orderBook";
import { subscribeOrderBook } from "@/services/websocket/OrderBookService";
import { useBigNumber } from "@/hook/useBigNumber.ts";
const { sumArray } = useBigNumber();

let bidsMap = new Map<number, number>();
let asksMap = new Map<number, number>();

let prevBidsMap = new Map<number, number>();
let prevAsksMap = new Map<number, number>();
let lastSeqNum: number | null = null;
let initialized = false;
let orderBookSubscription: Subscription | null = null;

export const useOrderBook = () => {
  onMounted(() => {
    if (orderBookSubscription) {
      return;
    }
    const subscribeOrderBook$ = subscribeOrderBook({
      symbol: "BTCPFC",
      grouping: 0,
    });
    orderBookSubscription = subscribeOrderBook$.subscribe((data) => {
      parseOrderBookData(data);
    });
  });

  onUnmounted(() => {
    if (orderBookSubscription) {
      const orderBookStore = useOrderBookStore();
      orderBookSubscription.unsubscribe();
      orderBookStore.$reset();
      orderBookSubscription = null;
    }
  });
};

// 將 delta 的資料更新回 snapshot 的結果再同步到 prevMap
const syncPrevMaps = () => {
  prevBidsMap.clear();
  prevAsksMap.clear();
  // 要注意一點，map 的 key 是 price, value 是 size，forEach 會倒過來
  bidsMap.forEach((size, price) => {
    prevBidsMap.set(price, size);
  });
  asksMap.forEach((size, price) => {
    prevAsksMap.set(price, size);
  });
};

const formatSortedQuotes = (side: OrderSide): OrderBookQuote[] => {
  const isBuy = side === "buy";
  const prevMap = isBuy ? prevBidsMap : prevAsksMap;

  // 1. 先把當前 side 的 Map 轉成 [price, size] 陣列並排序
  let entries = isBuy
    ? // Buy：價格從高到低（最高買價 → 最低買價）
      Array.from(bidsMap.entries()).sort((a, b) => b[0] - a[0])
    : // Sell：價格從低到高（最低賣價 → 最高賣價）
      Array.from(asksMap.entries()).sort((a, b) => a[0] - b[0]);

  const result: OrderBookQuote[] = [];

  // 2. 只取要顯示的前 N 筆
  const visibleQuotes = entries.slice(0, VISIBLE_MAX_QUOTE);

  // 3. 用「可見的這 N 筆」來算總量，當成百分比的分母
  const accumulativeTotalSize =
    visibleQuotes.reduce((acc, [, size]) => {
      return sumArray([acc, size]);
    }, 0) || 1;

  // 4. 依規則做累加：
  //  - Buy：visibleQuotes 已經是高→低
  //  - Sell：visibleQuotes 已經是低→高
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
};

// 第一次收到 snap shot 的處理
const handleSnapShot = (snapshot: OrderBookData) => {
  const orderBookStore = useOrderBookStore();
  bidsMap.clear();
  asksMap.clear();
  prevBidsMap.clear();
  prevAsksMap.clear();
  snapshot.bids.forEach(([price, size]) => {
    const _price = Number(price);
    const _size = Number(size);
    bidsMap.set(_price, _size);
    prevBidsMap.set(_price, _size);
  });
  snapshot.asks.forEach(([price, size]) => {
    const _price = Number(price);
    const _size = Number(size);
    asksMap.set(_price, _size);
    prevAsksMap.set(_price, _size);
  });
  lastSeqNum = snapshot.seqNum;
  initialized = true;
  const sortedBidQuotes = formatSortedQuotes("buy");
  const sortedAskQuotes = formatSortedQuotes("sell");
  orderBookStore.updateState({
    lastOrderBookData: snapshot,
    sortedBidQuotes,
    sortedAskQuotes,
  });
};

const handleDelta = (delta: OrderBookData) => {
  const orderBookStore = useOrderBookStore();
  if (!initialized) return;
  if (delta.prevSeqNum !== lastSeqNum) {
    orderBookSubscription?.unsubscribe();
    orderBookSubscription = null;
    const observable$ = subscribeOrderBook({ symbol: "BTCPFC", grouping: 0 });
    orderBookSubscription = observable$.subscribe(parseOrderBookData);
    initialized = false;
    return;
  }
  delta.bids.forEach(([price, size]) => {
    // 當 size 為 0 要刪除
    const _price = Number(price);
    const _size = Number(size);
    if (_size === 0) {
      bidsMap.delete(_price);
    } else {
      // 其餘就依靠 map 自動新增或更新既有的 map
      bidsMap.set(_price, _size);
    }
  });

  delta.asks.forEach(([price, size]) => {
    // 當 size 為 0 要刪除
    const _price = Number(price);
    const _size = Number(size);
    if (Number(size) === 0) {
      asksMap.delete(_price);
    } else {
      // 其餘就依靠 map 自動新增或更新既有的 map
      asksMap.set(_price, _size);
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
};
