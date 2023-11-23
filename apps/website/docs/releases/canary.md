---
sidebar: false
---

# Canary versions of Farfetched

:::danger
Canary versions are not intended for production use. They can contain bugs and breaking changes, some features can be removed or changed in the stable release.
:::

We release canary versions of Farfetched to allow you to try new features before they are released. Canary versions are published for every PR that contains changesets. You can find the latest canary version of the package for particular PR in the PR comments.

## How to use

1. Replace current versions with the canary versions in `package.json`

```json
{
  "dependencies": {
    "@farfetched/core": "0.10.4", // [!code --]
    "@farfetched/core": "npm:@farfetched-canary/core@0.10.7-403.0" // [!code ++]
  }
}
```

2. Install packages

::: code-group

```bash [pnpm]
pnpm install
```

```bash [yarn]
yarn install
```

```bash [npm]
npm install
```

3. Test your application with the canary version of Farfetched

:::

## Deep-dive

In this section, you can find more details about canary versions publishing process.

### Package names

Canary versions of Farfetched are published to scope `@farfetched-canary` instead of `@farfetched`. To use them, you need to change the package name in `package.json` from `@farfetched/*` to `@farfetched-canary/*`.

::: details Full mapping

<script setup>
    import { data as mapping } from './canary_mapping.data'
</script>

<table>
    <thead>
        <tr>
            <th>Release package name</th>
            <th>Canary package name</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="item in mapping">
            <td><code>{{item.release}}</code></td>
            <td><code>{{item.canary}}</code></td>
        </tr>
    </tbody>
</table>

:::

### Package versions

Package versions for canary versions of Farfetched are generated automatically by the following rules:

1. Generate next version of the package according to [semver](https://semver.org/) rules based on changesets in the branch.
2. Add PR number to the end of the version.
3. Add build number to the end of the version.

::: details Examples

- If the latest version of the package is `0.10.4` and branch contains changeset for `minor` change, PR number is `403` and this is the first build for this PR, then the version of the package will be `0.11.0-403.0`.

- If the latest version of the package is `0.10.4` and branch contains changeset for `patch` change, PR number is `406` and this is the second build for this PR, then the version of the package will be `0.10.5-406.1`.

:::
