// src/services/websocket/TradeHistoryService.ts

import { Observable } from "rxjs";
import {
  getTradeHistoryApiSocket,
  sendTradeHistoryApiData,
} from "@/services/websocket/HistoryApiSocket";
import type {
  TradeHistoryItem,
  TradeHistoryMessage,
} from "./types/tradeHistory.types";

interface SubscribeTradeHistoryParams {
  symbol: string;
}

// 訂閱 tradeHistoryApi（成交資訊）
export const subscribeTradeHistory = ({
  symbol = "BTCPFC",
}: SubscribeTradeHistoryParams) => {
  const topic = `tradeHistoryApi:${symbol}`;

  // 推 trades 陣列出去（你也可以改成單筆或自己 map）
  const observable$ = new Observable<TradeHistoryItem>((subscriber) => {
    const ws = getTradeHistoryApiSocket();

    const onMessageHandler = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data) as any;

        // 只處理 tradeHistoryApi 的消息
        if (msg.topic !== "tradeHistoryApi" || !Array.isArray(msg.data)) return;

        const data = msg.data as TradeHistoryMessage["data"];
        const first = data[0];

        // 確認 symbol 一致，避免混到其他商品
        if (!first || first.symbol !== symbol) return;

        subscriber.next(first);
      } catch (err) {
        subscriber.error(err);
      }
    };

    ws.addEventListener("message", onMessageHandler);

    // teardown：退訂 + 移除 listener
    return () => {
      sendTradeHistoryApiData({
        op: "unsubscribe",
        args: [topic],
      });

      ws.removeEventListener("message", onMessageHandler);

      console.log(`[TradeHistoryService] unsubscribed from ${topic}`);
    };
  });

  // 送出訂閱指令
  sendTradeHistoryApiData({
    op: "subscribe",
    args: [topic],
  });

  console.log("[TradeHistoryService] subscribe", symbol);

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
