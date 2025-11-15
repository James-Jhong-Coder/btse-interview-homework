export interface TradeHistoryItem {
  symbol: string;
  side: "BUY" | "SELL";
  size: number;
  price: number;
  tradeId: number;
  timestamp: number;
}

export interface TradeHistoryMessage {
  topic: string;
  data: TradeHistoryItem[];
}