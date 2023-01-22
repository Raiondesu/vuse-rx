# State Management

Tools for creating and managing a flux-like state with full RxJS compatibility.

[[toc]]

## `useRxState`

Allows to bind reducers to a reactive state and observables.

[Source](https://github.com/Raiondesu/vuse-rx/blob/main/src/use-rx/use-rx-state.ts)

### Description

It implements a light flux pattern using rxjs' [Observables](https://rxjs.dev/guide/observable).

Even though state management is not the primary concern of `vuse-rx`,
it still allows for a basic flux-like state management with observables using `useRxState`.

This function returns 3 key parts:
- Reactive **state**
- State **reducers**
- RXjs **observable**

All of them work in unison to always keep vue components in sync with the application business logic.

![diagram](/vuse.svg)

The big difference from other flux-like solutions is that
`useRxState` doesn't care whether it's a singleton that manages the state of the whole application
or just used locally in a component. Therefore, it's much more flexible for small- to mid- scale applications.

It accepts, at minimum, an initial state and some reducers,
and returns a reactive state, actions, and some observables to make things easier to control.

::: details What's a reducer?
*Reducer* is a pure function that returns a *Mutation* - a part of a new state
that needs to be mixed into the original state in order for the state to change.
:::

```ts
const state = { count: 0 };
const reducers = {
  increment: () => state => ({ count: state.count + 1 })
};

// Now using const destructuring:
const {
  // actions that mutate the state via reducers
  actions,

  // vue reactive state
  state,

  // state observable
  state$,

  // observables that are triggered on specific actions
  actions$
} = useRxState(state)(reducers).subscribe();
```

::: tip
`useRxState` automatically makes the state reactive for Vue, so you don't need to worry about applying `reactive` to it.
:::

### [Basic example](https://github.com/Raiondesu/vuse-rx/blob/main/docs/.vitepress/theme/recipes/counter.vue)

<ClientOnly>
  <CounterDemo simple/>
</ClientOnly>

::: code-group
```ts [counter.ts]
import { useRxState, syncRef } from 'vuse-rx';

export const counter = useRxState({ count: 0 })({
  // stateful reducer
  increment: () => state => ({
    // automatic type inference for the state
    count: state.count + 1
  }),

  // stateless reducer
  setCount: (count: string) => ({
    // custom business logic
    count: isNaN(Number(count)) ? 0 : Number(count)
  }),
});
```
```vue [example.vue]
<script setup lang="ts">
import { counter } from './counter.ts';

const {
  actions: { increment, setCount },
  state,
  state$ // state observable
} = counter;

// "Activating" the actions
state$.subscribe(state => console.log('counter: ', state.count));

// One-way data binding from reactive state (with type convertation)
const countRef = syncRef(state, 'count', String);
</script>
<template>
  <button @click="increment">increment to {{ state.count + 1 }}</button>
  <br>
  <input v-model="countRef"/>
  <button @click="setCount(countRef)">set count to {{ countRef }}</button>
</template>
```
```vue [example.vue (inline subscribe)]
<script setup lang="ts">
import { counter } from './counter.ts';

const {
  actions: { increment, setCount },
  state
} = counter.subscribe(state => console.log('counter: ', state.count));

// One-way data binding from reactive state (with type convertation)
const countRef = syncRef(state, 'count', String);
</script>
<template>
  <button @click="increment">increment to {{ state.count + 1 }}</button>
  <br>
  <input v-model="countRef"/>
  <button @click="setCount(countRef)">set count to {{ countRef }}</button>
</template>
```
:::

::: tip
Every variable in this example is exposed to `window`,
so feel free to open the console and play with it in the console!
:::


### Detaled Description

::: details `useRxState` Type Signature
```ts
function <S extends Record<string, any>, Mutation>(
  initialState: S | (() => S),
  options?: RxStateOptions
) => <R extends StateReducers<S>>(
  reducers: R,
  map$?: (
    state$: Observable<Readonly<S>>,
    reducers: R,
    state: Readonly<S>,
    actions$: Record<`${keyof R}$`, Observable<S>>,
    context: MutationContext
  ) => Observable<Mutation>
) => {
  actions: ReducerActions<R>;
  state: S;
  state$: Observable<S>;
  actions$: ReducerObservables<ReducerActions<R>, S>;
  subscribe: (next?) => {
    actions: ReducerActions<R>;
    state: S;
    state$: Observable<S>;
    actions$: ReducerObservables<ReducerActions<R>, S>;
    subscription: { unsubscribe(): void };
  };
}
```
:::

`useRxState` is split into two parts:
1. State-capturing function - determines the shape and contents of the state and returns the second part:
2. Reducers-capturing function - binds the reducers to the state and creates an observable for it.

::: details Why?
This is done in order to enable [full type inference in reducers](https://github.com/microsoft/TypeScript/issues/14400#issuecomment-507638537),
as well as to allow different reducers to share the same state without bundling them all in one place in contrast to other flux-like solutions.
For an example of this, see the [shared counter state](/recipes/shared-counter) recipe.
:::

#### 1. **State**-capturing function

::: details Type Signature
```ts
function <S extends Record<string, any>, Mutation = deepReplaceArrayMutation>(
  initialState: S | (() => S),
  options?: RxStateOptions<S, Mutation>
): Function
```
:::

Accepts either a state object or a state factory function and an optional options object.\
It remembers the state, applies the options, and then returns the second function.

::: tip
This allows to split away the code that operates on the state from the state itself.\
For an example of this, see the [shared counter state](/recipes/shared-counter) recipe.
:::

#### 2. **Reducers**-capturing function

::: details Type Signature
```ts
function <R extends StateReducers<S>>(
  reducers: R,
  map$?: (
    state$: Observable<Readonly<S>>,
    reducers: R,
    state: Readonly<S>,
    actions$: Record<`${keyof R}$`, Observable<S>>,
    context: MutationContext
  ) => Observable<Mutation>
) => SubscribableRxRes<ReducerActions<R>, S>
```
:::

This function is used to bind reducers to the state and produce an observable that reacts to the changes that reducers make on the state.

There's a lot to unpack. Let's go one parameter at-a-time.

::: tip
For a detailed usage example with both parameters see the [stopwatch recipe](/recipes/stopwatch).
:::

##### Parameter 1: `reducers`

This function's primary goal is to bind reducers to the state.

The reducers are passed in as a first parameter.
Each **reducer** must **return** either **a part of the state** or **an observable** that emits a part of the state.

A reducer can be either state**ful** or state**less**:
- A state**ful** reducer uses a state object to compute the mutation:\
  For example, an add-reducer:
  ```ts
  // Reducer returns a function that accepts a state and a mutation context
  // and returns the final mutation
  (addAmount) => (state, mutation) => ({ count: state.count + addAmount })
  ```

- A state**less** reducer only uses its initial parameters to compute the mutation:\
  For example, a replace-reducer:
  ```ts
  // Reducer returns the final mutation right away
  (newValue) => ({ count: newValue })
  ```

The resulting mutation is then automatically merged with the current state.

Let's see a complete example:
```ts
const { actions, state } = useRxState({ count: 0 })({
  // stateful // [!code focus]
  add: (addAmount) => (state) => ({ count: state.count + addAmount }), // [!code focus]

  // stateless // [!code focus]
  set: (newValue) => ({ count: newValue }), // [!code focus]
}).subscribe();

actions.add(9);
```

It's also possible to inform observables about errors or make them complete
from within the reducers. The `mutation` context parameter is used for this.

::: warning
`mutation` is nullable, so it is recommended to use the
[optional chaining (`?.`) operator](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
when accessing it.
:::

Let's rewrite our `add` reducer with this in mind:
```ts
const maximumValue = 10; // [!code ++]

const { actions, state } = useRxState({ count: 0 })({
  // stateful // [!code --]
  add: (addAmount) => (state) => ({ count: state.count + addAmount }), // [!code --]
  add: (addAmount) => (state, mutation) => { // [!code ++]
    if (addAmount < 0) { // [!code ++]
      // Raise a mutation error // [!code ++]
      mutation?.error('add amount cannot be negative!'); // [!code ++]
 // [!code ++]
      // Signify that no changes need to be made // [!code ++]
      return {}; // [!code ++]
    } // [!code ++]
 // [!code ++]
    const newValue = state.count + addAmount; // [!code ++]
 // [!code ++]
    if (newValue >= maximumValue) { // [!code ++]
      // This mutation will never be called again // [!code ++]
      mutation?.complete(); // [!code ++]
    } // [!code ++]
 // [!code ++]
    return { count: newValue }; // [!code ++]
  }, // [!code ++]

  // stateless
  set: (newValue) => ({ count: newValue }),
}).subscribe(); // [!code --]
}).subscribe({ // [!code ++]
  error: errorText => { // [!code ++]
    console.error('Oh no, an error:', errorText); // [!code ++]
  }, // [!code ++]
  complete: () => { // [!code ++]
    console.log('Counter stopped at ', state.count); // [!code ++]
  } // [!code ++]
}); // [!code ++]

actions.add(9);
 // [!code ++]
// 50% // [!code ++]
if (Math.random() > 0.5) { // [!code ++]
  actions.add(-1); // [!code ++]
  //> Oh no, an error: add amount cannot be negative! // [!code ++]
} else { // [!code ++]
  actions.add(1); // [!code ++]
  //> Counter stopped at 10 // [!code ++]
} // [!code ++]
```

##### Parameter 2: `map$`

It's also possible to modify the resulting observable using the second parameter, `map$`.\
It accepts a function with the following parameters:
- `state$` - the resulting observable (fired on each action)
- `reducers` - a map of raw reducers (basically, the first parameter itself)
- `state` - current reactive state
- `actions$` - a map of all observables that are fired on action calls
- `context` - a current mutation context, same as the one in the reducers,\
  can be passed into the reducers to allow them to control the mutation too
and expects a state observable to be returned from it.

```ts
useRxState(state)(
  reducers,
  // add this parameter to any useRxState call to try
  (state$, reducers, state, actions$, context) => {
    console.log('This is logged only once');
    console.log('These are all reducers defined above, unchanged:', reducers);
    console.log('This is an initial reactive state:', state);
    console.log('This is a map of all actions to their secific observables:', actions$);
    console.log('This context can be used to create an error or to complete the observable:', context);

    // By the way, state$ is just merged actions$,
    // so this
    return state$.pipe(tap(state => console.log('this is logged on each action', state)));
    // and this
    return merge(...Object.values(actions$)).pipe(tap(state => console.log('this is logged on each action', state)));
    // are identical
  }
)
```

##### Returned value

The function then returns the following object:
- `state` - a plain Vue reactive state, but immutable.
- `actions` - transformed reducers, they accept the defined parameters, but mutate the state, instead of just returning its parts.
- `state$` - an observable that emits a new state each time there's an update.
- `actions$` - a map of individual observables per each action, useful for tracking individual action calls.
- `subscribe` - a shorthand for calling `subscribe` on the `state$`, returns the same object with rxjs [`Subscription`](https://rxjs.dev/guide/subscription) mixed-in.

### Options and fine-tuning

`useRxState` allows to change some of its behaviour via the optional `options` parameter in the first function.

Via options you can change how new mutations are applied to the state:

```ts
import {
  useRxState,
  // this is the default mutation merge strategy
  deepReplaceArray,
  // fast checker of whether we can mutate the state deeper
  canMergeDeep
} from 'vuse-rx';

useRxState(initialState, {
  mutationStrategy: (
    state, // A full base state to mutate
    mutate // Current mutation strategy (this exact function)
  ) => (
    mutation // Mutation to apply
  ) => {
    // Let's say we also need to apply our mutations to symbols:
    for (const key of Object.getOwnPropertySymbols(mutation)) {
      // Check if we can go deeper
      state[key] = canMergeDeep(state, mutation, key)
        // If yes - mutate the state further using our function
        ? mutate(state[key])(mutation[key])
        // if no - just assign the value of our mutation
        : mutation[key];
    }

    // Apply the default strategy once we're done
    return deepReplaceArray(state)(mutation);
    // or...

    // if we need to restrict our mutations to symbols only
    // we can just return the state
    // without applying the default strategy
    return state;
  }
});
```

There are 3 mutation strategies provided out-of the box:
- `shallow` - surface-level merge, equivalent to an object spread\
  (`state = { ...state, ...mutation }`)
- `deep` - recursively merges mutations with the state
- `deepReplaceArray` - **DEFAULT** - same as `deep`, but does a simple shallow replacement for arrays

Each mutation strategy sets its own mutation type, so a mutation for the `deep` strategy may be different from a mutation for the `shallow` strategy.

::: tip
Mutation type is not restricted to a product of the initial state or an object even!\
You can even pass a string if you want to:

```ts
useRxState({ count: 0 }, {
  // This is not advised, of course, but for the sake of example...
  mutationStrategy: state => (mutation: 'increment' | 'decrement') => ({ // [!code focus]
    count: mutation === 'increment' ? state.count + 1 : state.count - 1 // [!code focus]
  }), // [!code focus]
})({
  increment: () => 'increment', // [!code focus]
  decrement: () => 'decrement', // [!code focus]
});
```
:::

## `State`

Allows to declaratively define the state type from the result of the first call of `useRxState`:

::: code-group
```ts [state.ts]
import { useRxState, State } from 'vuse-rx';

export const counterState = useRxState({ count: 0 });
export type CounterState = State<typeof counterState>;
// CounterState = { count: number }
```
:::
