const BTSE_WS_URL = "wss://ws.btse.com/ws/futures";
// const BTSE_WS_URL = "wss://ws.btse.com/ws/oss/futures";

let ws: WebSocket | null = null;

export const getBtseSocket = (): WebSocket => {
  if (!ws || ws.readyState === WebSocket.CLOSED) {
    ws = new WebSocket(BTSE_WS_URL);

    ws.addEventListener("open", () => {
      console.log("[BTSE] WebSocket connected");
    });

    ws.addEventListener("close", () => {
      console.log("[BTSE] WebSocket disconnected");
    });

    ws.addEventListener("error", (e) => {
      console.error("[BTSE] WebSocket error:", e);
    });

    // ws.addEventListener("message", (event) => {
    //   console.log("[BTSE] message:", event.data);
    // });
  }

  return ws;
};

export const sendDataToBtse = (payload: any) => {
  const socket = getBtseSocket();
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  } else {
    socket.addEventListener(
      "open",
      () => socket.send(JSON.stringify(payload)),
      { once: true }
    );
  }
};
