const HISTORY_API_WS_URL = "wss://ws.btse.com/ws/futures";

let tradeHistoryApiWebSocket: WebSocket | null = null;

// 記得要收到 success 才可以收
export const getTradeHistoryApiSocket = () => {
  if (
    !tradeHistoryApiWebSocket ||
    tradeHistoryApiWebSocket.readyState === WebSocket.CLOSED
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
    webSocket.send(JSON.stringify(data));
    return;
  }

  webSocket.addEventListener(
    "open",
    () => {
      webSocket.send(JSON.stringify(data));
    },
    { once: true }
  );
};
