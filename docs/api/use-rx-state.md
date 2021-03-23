# useRxState
> Allows to bind reducers to a reactive state and observables.

[Source](https://github.com/Raiondesu/vuse-rx/blob/main/src/use-rx.ts)

[[toc]]

## Description

Implements a light flux pattern using rxjs' Observables.

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

It accepts, at minimum, an initial state and some reducers:

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

And returns a reactive state, actions, and some observables to make things easier to control.

`useRxState` automatically makes the state reactive for Vue, so you don't need to worry about applying `reactive` to it.

### Options and fine-tuning

`useRxState` allows to change some of its behaviour via the optional `options` parameter in the first function.

Via options you can change how new mutations are applied to the state:

```ts
import {
  useRxState,
  // this is the default mutation merge strategy
  deepMergeKeys,
  // fast checker of whether we can mutate the state deeper
  canMergeDeep
} from 'vuse-rx';

useRxState(initialState, {
  mutationStrategy: (
    // A full base state to mutate
    state,
    // Current mutation strategy (this exact function)
    mutate
  ) => (
    // Mutation to apply
    mutation
  ) => {
    // Let's say, we also need to apply our mutations to symbols:
    for (const key of Object.getOwnPropertySymbols(mutation)) {
      // Check if we can go deeper
      state[key] = canMergeDeep(state, mutation, key)
        // If yes - mutate the state further using our function
        ? mutate(state[key])(mutation[key])
        // if no - just assign the value of our mutation
        : mutation[key];
    }

    // Apply the default strategy once we're done
    return deepMergeKeys(state)(mutation);
    // or...

    // if we need to restrict our mutations to symbols only
    // we can just return the state
    // without applying the default strategy
    return state;
  }
});
```

## Type Signature and overloads

```ts
function <S extends Record<string, any>>(
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
  ) => Observable<Partial<S>>
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

This function is split into two parts:
1. State-capturing function - determines the shape and contents of the state and returns the second part:
2. Reducers-capturing function - sets the reducers

### 1. **State**

```ts
function <S extends Record<string, any>>(
  initialState: S | (() => S),
  options?: RxStateOptions
): Function
```

Accepts either a state object or a state factory function and an optional options object.\
It remembers the state, applies the options, and then returns the second function.

### 2. **Reducers**

```ts
function <R extends StateReducers<S>>(
  reducers: R,
  map$?: (
    state$: Observable<Readonly<S>>,
    reducers: R,
    state: Readonly<S>,
    actions$: Record<`${keyof R}$`, Observable<S>>,
    context: MutationContext
  ) => Observable<Partial<S>>
) => SubscribableRxRes<ReducerActions<R>, S>
```

There's a lot to unpack. Let's go one parameter at-a-time.

For concrete usage examples with both parameters see the [`stopwatch` recipe](/recipes/stopwatch).

#### Parameter 1: `reducers`

This function's primary goal is to bind reducers to the state.

The reducers are passed in as a first parameter in [the following format](https://github.com/Raiondesu/vuse-rx/blob/main/src/use-rx.ts#L236).
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

The resulting mutation is then automatically merged with the state itself.

Let's see a complete example:
```ts
useRxState({ count: 0 })({
  // stateful
  add: (addAmount) => (state, mutation) => ({ count: state.count + addAmount }),

  // stateless
  set: (newValue) => ({ count: newValue }),
}).subscribe()
```

It's also possible to inform observables about errors or make them complete
from within the reducers. The `mutation` context parameter is used for this.\
`mutation` is optional, however, so it is recommended to use the
[optional chaining (`?.`) operator](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
when using it.

Let's rewrite our `add` reducer with this in mind:
```ts
const maximumValue = 10;

const { actions, state } = useRxState({ count: 0 })({
  add: (addAmount) => (state, mutation) => {
    if (addAmount < 0) {
      // Raise a mutation error
      mutation?.error('add amount cannot be negative!');

      // Signify that no changes need to be made
      return {};
    }

    const newValue = state.count + addAmount;

    if (newValue >= maximumValue) {
      // This mutation will never be called again
      mutation?.complete();
    }

    return { count: newValue };
  }
}).subscribe({
  error: errorText => {
    console.error('Oh no, an error:', errorText);
  },
  complete: () => {
    console.log('Counter stopped at ', state.count);
  }
});

actions.add(9);

// 50%
if (Math.random() > 0.5) {
  actions.add(-1);
  //> Oh no, an error: add amount cannot be negative!
} else {
  actions.add(1);
  //> Counter stopped at 10
}
```

#### Parameter 2: `map$`

It's also possible to modify the resulting observable using the second parameter, `map$`.\
It accepts:
- `state$` - the resulting observable (fired on each action)
- `reducers` - a map of raw reducers (basically, the first parameter itself)
- `state` - current reactive state
- `actions$` - a map of all observables that are fired on action calls
- `context` - a current mutation context, same as the one in the reducers,\
  can be passed into the reducers to allow them to control the mutation too

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

#### Returned value

The function then returns a pretty complex object, with the first three properties being the main ones:
- `state` - a plain Vue reactive state, mutable.
- `actions` - transformed reducers, they accept the defined parameters, but mutate the state, instead of just returning its parts.
- `state$` - an observable that emits a new state each time there's an update.
- `actions$` - a map of individual observables per each action, useful for tracking individual action calls.
- `subscribe` - a shorthand for calling `subscribe` on the `state$`, returns the same object with rxjs [`Subscription`](https://rxjs-dev.firebaseapp.com/guide/subscription) mixed-in.

## [Basic example](https://github.com/Raiondesu/vuse-rx/blob/main/docs/.vitepress/theme/recipes/counter.vue)

<ClientOnly>
  <CounterDemo simple/>
</ClientOnly>

```js
const {
  actions: {
    increment,
    setCount
  },
  state,
  state$ // state observable
} = useRxState({ count: 0 })({
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

// "Activating" the actions
state$.subscribe(state => console.log('counter: ', state.count));

// One-way data binding from reactive state (with type convertation)
const countRef = syncRef(state, 'count', String),
```

```vue
<template>
  <button @click="increment">increment to {{ state.count + 1 }}</button>
  <br>
  <input v-model="countRef"/>
  <button @click="setCount(countRef)">set count to {{ countRef }}</button>
</template>
```
