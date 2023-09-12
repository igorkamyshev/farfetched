---
sidebar: false
---

# Releases

Farfetched is mostly been creating in Thailand, so all releases are named after beautiful places in Thailand.

<script setup>
    import { data as releases } from './releases.data'
</script>

<ul>
    <li v-for="release in releases">
        <a :href="release.link">{{release.text}}</a>
    </li>
</ul>
