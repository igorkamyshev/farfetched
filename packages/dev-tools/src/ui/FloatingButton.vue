<script setup>
defineEmits(['click']);
</script>

<template>
  <button @click="$emit('click')">
    <slot />
  </button>
</template>

<style scoped>
button {
  position: fixed;
  right: 32px;
  bottom: 32px;
}
</style>
