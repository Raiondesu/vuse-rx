# Counter

A simple example of a counter state with an increment reducer, using [`syncRef`](/api/refs#syncref) and [`useRxState`](/api/use-rx-state):

<ClientOnly>
  <CounterDemo/>
</ClientOnly>

The full source can be found [here](https://github.com/Raiondesu/vuse-rx/blob/main/docs/.vitepress/theme/recipes/counter.vue).

::: tip
Every variable is exposed to `window`, so feel free to open the console and play with it!
:::

::: code-group
```vue [counter.vue]
<script setup lang="ts">
import { defineComponent, toRef } from 'vue';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { useRxState, syncRef } from 'vuse-rx';

const {
  actions,
  state,
  state$
} = useRxState({ count: 0 })({
  // stateful reducer
  increment: () => state => ({
    count: state.count + 1
  }),

  // stateless reducer
  setCount: (count: string) => ({
    count: isNaN(count) ? 0 : +count
  }),

  // stateless reducer that uses other reducers
  // and returns an observable
  setCountAfter(count: string, timeout: number) {
    // with `this` you can access other already defined reducers
    return of(this.setCount(count)).pipe(delay(timeout));
  },

  // stateful reducer that uses other reducers
  // and returns an observable
  incrementAfter(timeout: number) {
    // with `this` you can access other already defined reducers
    return state => this.setCountAfter(String(this.increment()(state).count), timeout);
  },
});

state$.subscribe(state => console.log('counter: ', state.count));

// One-way data binding from reactive state (with type convertation)
// We need to have a separate "user-input" state for the counter that is still synced with the state
const countRef = syncRef(toRef(state, 'count'), { to: String });
</script>

<template>
  <button @click="actions.increment">increment to {{ state.count + 1 }}</button>
  <button @click="actions.incrementAfter(1000)">increment to {{ state.count + 1 }} after 1 sec</button>
  <br>
  <input v-model="countRef"/>
  <button @click="actions.setCount(countRef)">set count to {{ countRef }}</button>
  <button @click="actions.setCountAfter(countRef, 1000)">set count to {{ countRef }} after 1 sec</button>
</template>
```
:::
