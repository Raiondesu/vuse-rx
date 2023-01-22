<h1 align="center" style="text-align: center">
  <a href="https://vuse-rx.raiondesu.dev"><img src="docs/public/logo-g.svg"/></a>
</h1>

<h3 align="center" style="text-align: center">Complete first-class RxJS 7+ support for Vue 3</h3>
<p align="center" style="text-align: center">
  <a href="https://github.com/Raiondesu/vuse-rx/actions"><img src="https://img.shields.io/github/actions/workflow/status/raiondesu/vuse-rx/publish.yml?style=flat-square"/></a>
  <a href="https://npmjs.com/vuse-rx"><img src="https://img.shields.io/npm/v/vuse-rx?style=flat-square"/></a>
  <a href="https://bundlephobia.com/result?p=vuse-rx"><img src="https://img.shields.io/bundlephobia/minzip/vuse-rx?style=flat-square"/></a>
  <a href="https://npmjs.com/vuse-rx"><img src="https://img.shields.io/npm/dt/vuse-rx?style=flat-square"/></a>
  <a href="https://coveralls.io/github/Raiondesu/vuse-rx"><img src="https://img.shields.io/coveralls/github/Raiondesu/vuse-rx?style=flat-square"/></a>
  <a href="https://vuse-rx.raiondesu.dev"><img src="https://img.shields.io/badge/docs-stable-blue?style=flat-square"/></a>
  <a href="https://next.vuse-rx.raiondesu.dev"><img src="https://img.shields.io/badge/docs-beta-green?style=flat-square"/></a>
</p>

## What is this?

`vuse-rx` is a bridge between Vue 3 and RxJS:
it connects reactive states and refs with observables and subjects
in a way that enforces separation of concerns and drastically reduces the amount of boilerplate code.

The highlights are:
- [`useRxState`](https://vuse-rx.raiondesu.dev/api/use-rx-state) - flux-like state management with observables;
- [`syncRef`](https://vuse-rx.raiondesu.dev/api/refs#syncref) - synchronize two refs with either one-way or two-way binding;
- [`fromRef`](https://vuse-rx.raiondesu.dev/api/refs#fromref) - create an observable from any ref or watch source;
- [`refFrom`](https://vuse-rx.raiondesu.dev/api/refs#reffrom) - create a ref from a promise/observable/iterable/generator or anything else;

### See the [docs](https://vuse-rx.raiondesu.dev) for more information

## Install

`npm i -S vuse-rx`

`yard add vuse-rx`

## Use

Below is a simple example of a counter component with a state and two simple reducers.
See the docs for a [more detailed and interactive example](https://vuse-rx.raiondesu.dev/recipes/counter).

```vue
<script lang="ts">
import { useRxState, syncRef } from 'vuse-rx';
import { defineComponent, toRef } from 'vue';
import { tap } from 'rxjs/operators';

export default defineComponent({
  setup() {
    const {
      actions: {
        increment,
        setCount
      },
      state,
      state$ // state observable
    } = useRxState({ count: 0 })({
      // stateful reducer with mutation context
      increment: () => (state, mutation) => ({
        // automatic type inference for the state
        count: state.count + 1
      }),

      // stateless reducer
      setCount: (count: string) => ({
        // custom business logic
        count: isNaN(Number(count)) ? 0 : Number(count)
      }),
    }, state$ => state$.pipe(tap(state => console.log('state is updated', state))));

    // "Activating" the actions
    state$.subscribe(state => console.log('counter: ', state.count));

    return {
      increment,
      setCount,
      state,

      // One-way data binding from reactive state (with type convertation)
      countRef: syncRef(toRef(state, 'count'), { to: String }),
    };
  }
});
</script>

<template>
  <p>Counter: {{ state.count }}</p>
  <button @click="increment">increment</button>
  <input v-model="countRef" @keyup.enter="setCount(countRef)"/>
</template>
```

## Contributing

Pull requests and stars are always welcome. ❤\
For bugs and feature requests, [please create an issue](https://github.com/Raiondesu/vuse-rx/issues/new).
