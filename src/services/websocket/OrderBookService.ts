import { getBtseSocket, sendDataToBtse } from "@/services/websocket/BtseSocket";
import { Observable } from "rxjs";
import type { OrderBookMessage } from "./types/socket.types";

interface subscribeOrderBookParams {
  symbol: string;
  grouping: number;
}

// 訂閱 order book
export const subscribeOrderBook = ({
  symbol = "BTCPFC",
  grouping = 0,
}: subscribeOrderBookParams) => {
  const topic = `update:${symbol}_${grouping}`;
  const observable$ = new Observable<OrderBookMessage["data"]>((subscriber) => {
    const ws = getBtseSocket();

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
    return () => {
      sendDataToBtse({
        op: "unsubscribe",
        args: [topic],
      });
      window.removeEventListener("message", onMessageHandler);
      console.log(`[OrderBookService] unsubscribed from ${topic}`);
    };
  });
  sendDataToBtse({
    op: "subscribe",
    args: [topic],
  });

  console.log("[OrderBookService] subscribe", symbol);
  return observable$;
};

// 解除訂閱 order book
export const unsubscribeOrderBook = (symbol = "BTCPFC_0") => {
  sendDataToBtse({
    op: "unsubscribe",
    args: [`update:${symbol}`],
  });

  console.log("[OrderBookService] unsubscribe", symbol);
};
