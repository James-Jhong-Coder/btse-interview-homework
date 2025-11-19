import { Observable } from "rxjs";
import {
  getTradeHistoryApiSocket,
  sendTradeHistoryApiData,
} from "@/services/websocket/TradeHistoryApiSocket";
import type {
  TradeHistoryItem,
  TradeHistoryMessage,
} from "./types/tradeHistory.types";

interface SubscribeTradeHistoryParams {
  symbol?: string;
}

// 訂閱 tradeHistoryApi（成交資訊）
export const subscribeTradeHistory = ({
  symbol = "BTCPFC",
}: SubscribeTradeHistoryParams = {}) => {
  const topic = `tradeHistoryApi:${symbol}`;

  const observable$ = new Observable<TradeHistoryItem>((subscriber) => {
    const webSocket = getTradeHistoryApiSocket();
    let isSubscribed = false; // 要訂閱 Acknowledged 才可以收資料
    const onMessageHandler = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data) as any;

        // 判斷是否拿到訂閱成功的 ack
        if (
          msg.event === "subscribe" &&
          Array.isArray(msg.channel) &&
          msg.channel.includes(topic)
        ) {
          console.log(`[TradeHistoryService] subscribed ACK: ${topic}`);
          isSubscribed = true;
          return;
        }

        if (!isSubscribed) return;
        if (msg.topic !== "tradeHistoryApi" || !Array.isArray(msg.data)) return;

        const data = msg.data as TradeHistoryMessage["data"];
        const first = data[0];

        if (!first || first.symbol !== symbol) return;

        subscriber.next(first);
      } catch (err) {
        subscriber.error(err);
      }
    };
    const onCloseHandler = () => {
      subscriber.complete();
    };

    webSocket.addEventListener("message", onMessageHandler);
    webSocket.addEventListener("close", onCloseHandler);
    sendTradeHistoryApiData({
      op: "subscribe",
      args: [topic],
    });

    // teardown：退訂 + 移除 listener
    return () => {
      if (webSocket.readyState === WebSocket.OPEN) {
        sendTradeHistoryApiData({
          op: "unsubscribe",
          args: [topic],
        });
      }
      webSocket.removeEventListener("message", onMessageHandler);
      webSocket.removeEventListener("close", onCloseHandler);
      console.log(`[TradeHistoryService] unsubscribed from ${topic}`);
    };
  });

  console.log("[TradeHistoryService] subscribe", topic);
  return observable$;
};
