<script setup>
import { useUnit } from 'effector-vue/composition';

import { $visible, show, hide } from './view-model/visibility';
import { operationHeaders, $operationsList } from './view-model/list';
import FloatingButton from './ui/FloatingButton.vue';
import Modal from './ui/Modal.vue';
import Table from './ui/Table.vue';

const { visible, handleButtonClick, handleOverlayClick, operationsList } =
  useUnit({
    visible: $visible,
    handleButtonClick: show,
    handleOverlayClick: hide,
    operationsList: $operationsList,
  });
</script>

<template>
  <FloatingButton @click="handleButtonClick">FF DevTools</FloatingButton>
  <Modal :visible="visible" @overlay-click="handleOverlayClick">
    HEADER
    <Table :headers="operationHeaders" :items="operationsList" />
  </Modal>
</template>
