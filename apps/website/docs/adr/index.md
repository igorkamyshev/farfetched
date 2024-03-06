# Architecture Decision Records

All architecture decisions are recorded in this directory. They grouped by Farfetched version that they were effective in firstly.

<script setup>
    import { data as docsByVersion } from './adr.data'
</script>

<div v-for="[release, items] in docsByVersion">
  <a v-if="release.link" :href="release.link"><h2>{{ release.text }}</h2></a>
  <h2 v-else>{{ release.text }}</h2>
  <ul>
    <li v-for="item in items">
        <a :href="item.url">{{ item.frontmatter.title }}</a>
    </li>
  </ul>
</div>
