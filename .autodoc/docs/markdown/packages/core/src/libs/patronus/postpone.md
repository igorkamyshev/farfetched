[View code on GitHub](https://github.com/igorkamyshev/farfetched/packages/core/src/libs/patronus/postpone.ts)

The code provided is a function called `postpone` that is part of the larger `farfetched` project. The purpose of this function is to delay the execution of an event until a specified store is in the `true` state.

The function takes an object as its parameter with two properties: `clock` and `until`. `clock` is an event that triggers the execution of the postponed event, and `until` is a store that determines when the postponed event should be executed.

The function first creates a new event called `target` using the `createEvent` function from the `effector` library. This event will be triggered after the `clock` event is called and the `until` store is in the `true` state.

Next, a store called `$fired` is created using the `createStore` function from the `effector` library. This store is initialized with a value of `false` and has a serialization option set to `'ignore'`. The store is then updated to `true` when the `target` event is triggered and set back to `false` when the `clock` event is triggered.

The `sample` function from the `effector` library is then called. This function takes several parameters: `clock`, `source`, `filter`, and `target`. The `clock` parameter is an array containing the `clock` event and the `until` store. The `source` parameter is the `clock` event itself. The `filter` parameter is a function that combines the `until` store and the negation of the `$fired` store using the `and` and `not` functions from the `./and` and `./not` modules respectively. This ensures that the `target` event is only triggered when the `until` store is `true` and the `$fired` store is `false`. Finally, the `target` parameter is the `target` event.

The function then returns the `target` event, which can be used to trigger the postponed event after the `clock` event is called and the `until` store is in the `true` state.

Here is an example of how this function can be used:

```javascript
import { createEvent, createStore } from 'effector';
import { postpone } from 'farfetched';

const clock = createEvent();
const until = createStore(false);

const postponedEvent = postpone({ clock, until });

postponedEvent.watch(() => {
  console.log('Postponed event executed');
});

clock(); // Does not trigger the postponed event

until.set(true); // Triggers the postponed event and logs 'Postponed event executed'
```

In this example, the `clock` event is created using the `createEvent` function from the `effector` library, and the `until` store is created using the `createStore` function. The `postpone` function is then called with the `clock` event and the `until` store as arguments, and the returned `target` event is stored in the `postponedEvent` variable.

A watcher is set up on the `postponedEvent` to log a message when it is executed. When the `clock` event is called, it does not trigger the postponed event because the `until` store is still `false`. However, when the `until` store is set to `true`, it triggers the postponed event and logs the message.
## Questions: 
 1. What is the purpose of the `postpone` function?
- The purpose of the `postpone` function is to delay the execution of an event until a specified store is in the `true` state.

2. What are the inputs to the `postpone` function?
- The inputs to the `postpone` function are an `Event` called `clock` and a `Store` of type `boolean` called `until`.

3. What does the `sample` function do in the `postpone` function?
- The `sample` function combines the `clock` event and the `until` store, filters the result using the `and` and `not` functions, and assigns the result to the `target` event.