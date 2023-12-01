# Pause world until user action

In web applications, we often need to pause the execution of a particular [_Query_](/api/primitives/query) until the user performs some action. For example, we want to pause the execution of the [_Query_](/api/primitives/query) that fetches the user's data until the user accepts the terms of use and privacy policy. In this case study we will discuss how to implement this task with the help of `@farfetched/core` package.

<!--@include: ../shared/case.md-->

## Kick-off

Let us say we have a website which requires the user to accept the terms of use before the user can use it. We have a bunch of [_Queries_](/api/primitives/query) and [_Mutations_](/api/primitives/mutation), and we want to prevent their execution until the user accepts the terms of use. By legal requirements, we need to show the terms of use to the user and ask the user to accept them and must not allow any network requests until the user accepts it.

Accepting the terms of use is a user action that can be represented as an [_Event_](https://effector.dev/docs/api/effector/event) for this recipe.

```ts
// terms_of_use.model.ts
import { createEvent } from 'effector';

export const termsOfUseShowed = createEvent();
export const userAcceptedTermsOfUse = createEvent();
```

[_Event_](https://effector.dev/docs/api/effector/event) `userAcceptedTermsOfUse` should be bound to the button in the terms of use dialog and [_Event_](https://effector.dev/docs/api/effector/event) `termsOfUseShowed` to the lifecycle of the app. However, it is out of scope of this recipe.

## Implementation

Farfetched provides a [_Barrier_](/api/primitives/barrier) abstraction that allows us to implement this task in a declarative way. Its usage splits into two parts: barrier creation and barrier application. Let us start with the barrier creation since it is the most important part.

```ts
import { createBarrier } from '@farfetched/core';

const termsOfUseBarrier = createBarrier({
  // activate barrier when termsOfUseShowed
  activateOn: showTermsOfUse,
  // and deactivate it when userAcceptedTermsOfUse
  deactivateOn: userAcceptedTermsOfUse,
});
```

Next, we need to apply the barrier to the [_Query_](/api/primitives/query) or [_Mutation_](/api/primitives/mutation) that we want to pause.

```ts
import { applyBarrier } from '@farfetched/core';

applyBarrier([sensitiveQuery, sensitiveMutation], {
  barrier: termsOfUseBarrier,
});
```

Now it is guaranteed that the `sensitiveQuery` and `sensitiveMutation` will be suspended until the `termsOfUseBarrier` is deactivated. `termsOfUseBarrier` represents the state of the terms of use acceptance.

## Conclusion

Barrier API is very flexible and allows us to implement different tasks in a declarative way. In this case study, we have discussed how to implement the task of blocking particular [_Queries_](/api/primitives/query) and [_Mutations_](/api/primitives/mutation) until the user accepts the terms of use.

However, this is not the only task that can be implemented with the help of barriers. You can use them to implement anything that requires some actions to be performed before particular operation with suspension of this operation until the actions are finished.
