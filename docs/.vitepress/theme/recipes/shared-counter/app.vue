<script lang="ts">
import { defineComponent } from 'vue';
import Console from '../../console.vue';
import { setToWindow } from '../../set-window';

import Counter1 from './counter1.vue';
import Counter2 from './counter2.vue';
import { delayReduce, useSharedState } from './state';

export default defineComponent({
  components: {
    Console,
    Counter1,
    Counter2,
  },
  setup() {
    return setToWindow({
      state: useSharedState({}).state,
      useSharedState,
      delayReduce
    });
  }
});
</script>

<template>
  <main class="counter-app">
    <p>counter in app.vue: {{ state.count }}</p>
    <p>counter1.vue:</p><counter1/>
    <p>counter2.vue:</p><counter2/>
  </main>
  <console/>
</template>

<style>

.flex {
  display: flex;
  flex-wrap: wrap;
  column-gap: 8px;
  row-gap: 8px;
}

.justify {
  align-items: center;
}

.mt-2 {
  margin-top: 8px;
}

</style>
