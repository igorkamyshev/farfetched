<script setup>
defineEmits(['overlay-click']);
const { visible } = defineProps(['visible']);
</script>

<template>
  <div v-if="visible" @click="$emit('overlay-click')" class="overlay">
    <div class="content" @click.stop.prevent>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  right: 0px;
  bottom: 0px;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
}

.content {
  width: calc(100% - 64px);
  height: calc(100% - 64px);
  overflow: auto;
  padding: 16px;
  margin: 32px;
  box-sizing: border-box;
  background-color: white;
  border-radius: 18px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.08);
}
</style>
