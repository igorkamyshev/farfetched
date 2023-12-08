<script setup>
defineProps(['value'])
defineEmits(['update:value'])
</script>

<template>
    <input type="text" placeholder="Search..." v-model="value" />
</template>