<script setup lang="ts">
import { useTradeHistory } from "@/hook/useTradeHistory";
import { useOrderBook } from "@/hook/useOrderBook";
useTradeHistory();
useTradeHistory();
useTradeHistory();
useTradeHistory();
useOrderBook(); // 訂閱 order book
useOrderBook(); // 訂閱 order book
useOrderBook(); // 訂閱 order book
useOrderBook(); // 訂閱 order book
</script>
<template>
  <div class="text-red-500">test</div>
</template>
