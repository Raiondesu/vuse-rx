
A simple example of a counter state with an increment reducer:

<ClientOnly>
  <CounterDemo/>
</ClientOnly>


```vue {3,8-10,26,27}
<script lang="ts">
import { defineComponent } from 'vue';
import { useRxState } from 'vuse-rx';
import { map } from 'rxjs/operators';

export default defineComponent({
  setup() {
    const [{ increment }, state, state$] = useRxState({ count: 0 })({
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
  <p>Counter: {{ state.count }}</p>
  <button @click="increment">increment</button>
</template>
```
