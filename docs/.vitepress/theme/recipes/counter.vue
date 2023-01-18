<script lang="ts">
import { defineComponent, toRef } from 'vue';
import { useRxState, syncRef } from 'vuse-rx';
import { setToWindow } from '../set-window';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import Console from '../console.vue';

export default defineComponent({
  components: { Console },
  props: {
    simple: Boolean,
  },
  setup(props) {
    const {
      actions,
      state,
      state$
    } = useRxState({ count: 0 })({
      increment: () => state => ({ count: state.count + 1 }),

      setCount: (count: string) => ({
        count: isNaN(Number(count)) ? 0 : +count
      }),

      setCountAfter(count: string, timeout: number) {
        return of(this.setCount(count)).pipe(delay(timeout));
      },

      incrementAfter(timeout: number) {
        return state => this.setCountAfter(String(this.increment()(state).count), timeout);
      },
    });

    state$.subscribe(state => console.log('counter: ', state.count));

    return setToWindow({
      syncRef,
      useRxState,
      actions,
      state,

      // One-way data binding from reactive state (with type convertation)
      countRef: syncRef(toRef(state, 'count'), { to: String }),
    });
  }
});
</script>

<template>
  <main>
    <div class="flex justify mt-2">
      <button @click="actions.increment">increment to {{ state.count + 1 }}</button>
      <button v-if="!simple" @click="actions.incrementAfter(1000)">increment to {{ state.count + 1 }} after 1 sec</button>
    </div>
    <div class="flex justify mt-2">
      <input v-model="countRef"/>
      <button @click="actions.setCount(countRef)">set count to {{ countRef }}</button>
      <button v-if="!simple" @click="actions.setCountAfter(countRef, 1000)">set count to {{ countRef }} after 1 sec</button>
    </div>
  </main>
  <console/>
</template>

<style>

.flex {
  display: flex;
  flex-wrap: nowrap;
}

.justify {
  align-items: center;
}

.evenly {
  justify-content: space-between;
}

.mt-2 {
  margin-top: 8px;
}
.mt-2 :not(:first-child) {
  margin-left: 8px;
}

</style>
