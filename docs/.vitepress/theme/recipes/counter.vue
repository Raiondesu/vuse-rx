<script lang="ts">
import { defineComponent, ref } from 'vue';
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
