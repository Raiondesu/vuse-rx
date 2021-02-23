<h1 align="center" style="text-align: center">
  <a href="https://vuse-rx.raiondesu.rocks"><img src="docs/public/logo-g.svg"/></a>
</h1>

<h3 align="center" style="text-align: center">Complete first-class rxjs support for Vue 3</h3>
<p align="center" style="text-align: center">
  <a href="https://github.com/Raiondesu/vuse-rx/actions"><img src="https://img.shields.io/github/workflow/status/raiondesu/vuse-rx/CI?style=flat-square"/></a>
  <a href="https://npmjs.com/vuse-rx"><img src="https://img.shields.io/npm/v/vuse-rx?style=flat-square"/></a>
  <a href="https://npmjs.com/vuse-rx"><img src="https://img.shields.io/bundlephobia/minzip/vuse-rx?style=flat-square"/></a>
  <a href="https://npmjs.com/vuse-rx"><img src="https://img.shields.io/npm/dt/vuse-rx?style=flat-square"/></a>
  <a href="https://vuse-rx.raiondesu.rocks"><img src="https://img.shields.io/badge/docs-up-blue?style=flat-square"/></a>
</p>

## What is this?

Ever felt like combining flux architecture with rxjs? Or maybe in need of creating observables from Vue `ref`s or other Vue features?\
Well, this library is exaclty for those types of cases.

### See the [docs](https://vuse-rx.raiondesu.rocks) for more information

## Install

`npm i -S vuse-rx`

`yard add vuse-rx`

## Use

A simple example of a counter state with an increment reducer:

```vue
<script lang="ts">
import { useRxState, syncRef } from 'vuse-rx';
import { defineComponent } from 'vue';
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
    }, state$ => state$.pipe(tap(state => console.log('state is updated', state))));

    // "Activating" the actions
    state$.subscribe(state => console.log('counter: ', state.count));

    return {
      increment,
      setCount,
      state,

      // One-way data binding from reactive state (with type convertation)
      countRef: syncRef(state, 'count', String),
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
