<script setup>
import { createJsonQuery } from '@farfetched/core';
import { runtypeContract } from '@farfetched/runtypes';
import { useUnit } from 'effector-vue/composition';
import { Record, String, Array } from 'runtypes';

const randomQuotesQuery = createJsonQuery({
  initialData: [],
  request: {
    method: 'GET',
    url: ({ amount }) =>
      `https://api.breakingbadquotes.xyz/v1/quotes/${amount}`,
  },
  response: {
    /*
     * We use runtypes to validate response,
     * but you can replace it with other library, see 👇
     * https://ff.effector.dev/tutorial/contracts.html#third-party-solutions
     */
    contract: runtypeContract(
      Array(
        Record({
          author: String,
          quote: String,
        })
      )
    ),
  },
});

const { pending, data } = useUnit(randomQuotesQuery);

function handleClick() {
  randomQuotesQuery.start({ amount: 10 });
}
</script>

<template>
  <button @click="handleClick()">Load</button>
  <p v-if="pending">Loading...</p>
  <div v-else>
    <p>Random quores</p>
    <ul>
      <li v-for="quote in data" :key="quote.quote">
        {{ quote.quote }} - {{ quote.author }}
      </li>
    </ul>
  </div>
</template>
