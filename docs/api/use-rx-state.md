# useRxState
> Allows to bind reducers to a reactive state and an observable.

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

## Type Signature and overloads

```ts
function <S extends Record<string, any>>(
  initialState: S
) => <R extends StateReducers<S>>(
  reducers: R,
  map$?: (
    state$: Observable<Readonly<S>>,
    reducers: R,
    state: Readonly<S>,
    actions$: Record<`on${Capitalize<keyof R>}`, Observable<S>>
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

### **State**

```ts
<S extends Record<string, any>>(initialState: S) => Function
```

There's only one aspect to this function and only one purpose - to remember the initial state and infer (or set) its type.

It then returns the second function.

### **Reducers**

```ts
<R extends StateReducers<S>>(
  reducers: R,
  map$?: (
    state$: Observable<Readonly<S>>,
    reducers: R,
    state: Readonly<S>,
    actions$: Record<`on${Capitalize<Extract<keyof R, string>>}`, Observable<S>>
  ) => Observable<Partial<S>>
) => SubscribableRxRes<ReducerActions<R>, S>
```

There's a lot to unpack. Let's go one parameter at-a-time.

For a concrete usage examples with both parameters see the [`stopwatch` recipe](/recipes/stopwatch).

#### Parameter 1: `reducers`

This function's primary goal is to bind reducers to the state.

The reducers are passed in as a first parameter in [the following format](https://github.com/Raiondesu/vuse-rx/blob/main/src/use-rx.ts#L31).

Each **reducer** must **return** either **a part of the state** or **an observable** that emits a part of the state.

A reducer can be either state**ful** or state**less**:
- A state**ful** reducer uses a state object to compute the mutation:\
  For example, an add-reducer:
  ```ts
  // Reducer returns a function that accepts a state and returns the final mutation
  (addAmount) => (state) => ({ count: state.count + addAmount })
  ```

- A state**less** reducer only uses its initial parameters to compute the mutation:\
  For example, a replace-reducer:
  ```ts
  // Reducer returns the final mutation right away
  (newValue) => ({ count: newValue })
  ```

The resulting mutation is then automatically merged with the state itself.

#### Parameter 2: `map$`

It's also possible to modify the resulting observable using the second parameter, `map$`.\
It accepts the resulting observable (fired on each action), a map of raw reducers (basically, the first parameter itself), the state, and a map of all observables that are fired on action calls:

```ts
useRxState(state)(
  reducers,
  // add this parameter to any useRxState call to try
  (state$, reducers, state, actions$) => {
    console.log('This is logged only once');
    console.log('These are all reducers defined above, unchanged', reducers);
    console.log('This is an initial reactive state', state);
    console.log('This is a map of all actions to their secific observables', actions$);

    return state$.pipe(tap(state => console.log('this is logged on each action', state)));
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
  <button @click="increment">increment {{ state.count }}</button>
  <br>
  <input v-model="countRef"/>
  <button @click="setCount(countRef)">set count to {{ countRef }}</button>
</template>
```

<ClientOnly>
  <CounterDemo/>
</ClientOnly>
