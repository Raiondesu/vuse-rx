<script lang="ts">
import { defineComponent, toRef } from 'vue';
import { useRxState, syncRef } from 'vuse-rx';
import { setToWindow } from '../set-window';
import Console from '../console.vue';

export default defineComponent({
  components: { Console },
  props: {
    simple: Boolean,
  },
  setup(props) {
    const {
      actions: { increment, setCount },
      state,
      state$
    } = useRxState({ count: 0 })({
      increment: () => state => ({ count: state.count + 1 }),
      setCount: (count: string) => ({ count: isNaN(Number(count)) ? 0 : Number(count) }),
    });

    state$.subscribe(state => console.log('counter: ', state.count));

    return setToWindow({
      syncRef,
      useRxState,
      increment,
      setCount,
      state,

      // One-way data binding from reactive state (with type convertation)
      countRef: syncRef(toRef(state, 'count'), { to: String }),
    });
  }
});
</script>

<template>
  <main>
    <button @click="increment">increment {{ state.count }}</button>
    <br>
    <input v-if="!simple" v-model="countRef"/>
    <button v-if="!simple" @click="setCount(countRef)">set count to {{ countRef }}</button>
  </main>
  <console/>
</template>
