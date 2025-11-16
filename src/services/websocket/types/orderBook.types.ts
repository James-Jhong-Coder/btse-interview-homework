export type Bid = [number, number];
export type Ask = [number, number];

export interface OrderBookData {
  bids: Bid[];
  asks: Ask[];
  seqNum: number;
  prevSeqNum: number;
  type: "snapshot" | "delta";
  timestamp: number;
  symbol: string;
}

export interface OrderBookMessage {
  topic: string;
  data: OrderBookData;
}

export type RowHighlight = "none" | "new";

export type SizeHightLight = "none" | "increase" | "decrease";

export type OrderSide = "buy" | "sell";
export interface OrderBookQuote {
  side: OrderSide;
  price: number;
  size: number;
  totalSize: number;
  totalPercent: number;
  rowHighlight: RowHighlight;
  sizeHighlight: SizeHightLight;
}
