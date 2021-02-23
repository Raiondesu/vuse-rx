
A simple example of a counter state with an increment reducer:

<ClientOnly>
  <CounterDemo/>
</ClientOnly>

The full source can be found [here](https://github.com/Raiondesu/vuse-rx/blob/main/docs/.vitepress/theme/recipes/counter.vue).

```vue {2,12-15,17-20,29-31}
<script lang="ts">
import { useRxState, syncRef } from 'vuse-rx';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    const {
      actions: { increment },
      state,
      state$
    } = useRxState({ count: 0 })({
      // stateful reducer
      increment: () => state => ({
        count: state.count + 1
      }),

      // stateless reducer
      setCount: (count: string) => ({
        count: isNaN(count) ? 0 : count
      }),
    });

    state$.subscribe(state => console.log('counter: ', state.count));

    return {
      increment,
      state,

      // One-way data binding from reactive state (with type convertation)
      // Needed to have a separate "user-input" state for the counter
      countRef: syncRef(state, 'count', String),
    };
  }
});
</script>

<template>
  <button @click="increment">increment {{ state.count }}</button>
  <br>
  <input v-model="countRef"/>
  <button @click="setCount(countRef)">set count to {{ countRef }}</button>
</template>
```
