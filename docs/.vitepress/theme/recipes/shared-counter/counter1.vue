<script lang="ts">
import { defineComponent, getCurrentInstance } from 'vue';
import { setToWindow } from '../../set-window';

import { useSharedState, CounterState, delayReduce } from './state';

export default defineComponent({
  setup() {
    const {
      actions: counter1Actions,
      state: counter1State,
    } = useSharedState({
      increment: () => (state: CounterState) => ({ count: state.count + 1 }),

      incrementAfter(timeout: number) {
        return delayReduce(this.increment(), timeout);
      },
    })
      .subscribe(state => console.log('counter1: ', state.count));

    return setToWindow({
      counter1Actions,
      counter1State,
    }, getCurrentInstance()!.parent);
  }
});
</script>

<template>
  <div class="flex justify mt-2">
    <button @click="counter1Actions.increment">increment to {{ counter1State.count + 1 }}</button>
    <button @click="counter1Actions.incrementAfter(1000)">increment to {{ counter1State.count + 1 }} after 1 sec</button>
  </div>
</template>
