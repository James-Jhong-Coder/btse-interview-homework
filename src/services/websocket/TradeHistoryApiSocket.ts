import { useTradeHistoryStore } from "@/stores/tradeHistory";
const HISTORY_API_WS_URL = "wss://ws.btse.com/ws/futures";

let tradeHistoryApiWebSocket: WebSocket | null = null;

export const getTradeHistoryApiSocket = (): WebSocket => {
  if (
    !tradeHistoryApiWebSocket ||
    tradeHistoryApiWebSocket.readyState === WebSocket.CLOSED ||
    tradeHistoryApiWebSocket.readyState === WebSocket.CLOSING
  ) {
    tradeHistoryApiWebSocket = new WebSocket(HISTORY_API_WS_URL);

    tradeHistoryApiWebSocket.addEventListener("open", () => {
      console.log("[BTSE-HistoryApi] WebSocket connected");
    });

    tradeHistoryApiWebSocket.addEventListener("close", () => {
      console.log("[BTSE-HistoryApi] WebSocket disconnected");
    });

    tradeHistoryApiWebSocket.addEventListener("error", (err) => {
      console.error("[BTSE-HistoryApi] WebSocket error:", err);
    });
  }

  return tradeHistoryApiWebSocket;
};

export const sendTradeHistoryApiData = (data: unknown) => {
  const webSocket = getTradeHistoryApiSocket();

  if (webSocket.readyState === WebSocket.OPEN) {
    console.log("[BTSE-HistoryApi] send immediately", data);
    webSocket.send(JSON.stringify(data));
    return;
  }

  console.log("[BTSE-HistoryApi] queue send on open", data);
  webSocket.addEventListener(
    "open",
    () => {
      webSocket.send(JSON.stringify(data));
    },
    { once: true }
  );
};
