import { Observable } from "rxjs";
import {
  getOrderBookSocket,
  sendOrderBookData,
} from "@/services/websocket/OrderBookSocket";
import type { OrderBookMessage } from "./types/orderBook.types";

interface SubscribeOrderBookParams {
  symbol: string;
  grouping: number;
}

// 訂閱 order book
export const subscribeOrderBook = ({
  symbol = "BTCPFC",
  grouping = 0,
}: SubscribeOrderBookParams) => {
  const topic = `update:${symbol}_${grouping}`;

  const observable$ = new Observable<OrderBookMessage["data"]>((subscriber) => {
    const ws = getOrderBookSocket();

    const onMessageHandler = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);

        // 過濾指定 topic
        if (msg.topic === topic) {
          subscriber.next(msg.data); // 推出 snapshot 或 delta 資料
        }
      } catch (err) {
        subscriber.error(err);
      }
    };

    ws.addEventListener("message", onMessageHandler);

    // teardown：退訂 + 移除 listener
    return () => {
      sendOrderBookData({
        op: "unsubscribe",
        args: [topic],
      });

      ws.removeEventListener("message", onMessageHandler);

      console.log(`[OrderBookService] unsubscribed from ${topic}`);
    };
  });

  // 送出訂閱指令
  sendOrderBookData({
    op: "subscribe",
    args: [topic],
  });

  console.log("[OrderBookService] subscribe", symbol);

  return observable$;
};

export const unsubscribeOrderBook = (symbol = "BTCPFC_0") => {
  const topic = `update:${symbol}`;

  sendOrderBookData({
    op: "unsubscribe",
    args: [topic],
  });

  console.log("[OrderBookService] unsubscribe", symbol);
};
