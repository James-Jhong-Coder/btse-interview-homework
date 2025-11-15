export type Bid = [string, string];
export type Ask = [string, string];

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
