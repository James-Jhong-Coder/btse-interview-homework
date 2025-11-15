const ORDER_BOOK_WS_URL = "wss://ws.btse.com/ws/oss/futures";

let orderBookWebSocket: WebSocket | null = null;

// 取得 order book webSocket
export const getOrderBookSocket = () => {
  // 若未建立或已經關閉 → 重建連線
  if (
    !orderBookWebSocket ||
    orderBookWebSocket.readyState === WebSocket.CLOSED
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

  if (webSocket.readyState === WebSocket.OPEN) {
    webSocket.send(JSON.stringify(data));
    console.log("[BTSE-OrderBook] WebSocket send:", JSON.stringify(data));
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
