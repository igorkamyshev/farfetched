<script setup>
import ValueView from './ValueView.vue';

const { items, headers } = defineProps(['items', 'headers']);
</script>

<template>
  <table>
    <thead>
      <tr>
        <th v-for="header in headers">{{ header }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items">
        <td v-for="cell in item">
          <ValueView :item="cell" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  background-color: white;
  width: 100%;
}

table,
th,
td {
  border: 1px solid;
}

td {
  padding: 8px;
}
</style>
