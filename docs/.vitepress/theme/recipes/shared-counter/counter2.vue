<script lang="ts">
import { defineComponent, toRef, getCurrentInstance } from 'vue';
import { setToWindow } from '../../set-window';

import { syncRef } from 'vuse-rx';
import { delayReduce, useSharedState } from './state';

export default defineComponent({
  setup() {
    const {
      actions: counter2Actions,
      state: counter2State,
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
      counter2Actions,
      counter2State,

      // One-way data binding from reactive state (with type convertation)
      countRef: syncRef(toRef(counter2State, 'count'), { to: String }),
    }, getCurrentInstance()!.parent);
  }
});
</script>

<template>
  <div class="flex justify mt-2">
    <input v-model="countRef"/>
    <button @click="counter2Actions.setCount(countRef)">set count to {{ countRef }}</button>
    <button @click="counter2Actions.setCountAfter(countRef, 1000)">set count to {{ countRef }} after 1 sec</button>
  </div>
</template>
