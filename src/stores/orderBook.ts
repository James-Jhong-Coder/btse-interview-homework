import { defineStore } from "pinia";

interface OrderBookState {}

export const useStudyStore = defineStore("orderBook", {
  state: (): OrderBookState => ({}),
  actions: {
    updateState(payload: Partial<OrderBookState>) {
      this.$patch(payload);
    },
  },
});
