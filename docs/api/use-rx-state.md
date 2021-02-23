# useRxState
> Allows to bind reducers to a reactive state and an observable.

[Source](https://github.com/Raiondesu/vuse-rx/blob/main/src/use-rx.ts)

[[toc]]

## Description

Implements a [light flux pattern](/guide/state) using rxjs' Observables.

It accepts a base state, some reducers, and transforms them into a vue reactive state, actions to update the state and some observables to handle it:

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

## Type Signature and overloads

```ts
<S extends Record<string, any>>(initialState: S) => <R extends StateReducers<S>>(
  reducers: R,
  map$?: (
    state$: Observable<Readonly<S>>,
    reducers: R,
    state: Readonly<S>,
    actions$: Record<`on${Capitalize<Extract<keyof R, string>>}`, Observable<S>>
  ) => Observable<Partial<S>>
) => SubscribableRxRes<Reduceractions<R>, S>
```

This function is split into two parts:
1. State-capturing function - determines the shape and contents of the state and returns the second part:
2. Reducers-capturing function - sets the reducers

### **State**

```ts
<S extends Record<string, any>>(initialState: S) => Function
```

There's only one aspect to this function and only one purpose - to remember the initial state and infer its type.

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
) => SubscribableRxRes<Reduceractions<R>, S>
```

This function's primary goal is to bind reducers to the state.

The reducers are passed in as a first parameter in the following format:
```ts
{
  nameOfTheReducer: (...reducersParameters) => (oldState) => ({ newState })

  // State can be ignored if not needed:
  statelessReducer: (...reducersParameters) => ({ newState })

  // It's also possible to return an observable directly from the reducer,
  // this one creates an interval, for example:
  createInterval: (...reducersParameters) => interval(1000)
}
```

It's also possible to modify the resulting observable using the second parameter, `map$`.\
It accepts the resulting observable (fired on each action), a map of raw reducers (basically, the first parameter itself), the state, and a map of all observables that are fired on action calls.

For usage examples with both parameters see the `[stopwatch` recipe](/recipes/stopwatch).

## [Basic example](https://github.com/Raiondesu/vuse-rx/blob/main/docs/.vitepress/theme/recipes/counter.vue)

```js
const {
  actions: {
    increment
  },
  state,
  state$
} = useRxState({ count: 0 })({
  increment: () => state => ({ count: state.count + 1 })
});

// Subscription to the observable "activates" the resulting actions.
state$.subscribe(state => console.log('counter: ', state.count));
```

```html
<button @click="increment">increment {{ state.count }}</button>
```

<ClientOnly>
  <CounterDemo simple/>
</ClientOnly>
