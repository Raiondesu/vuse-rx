<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useSubject } from 'vuse-rx';
import { map } from 'rxjs/operators';

export default defineComponent({
  setup() {
    const {
      handlers: {
        setState
      },
      state,
      state$
    } = useSubject<number>();

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
