<script lang="ts">
import { defineComponent, toRef } from 'vue';
import { setToWindow } from '../../set-window';

import { syncRef } from 'vuse-rx';
import { delayReduce, useSharedState } from './state';

export default defineComponent({
  setup() {
    const {
      actions,
      state,
      state$
    } = useSharedState({
      setCount: (count: string) => () => ({
        count: isNaN(Number(count)) ? 0 : +count
      }),

      setCountAfter(count: string, timeout: number) {
        return delayReduce(this.setCount(count), timeout);
      },
    });

    state$.subscribe(state => console.log('counter2: ', state.count));

    return setToWindow({
      actions,
      state,

      // One-way data binding from reactive state (with type convertation)
      countRef: syncRef(toRef(state, 'count'), { to: String }),
    });
  }
});
</script>

<template>
  <div class="flex justify mt-2">
    <input v-model="countRef"/>
    <button @click="actions.setCount(countRef)">set count to {{ countRef }}</button>
    <button @click="actions.setCountAfter(countRef, 1000)">set count to {{ countRef }} after 1 sec</button>
  </div>
</template>
