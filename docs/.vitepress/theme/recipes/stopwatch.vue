<script lang="ts">
import { defineComponent, ref, toRef } from 'vue';
import { map, takeWhile, switchMap } from 'rxjs/operators';
import { of, interval } from 'rxjs';
import { useRxState, syncRef } from 'vuse-rx';
import { setToWindow } from '../set-window';
import Console from '../console.vue';

const createStopwatch = useRxState(() => ({
  count: false,
  speed: 5,
  value: 0,
  maxValue: NaN,
  step: 1,
}));

const valueIsBelowMax = state => isNaN(state.maxValue) || (
  state.value < state.maxValue
);

const paused = state => !state.count || state.step === 0 || !valueIsBelowMax(state);

const clampValue = (maxValue: number, value: number) => ({
  maxValue,
  value: value > maxValue ? maxValue : value
});

const useStopwatch = () => createStopwatch(
  {
    setCountState: play => ({ count: play }),
    setStep: step => ({ step }),
    setSpeed: speed => ({ speed: Math.max(1, speed) }),

    increment: () => state => clampValue(state.maxValue, state.value + state.step),
    setValue: value => state => clampValue(state.maxValue, value),
    setMaxValue: max => state => clampValue(max, state.value),
  },
  (state$, { increment }) => state$.pipe(
    switchMap(state =>
      paused(state)
        ? of(state)
        : interval(1000 / state.speed).pipe(
            map(() => state),
            map(increment()),
            takeWhile(valueIsBelowMax, true),
          )
    ),
  )
);

export default defineComponent({
  components: { Console },
  setup() {
    const { actions, state } = useStopwatch()
      .subscribe(state => console.log('state updated: ', state));

    return setToWindow({
      createStopwatch,
      useStopwatch,
      clampValue,
      paused,
      syncRef,
      useRxState,
      ...actions,
      state,
      setToRef: ref(String(state.value)),
      maxRef: ref(String(state.maxValue)),
      stepRef: ref(String(state.step)),
      speedRef: syncRef(toRef(state, 'speed'), { to: String }),

      setMaxValue: (maxRef: string) => actions.setMaxValue(maxRef === '' ? NaN : +maxRef),
    });
  },
});
</script>

<template>
  <div class="flex mt-2 justify evenly values">
    <p v-for="(value, key) in state" :key="key">{{key}}: <span style="color:var(--vp-c-brand)">{{value}}</span></p>
  </div>
  <main class="stopwatch">
    <div class="flex grow justify center mt-2">
      <button @click="setCountState(!state.count)">{{ state.count ? 'Pause' : 'Start' }}</button>
      <button @click="setValue(0)">Reset</button>
    </div>
    <div class="flex grow justify center mt-2">
      <button @click="setStep(-state.step)">Count {{ state.step > 0 ? 'down' : 'up' }}</button>
    </div>
    <div class="flex justify center mt-2">
      <input v-model="setToRef"/>
      <button @click="setValue(+setToRef)">Set value</button>
    </div>
    <div class="flex justify center mt-2">
      <input v-model="speedRef" @blur.capture="setSpeed(+speedRef)"/>
      <button @click="setSpeed(+speedRef - 1)">Speed -</button>
      <button @click="setSpeed(+speedRef + 1)">Speed +</button>
    </div>
    <div class="flex justify center mt-2">
      <input v-model="stepRef"/>
      <button @click="setStep(+stepRef)">Set step</button>
    </div>
    <div class="flex justify center mt-2">
      <input v-model="maxRef"
        @keyup.enter="setMaxValue(maxRef)"
        @focus.capture="isNaN(maxRef) && (maxRef = '')"
        @blur.capture="maxRef = maxRef === '' || isNaN(maxRef) ? 'NaN' : maxRef"
      />
      <button @click="setMaxValue(maxRef)">Set maximum</button>
    </div>
  </main>
  <console/>
</template>

<style scoped>
* {
  font-family: monospace;
}

.stopwatch {
  margin: 0 auto;
  width: 40%;
}

@media (max-width: 1000px) {
  .stopwatch {
    width: 60%;
  }
}

@media (max-width: 520px) {
  .stopwatch {
    width: 100%;
  }

  .values {
    font-size: smaller;
  }
}

input {
  width: 50px;
  flex-grow: 1;
}

.flex {
  display: flex;
  flex-wrap: nowrap;
  column-gap: 8px;
}

.justify {
  align-items: center;
}
.grow * {
  flex-grow: 1;
}
.center {
  justify-content: center;
}
.evenly {
  justify-content: space-between;
}

.mt-2 {
  margin-top: 8px;
}

</style>
