<script setup>
import JsonViewer from 'vue-json-viewer';

const { item } = defineProps(['item']);

let view;

if (typeof item === 'string') {
  view = 'span';
}
if (typeof item === 'object') {
  view = item.type;
}
</script>

<template>
  <span v-if="view === 'span'">{{ item }}</span>
  <span v-if="view === 'json'">
    <JsonViewer :value="item.value" expand-depth="0" copyable sort />
  </span>
</template>
