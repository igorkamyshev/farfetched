---
sidebar: false
---

# Releases

Farfetched is mostly been creating in Thailand, so all releases are named after beautiful places in Thailand.

:::tip
To use unreleased version of Farfetched, please refer to [canary](/releases/canary) page.
:::

<script setup>
    import { data as releases } from './releases.data'
</script>

<ul>
    <li v-for="release in releases">
        <a :href="release.link">{{release.text}}</a>
    </li>
</ul>
