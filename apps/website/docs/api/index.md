---
sidebar: false
---

# Farfetched API

Complete list of all the APIs available in Farfetched.

<script setup>
    import { data as sections } from './apis.data'

    function hasSubsections(section) {
        return section.items.every(item => !item.link)
    }
</script>

<div v-for="section in sections">
    <h2>{{section.text}}</h2>
    <div v-if="hasSubsections(section)">
        <div v-for="subsection in section.items">
            <h3>{{subsection.text}}</h3>
            <ul>
                <li v-for="item in subsection.items">
                    <a v-if="item.link" :href="item.link">{{item.text}}</a>
                </li>
            </ul>
        </div>
    </div>
    <ul v-else>
        <li v-for="item in section.items">
            <a :href="item.link">{{item.text}}</a>
        </li>
    </ul>

</div>
