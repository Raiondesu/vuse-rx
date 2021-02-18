<h1 align="center" style="text-align: center">
  <a href="https://vuse-rx.raiondesu.rocks"><img src="docs/public/logo-g.svg"/></a>
</h1>

<h3 align="center" style="text-align: center">A first-class RX integration for Vue 3</h3>
<p align="center" style="text-align: center">
  <a href="https://github.com/Raiondesu/vuse-rx/actions"><img src="https://img.shields.io/github/workflow/status/raiondesu/vuse-rx/CI?style=flat-square"/></a>
  <a href="https://npmjs.com/vuse-rx"><img src="https://img.shields.io/npm/v/vuse-rx?style=flat-square"/></a>
  <a href="https://npmjs.com/vuse-rx"><img src="https://img.shields.io/bundlephobia/minzip/vuse-rx?style=flat-square"/></a>
  <a href="https://npmjs.com/vuse-rx"><img src="https://img.shields.io/npm/dt/vuse-rx?style=flat-square"/></a>
  <a href="https://vuse-rx.raiondesu.rocks"><img src="https://img.shields.io/badge/docs-up-blue?style=flat-square"/></a>
</p>

## See the [docs](https://vuse-rx.raiondesu.rocks) for more information

## Install

`npm i -S vuse-rx`

## Use

A simple example of a counter state with an increment reducer:

```vue
<script lang="ts">
import { defineComponent } from 'vue';
import { useRxState } from 'vuse-rx';

export default defineComponent({
  setup() {
    const [
      handlers,
      state,
      state$ // state observable
    ] = useRxState({
      count: 0
    })({
      increment: () => state => ({ count: state.count + 1 })
    });

    // let's, for example, double the counter and output it to console
    state$
      .pipe(map(state => ({ count: state.count * 2 })))
      .subscribe(state => console.log('doubled counter: ', state.count));

    return {
      increment: handlers.increment,
      count
    };
  }
});
</script>

<template>
  <p>Counter: {{ state.count }}</p>
  <button @click="increment">increment</button>
</template>
```
