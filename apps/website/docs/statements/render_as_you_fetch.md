# Render as you fetch

> Watch ["Goodbuy, useEffect"](https://www.youtube.com/watch?v=HPoC-k7Rxwo) talk by David Khourshid, he gave a great explanation of this idea.

We believe that data should be the primary entity in any application, so view can relate to the data. It means, application must fetch remote data on some application events and **not on render**.
Rendering process it is a implementation detail of a view libraries and frameworks, it should not be part of your application logic. Relying on render process makes application logic more brittle, than it should be and introduces new problems.
If you ever had to hack around React's `useEffect` with refs or by adding more dependencies than its handler needs - you know what this all about.

> Note. Future version of React documentation [advices the same approach](https://beta.reactjs.org/learn/you-might-not-need-an-effect#fetching-data).

## When should I start data-fetching?

What you really interested in is a application events like specific page being opened by user, button clicked, your server responded, data became stale and so on.

E.g. if you want to fetch some data, when user enters some page, you should not place such request to `<PageComponent />` lifecycle hooks - instead it is much better to use your router events, because it is a actual trigger of page transitions and owner of relevant state.

> We suggest using [Atomic Router](https://atomic-router.github.io). It is simple and powerful router that is framework-agnostic. You can find an example of integration it with Farfetched in [this real-world showcase](https://github.com/igorkamyshev/farfetched/tree/master/apps/showcase/solid-real-world-rick-morty/).
