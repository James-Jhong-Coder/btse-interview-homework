<script setup lang="ts">
import { computed } from "vue";
import { useBigNumber } from "@/hook/useBigNumber";
import { PRICE_DIRECTION } from "@/common/const";
const { formatWithComma } = useBigNumber();

interface Props {
  price: number | null | undefined;
  direction: string;
}
const props = defineProps<Props>();
const computedPrice = computed(() => {
  if (props.price === undefined || props.price === null) {
    return "";
  }
  return formatWithComma(props.price);
});
const computedPriceDirectionStyle = computed(() => {
  if (!props.direction) {
    return [];
  }
  const styleMap = {
    [PRICE_DIRECTION.INCREASE]: ["text-green-400", "bg-green-100"],
    [PRICE_DIRECTION.DECREASE]: ["text-red-400", "bg-red-100"],
    [PRICE_DIRECTION.SAME]: ["text-gray-500", "bg-gray-100"],
  };
  return styleMap[props.direction] ?? [];
});
</script>
<template>
  <div class="last-price py-1" :class="[...computedPriceDirectionStyle]">
    <span>{{ computedPrice }}</span>
    <SvgIcon
      v-if="direction !== PRICE_DIRECTION.SAME"
      name="icon_arrow_down"
      class="ml-2"
      :class="{
        'icon-up': direction === PRICE_DIRECTION.INCREASE,
      }"
    />
  </div>
</template>

<style scoped>
@reference "@/assets/tailwind.css";
.last-price {
  @apply font-medium text-base;
  @apply flex items-center justify-center;
}
.icon-up {
  transform: rotate(180deg);
}
</style>
