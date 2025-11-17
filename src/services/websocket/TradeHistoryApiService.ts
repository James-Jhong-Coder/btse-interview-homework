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

        // 如果訂閱沒有成功，就不往下執行
        if (!isSubscribed) return;
        // 只處理 tradeHistoryApi 的消息
        if (msg.topic !== "tradeHistoryApi" || !Array.isArray(msg.data)) return;

        const data = msg.data as TradeHistoryMessage["data"];
        // 因為只拿第一筆作顯示
        const first = data[0];

        // 確認 symbol 一致，避免混到其他商品
        if (!first || first.symbol !== symbol) return;

        subscriber.next(first);
      } catch (err) {
        subscriber.error(err);
      }
    };
    const onCloseHandler = () => {
      subscriber.complete(); // 或 subscriber.error(new Error("WS closed"))
    };

    webSocket.addEventListener("message", onMessageHandler);
    webSocket.addEventListener("close", onCloseHandler);
    // 送出訂閱指令
    sendTradeHistoryApiData({
      op: "subscribe",
      args: [topic],
    });

    // teardown：退訂 + 移除 listener
    return () => {
      sendTradeHistoryApiData({
        op: "unsubscribe",
        args: [topic],
      });
      webSocket.removeEventListener("message", onMessageHandler);
      webSocket.removeEventListener("close", onCloseHandler);
      console.log(`[TradeHistoryService] unsubscribed from ${topic}`);
    };
  });

  console.log("[TradeHistoryService] subscribe", topic);
  return observable$;
};

// 如果你要額外手動退訂（不用 Observable 的 teardown 時）
export const unsubscribeTradeHistory = (symbol = "BTCPFC") => {
  const topic = `tradeHistoryApi:${symbol}`;

  sendTradeHistoryApiData({
    op: "unsubscribe",
    args: [topic],
  });

  console.log("[TradeHistoryService] unsubscribe", topic);
};
