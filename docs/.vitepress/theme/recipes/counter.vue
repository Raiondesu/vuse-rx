<script lang="ts">
import { defineComponent } from 'vue';
import { useRxState, syncRef } from 'vuse-rx/src';

export default defineComponent({
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

    return {
      increment,
      setCount,
      state,

      // One-way data binding from reactive state (with type convertation)
      countRef: syncRef(state, 'count', String),
    };
  }
});
</script>

<template>
  <button @click="increment">increment {{ state.count }}</button>
  <br>
  <input v-if="!simple" v-model="countRef"/>
  <button v-if="!simple" @click="setCount(countRef)">set count to {{ countRef }}</button>
</template>
