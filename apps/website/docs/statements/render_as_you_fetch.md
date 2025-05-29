# Render as you fetch

> Watch ["Goodbye, useEffect"](https://www.youtube.com/watch?v=HPoC-k7Rxwo) talk by David Khourshid, he gave a great explanation of this idea.

We believe that data should be the primary entity in any application, so view can relate to the data. It means, application must fetch remote data on some application events and **not on render**.

Rendering process it is an implementation detail of a view libraries and frameworks, it should not be part of your application logic. Relying on render process makes application logic more brittle than it should be.
If you ever had to hack around React's `useEffect` with refs or by adding more dependencies than provided callback needs - you know what this all about.

> Note. Future version of React documentation [advices the same approach](https://beta.reactjs.org/learn/you-might-not-need-an-effect#fetching-data). React's effects should be used either to synchronize component to external state or to apply some additional manual changes to the DOM after React had done its work.

## When should I start data-fetching?

What you really interested in - is yours application events. Like: specific page being opened by user, button clicked, your server responded, your data became stale and so on.

E.g. if you want to fetch some data, when user enters some page, you should not place such request to `<PageComponent />` lifecycle hooks - instead it is much better to use your router events, since router is the actual trigger of page transitions and the owner of relevant state.

> We suggest using [Atomic Router](https://atomic-router.github.io). It is simple and powerful router that is framework-agnostic. You can find an example of integration it with Farfetched in [this real-world showcase](https://github.com/igorkamyshev/farfetched/tree/master/apps/showcase-solid-real-world-rick-morty/).
