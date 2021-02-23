# useRxState
> Allows to bind reducers to a reactive state and an observable.

[[toc]]

##

## Type Signature and overloads

## [Basic example](https://github.com/Raiondesu/vuse-rx/blob/main/docs/.vitepress/theme/recipies/counter.vue)

```js
const {
  handlers: {
    increment
  },
  state,
  state$
} = useRxState({ count: 0 })({
  increment: () => state => ({ count: state.count + 1 })
});

state$.subscribe(state => console.log('counter: ', state.count));
```

```html
<button @click="increment">increment {{ state.count }}</button>
```

<ClientOnly>
  <CounterDemo/>
</ClientOnly>
