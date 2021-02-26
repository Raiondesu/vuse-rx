<script lang="ts">
import { defineComponent, ref } from 'vue';
import { map, mapTo, switchMap } from 'rxjs/operators';
import { of, interval } from 'rxjs';
import { useRxState, syncRef } from 'vuse-rx';

const createStopwatch = useRxState(() => ({
  count: false,
  speed: 5,
  value: 0,
  maxValue: NaN,
  step: 1,
}));

const paused = state => !state.count || state.step === 0 || (
  state.step > 0 && state.value >= state.maxValue
);

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
            mapTo(state),
            map(increment()),
          )
    ),
  )
);

export default defineComponent({
  setup() {
    const { actions, state } = useStopwatch()
      .subscribe(state => console.log('state updated: ', state));

    return {
      ...actions,
      state,
      setToRef: ref(String(state.value)),
      maxRef: ref(String(state.maxValue)),
      stepRef: ref(String(state.step)),
      speedRef: syncRef(state, 'speed', String),

      setMaxValue: (maxRef: string) => actions.setMaxValue(maxRef === '' ? NaN : +maxRef),
    };
  },
});
</script>

<template>
  <div class="flex mt-2 justify evenly">
    <p v-for="(value, key) in state" :key="key">{{key}}: {{value}}</p>
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
      <button @click="setSpeed(+speedRef - 1)">-</button>
      <button @click="setSpeed(+speedRef + 1)">+</button>
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
</template>

<style scoped>
* {
  font-family: monospace;
}

.stopwatch {
  margin: 0 auto;
  width: 40%;
}

@media (max-width: 520px) {
  .stopwatch {
    width: 100%;
  }
}

input {
  width: 50px;
  flex-grow: 1;
}

div {
  display: flex;
  flex-wrap: nowrap;
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
.mt-2 :not(:first-child) {
  margin-left: 8px;
}

</style>
