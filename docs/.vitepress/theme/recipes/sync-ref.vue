<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { syncRef } from 'vuse-rx';
import { setToWindow } from '../set-window';

export default defineComponent({
  setup() {
    const count = ref(0);

    // two-way binding
    const countStr = syncRef(count, { to: String, from: Number });

    // one-way binding
    const countInputStr = syncRef(count, { to: String });

    return setToWindow({
      syncRef,
      count,
      countStr,
      countInputStr,
    });
  }
});
</script>

<template>
  <main class="sync-ref">
    <div class="count">
      <pre class="hug"><code>count</code></pre>
      <p class="hug">(original)</p>
      <button @click="count--">+</button> {{ count }} <button @click="count++">+</button>
    </div>
    <div class="count-str">
      <pre class="hug"><code>countStr</code></pre>
      <p class="hug">(two-way binding with count)</p>
      <input v-model="countStr">
    </div>
    <div class="count-input">
      <pre class="hug"><code>countInputStr</code></pre>
      <p class="hug">(one-way binding from count)</p>
      <input v-model="countInputStr">
    </div>
  </main>
</template>

<style scoped>
  .sync-ref {
    display: flex;
    justify-content: space-between;
  }

  .hug {
    margin: 0;
  }
</style>
