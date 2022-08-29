# Render as you fetch

> Watch ["Goodbuy, useEffect"](https://www.youtube.com/watch?v=HPoC-k7Rxwo) talk by David Khourshid, he gave a great explanation of this idea.

We believe that data should be the primary entity in any application, so view can relate to the data. It means, application must fetch remote data on some application events and **not on render**.

> Note. Future version of React documentation [advices the same approach](https://beta.reactjs.org/learn/you-might-not-need-an-effect#fetching-data).

## When should I start data-fetching?

In common frontend application, data-fetching should be started by router events.

> We suggest using [Atomic Router](https://atomic-router.github.io). It is simple and powerful router that is framework-agnostic. You can find an example of integration it with Farfetched in [this real-world showcase](../../apps/showcase/solid-real-world-rick-morty/).
