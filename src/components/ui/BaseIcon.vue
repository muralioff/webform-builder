<script setup>
import { computed } from 'vue'
import { getIcon } from '@/assets/icons'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 16 }
})

const svg = computed(() => getIcon(props.name))
const px = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <!-- Inlined (not <img>) so the SVG's currentColor resolves against the
       token-driven `color` of whatever renders it. -->
  <span class="icon" :style="{ width: px, height: px }" v-html="svg" />
</template>

<style scoped>
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 0;
}
.icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
