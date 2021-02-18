# Getting Started

## Install

### NPM / YARN
`npm i vuse-rx`

`yarn add vuse-rx`

### Native browser

```html
<script type="module" src="https://unpkg.com/vuse-rx"></script>

<!-- or a complete package with polyfills and etc. -->
<script type="module" src="https://unpkg.com/vuse-rx/dist/umd.js"></script>
```

## Use

A simple example of a counter state with an increment reducer:

<ClientOnly>
  <CounterDemo/>
</ClientOnly>


```vue
<script lang="ts">
import { defineComponent } from 'vue';
import { useRxState } from 'vuse-rx';
import { map } from 'rxjs/operators';

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
