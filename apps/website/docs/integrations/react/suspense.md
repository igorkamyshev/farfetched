# Suspense in React integration

## TL;DR

Suspense for Data Fetching is unsupported in `@farfetched/react`, because it is [still unstable](https://github.com/facebook/react/issues/13206), and we do not want to force you to use APIs that are not ready.

## Details

Current state of Suspense for Data Fetching is pretty unclear, there are no official documentation, and all that we know is it will be releases likely after React 18. We are following any news about this feature and will add support for it as soon as it will be ready.

If you want to use Farfetched with Suspense, consider using [Solid](https://www.solidjs.com), that is a declarative JavaScript library for creating user interfaces. It is very similar to React, but it has numerous advantages over React, and it is much more performant. Furthermore, it is straightforward to migrate from React to Solid, and it is possible to use Solid and React in the same project. Farfetched has a [Solid integration](/integrations/solid/) with Suspense support.
