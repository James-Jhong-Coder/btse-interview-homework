<script setup lang="ts">
interface Props {
  name: string;
}
const props = withDefaults(defineProps<Props>(), {});
</script>

<template>
  <svg aria-hidden="true" class="svg-icon">
    <use :href="`#icon-${props.name}`" />
  </svg>
</template>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
}
</style>
