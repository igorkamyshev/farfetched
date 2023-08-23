---
layout: home

hero:
  name: Farfetched
  text: Effector's family
  tagline: The advanced data fetching tool for web applications
  image:
    src: /logo.svg
    alt: Farfetched
  actions:
    - theme: brand
      text: Get Started
      link: /tutorial/
    - theme: alt
      text: Roadmap
      link: /roadmap

features:
  - icon: ☄️
    title: Declarative and reactive
    details: Writing your data fetching logic by hand is over. Just tell us what do you want, and we will handle the rest — dependant queries, stale data, and more.
  - icon: 👩🏽‍💻
    title: Fabulous DX and excellent UX
    details: There's no complex state to manage, reducers, normalization systems or heavy configurations to understand. It just works, and it works fast.
  - icon: 🚀
    title: Transport and framework agnostic
    details: We will not push you to use React, or to switch to GraphQL. Your application is yours, we are here to help you with boring parts and complex cases.
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers,
  VPTeamPageSection
} from 'vitepress/theme'

import { data as contributors} from './contributors.data';
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>Contributors</template>
  </VPTeamPageTitle>
  <VPTeamMembers size="small" :members="contributors" />
</VPTeamPage>
