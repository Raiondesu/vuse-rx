
A simple example of a counter state with an increment reducer:

<ClientOnly>
  <CounterDemo/>
</ClientOnly>

The full source can be found [here](https://github.com/Raiondesu/vuse-rx/blob/main/docs/.vitepress/theme/recipes/counter.vue).

```vue {3,12-14,27}
<script lang="ts">
import { defineComponent } from 'vue';
import { useRxState } from 'vuse-rx';
import { map } from 'rxjs/operators';

export default defineComponent({
  setup() {
    const {
      actions: { increment },
      state,
      state$
    } = useRxState({ count: 0 })({
      increment: () => state => ({ count: state.count + 1 })
    });

    state$.subscribe(state => console.log('counter: ', state.count));

    return {
      increment,
      state
    };
  }
});
</script>

<template>
  <button @click="increment">increment {{ state.count }}</button>
</template>
```
