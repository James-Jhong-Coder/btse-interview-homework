import { Observable } from "rxjs";
import {
  getOrderBookSocket,
  sendOrderBookData,
} from "@/services/websocket/OrderBookSocket";
import type { OrderBookData, OrderBookMessage } from "./types/orderBook.types";
let orderBookSubId = 0;

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
    orderBookSubId += 1;
    const orderBookWebSocket = getOrderBookSocket();
    const onCloseHandler = () => {
      subscriber.complete();
    };

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
    orderBookWebSocket.addEventListener("close", onCloseHandler);

    // 退訂，移除
    return () => {
      if (orderBookWebSocket.readyState === WebSocket.OPEN) {
        sendOrderBookData({
          op: "unsubscribe",
          args: [topic],
        });
      }
      orderBookWebSocket.removeEventListener("message", onMessageHandler);
      orderBookWebSocket.removeEventListener("close", onCloseHandler);
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
