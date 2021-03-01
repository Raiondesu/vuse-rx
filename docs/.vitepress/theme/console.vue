<script lang="ts">
import { defineComponent, nextTick, onMounted, reactive, ref } from 'vue';

export default defineComponent({
  setup() {
    const lines = reactive<string[]>([]);
    const refLines = ref<HTMLDivElement>();

    const log = console.log.bind(console);

    onMounted(() => {
      console.log = (...args) => {
        lines.push(args.map(_ => typeof _ === 'object' ? JSON.stringify(_) : String(_)).join(' '));

        log(...args);

        nextTick(() => {
          refLines.value?.scrollTo({ top: refLines.value.scrollHeight + 100 });
        });
      };
    });

    return {
      lines,
      refLines,
    };
  }
});
</script>

<template>
  <div class="console">
    <p class="title">Console:</p>
    <div class="lines" ref="refLines">
      <p v-for="line in lines">{{ line }}</p>
    </div>
  </div>
</template>

<style scoped>
  .console {
    display: block;
    margin-top: 16px;
    width: 100%;
    padding-left: 16px;
    border-left: 2px var(--c-brand) solid;
  }

  .title {
    display: block;
    margin: 0;
  }

  .lines {
    height: 100px;
    overflow-y: scroll;
    font-family: monospace;
    box-shadow: 0 4px 9px -10px black inset;
  }

  .lines * {
    margin: 0;
  }
</style>
