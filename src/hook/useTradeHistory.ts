import { PRICE_DIRECTION } from "@/common/const";
import { type TradeHistoryItem } from "@/services/websocket/types/tradeHistory.types";
import { useTradeHistoryStore } from "@/stores/tradeHistory";
import { isEmpty } from "lodash";

export const useTradeHistory = () => {
  return {
    getLastPriceDirection,
  };
};

const getLastPriceDirection = ({
  newestTradeHistory,
}: {
  newestTradeHistory: TradeHistoryItem;
}) => {
  const tradeHistoryStore = useTradeHistoryStore();
  const lastTradeHistory = tradeHistoryStore.lastTradeHistory;
  if (
    isEmpty(lastTradeHistory) ||
    newestTradeHistory?.price === lastTradeHistory?.price
  ) {
    return PRICE_DIRECTION.SAME;
  } else if (newestTradeHistory.price > lastTradeHistory.price) {
    return PRICE_DIRECTION.UP;
  } else if (newestTradeHistory.price < lastTradeHistory.price) {
    return PRICE_DIRECTION.DOWN;
  }
  return "";
};
