// src/services/websocket/tradeHistoryApi.ts
import { Observable } from "rxjs";
import { getBtseSocket, sendDataToBtse } from "@/services/websocket/BtseSocket";
import type { TradeHistoryMessage } from "@/services/websocket/types/socket.types.ts";

interface SubscribeTradeHistoryParams {
  symbol: string;
}

// 訂閱 tradeHistoryApi（成交資訊）
export const subscribeTradeHistory = ({
  symbol = "BTCPFC",
}: SubscribeTradeHistoryParams) => {
  const topic = `tradeHistoryApi:${symbol}`;
  console.log("topic = ", topic);

  const observable$ = new Observable<TradeHistoryMessage["data"]>(
    (subscriber) => {
      const ws = getBtseSocket();

      const onMessageHandler = (event: MessageEvent) => {
        try {
          const msg = JSON.parse(event.data) as TradeHistoryMessage | any;

          // 有些文件 sample 只寫 "topic": "tradeHistoryApi"
          // 所以這裡稍微保守一點：只要是 tradeHistoryApi 開頭，再比對 symbol
          const isTradeHistoryTopic =
            typeof msg.topic === "string" &&
            msg.topic.startsWith("tradeHistoryApi") &&
            Array.isArray(msg.data);

          if (!isTradeHistoryTopic) return;

          // 再用 symbol 過濾，避免其他市場混進來
          const data = msg.data as TradeHistoryMessage["data"];
          const first = data[0];
          console.log("TradeHistoryMessage = ", event.data);

          if (first && first.symbol === symbol) {
            subscriber.next(data);
          }
        } catch (err) {
          subscriber.error(err);
        }
      };

      ws.addEventListener("message", onMessageHandler);

      // teardown：unsubscribe + 移除 listener
      return () => {
        sendDataToBtse({
          op: "unsubscribe",
          args: [topic],
        });

        ws.removeEventListener("message", onMessageHandler);

        console.log(`[TradeHistoryService] unsubscribed from ${topic}`);
      };
    }
  );

  // 送出訂閱指令
  sendDataToBtse({
    op: "subscribe",
    args: [topic],
  });
  console.log({
    op: "subscribe",
    args: [topic],
  });

  console.log("[TradeHistoryService] subscribe", symbol);

  return observable$;
};

// 解除訂閱 tradeHistoryApi（如果你想手動退訂也可以用這個）
export const unsubscribeTradeHistory = (symbol = "BTCPFC") => {
  const topic = `tradeHistoryApi:${symbol}`;

  sendDataToBtse({
    op: "unsubscribe",
    args: [topic],
  });

  console.log("[TradeHistoryService] unsubscribe", topic);
};
