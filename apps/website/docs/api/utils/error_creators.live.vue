<script setup>
import { configurationError } from '@farfetched/core';

const error = configurationError({
  validationErrors: ['"LOL KEK" is not valid URL'],
});
</script>

<template>
  <pre>{{ JSON.stringify(error, null, 2) }}</pre>
</template>
