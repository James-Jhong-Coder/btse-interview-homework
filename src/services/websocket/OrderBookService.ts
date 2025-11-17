import { Observable } from "rxjs";
import {
  getOrderBookSocket,
  sendOrderBookData,
} from "@/services/websocket/OrderBookSocket";
import type { OrderBookData, OrderBookMessage } from "./types/orderBook.types";

interface SubscribeOrderBookParams {
  symbol?: string;
  grouping?: number;
}

// 訂閱 order book
export const subscribeOrderBook = ({
  symbol = "BTCPFC",
  grouping = 0,
}: SubscribeOrderBookParams = {}) => {
  const topic = `update:${symbol}_${grouping}`;

  const observable$ = new Observable<OrderBookData>((subscriber) => {
    const orderBookWebSocket = getOrderBookSocket();

    const onMessageHandler = (event: MessageEvent) => {
      try {
        const orderBookMessage = JSON.parse(event.data) as OrderBookMessage;

        if (orderBookMessage.topic === topic) {
          subscriber.next(orderBookMessage.data); // 推出 snapshot 或 delta 資料
        }
      } catch (err) {
        subscriber.error(err);
      }
    };

    orderBookWebSocket.addEventListener("message", onMessageHandler);

    // 退訂，移除
    return () => {
      sendOrderBookData({
        op: "unsubscribe",
        args: [topic],
      });
      orderBookWebSocket.removeEventListener("message", onMessageHandler);
      console.log(`[OrderBookService] unsubscribed from ${topic}`);
    };
  });

  // 送出訂閱指令
  sendOrderBookData({
    op: "subscribe",
    args: [topic],
  });

  console.log("[OrderBookService] subscribe", topic);

  return observable$;
};
