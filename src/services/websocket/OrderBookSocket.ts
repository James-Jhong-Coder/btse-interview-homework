const ORDER_BOOK_WS_URL = "wss://ws.btse.com/ws/oss/futures";

let orderBookWebSocket: WebSocket | null = null;

// 取得 order book webSocket
export const getOrderBookSocket = (): WebSocket => {
  // 若未建立或已經關閉 → 重建連線
  if (
    !orderBookWebSocket ||
    orderBookWebSocket.readyState === WebSocket.CLOSED ||
    orderBookWebSocket.readyState === WebSocket.CLOSING
  ) {
    orderBookWebSocket = new WebSocket(ORDER_BOOK_WS_URL);
    orderBookWebSocket.addEventListener("open", () => {
      console.log("[BTSE-OrderBook] WebSocket connected");
    });

    orderBookWebSocket.addEventListener("close", () => {
      console.log("[BTSE-OrderBook] WebSocket disconnected");
    });

    orderBookWebSocket.addEventListener("error", (err) => {
      console.error("[BTSE-OrderBook] WebSocket error:", err);
    });
  }

  return orderBookWebSocket;
};

export const sendOrderBookData = (data: any) => {
  const webSocket = getOrderBookSocket();
  const payload = JSON.stringify(data);
  if (webSocket.readyState === WebSocket.OPEN) {
    webSocket.send(payload);
    console.log("[BTSE-OrderBook] WebSocket send:", payload);
    return;
  }

  webSocket.addEventListener(
    "open",
    () => {
      webSocket.send(payload);
    },
    { once: true }
  );
};
