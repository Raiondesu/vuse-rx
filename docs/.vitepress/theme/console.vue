<script lang="ts">
import { defineComponent, nextTick, onMounted, reactive, ref } from 'vue';

export default defineComponent({
  setup() {
    const lines = reactive<{ type: string, arg: object | string }[][]>([]);
    const refLines = ref<HTMLDivElement>();

    const log = console.log.bind(console);

    onMounted(() => {
      console.log = (...args: any[]): void => {
        lines.push(args.map(arg => ({
          type: typeof arg,
          arg: typeof arg === 'object' ? { ...arg } : String(arg)
        })));

        log(...args);

        nextTick(() => {
          refLines.value?.scrollTo({ top: refLines.value.scrollHeight + 100 });
        });
      };
    });

    return {
      lines,
      refLines,
      spanColors: {
        number: 'var(--vp-c-brand)',
        boolean: 'var(--vp-c-brand)',
        string: 'var(--vp-c-text)',
        object: 'var(--vp-c-text-1)',
        function: 'var(--vp-c-text-2)',
        undefined: 'var(--vp-c-text-2)'
      }
    };
  }
});
</script>

<template>
  <div class="console">
    <p class="title">Console:</p>
    <div class="lines" ref="refLines">
      <p class="line" v-for="line in lines">
        <span v-for="{ type, arg } in line">
          <span v-if="type === 'object'">
            {
              <span v-for="value, key, index in arg">
                <span v-if="index > 0">, </span>
                "{{ key }}": <span :style="{ color: spanColors[typeof value] }">{{ value }}</span>
              </span>
            }
          </span>
          <span v-else :style="{ color: spanColors[type] }">{{ arg + ' ' }}</span>
        </span>
      </p>
    </div>
  </div>
</template>

<style scoped>
  .console {
    display: block;
    margin-top: 16px;
    width: 100%;
    padding-left: 16px;
    border-left: 2px var(--vp-c-brand) solid;
  }

  .title {
    display: block;
    margin: 0;
  }

  .lines {
    height: 200px;
    overflow-y: scroll;
    font-family: monospace;
    box-shadow: 0 4px 9px -10px black inset;
  }

  .lines * {
    margin: 0;
  }

  @media (prefers-color-scheme: dark) {
    .lines {
      box-shadow: 0 4px 9px -10px var(--vp-c-bg) inset;
      background-color: var(--vp-code-inline-bg-color);
    }

    .lines * {
      color: var(--vp-c-text);
    }
  }
</style>
