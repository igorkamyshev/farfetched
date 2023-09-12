---
sidebar: false
---

# Statements

We follow several principles in developing the library. It is our statements about it.

<script setup>
    import { data as statements } from './statements.data'
</script>

<ul>
    <li v-for="statement in statements">
        <a :href="statement.link">{{statement.text}}</a>
    </li>
</ul>
