---
sidebar: false
---

# Recipes

Articles and examples of how to use Farfetched in various scenarios.

<script setup>
    import { data as sections } from './recipes.data'
</script>

<div v-for="section in sections">
  <h2>{{ section.text }}</h2>
  <ul>
    <li v-for="recipe in section.items">
        <a :href="recipe.link">{{ recipe.text }}</a>
    </li>
  </ul>
</div>
