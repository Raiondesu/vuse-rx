<script lang="ts">
import { defineComponent } from 'vue';
import { setToWindow } from '../../set-window';

import { useSharedState, CounterState, delayReduce } from './state';

export default defineComponent({
  setup() {
    const {
      actions,
      state,
    } = useSharedState({
      increment: () => (state: CounterState) => ({ count: state.count + 1 }),

      incrementAfter(timeout: number) {
        return delayReduce(this.increment(), timeout);
      },
    })
      .subscribe(state => console.log('counter1: ', state.count));

    return setToWindow({
      actions,
      state,
    });
  }
});
</script>

<template>
  <div class="flex justify mt-2">
    <button @click="actions.increment">increment to {{ state.count + 1 }}</button>
    <button @click="actions.incrementAfter(1000)">increment to {{ state.count + 1 }} after 1 sec</button>
  </div>
</template>
