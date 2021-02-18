<h1 align="center" style="text-align: center">
  <img :src="$withBase('/logo-g.svg')" alt="vuse-rx"/>
</h1>

<h3 align="center" style="text-align: center">A first-class RX integration for Vue 3</h3>
<p align="center" style="text-align: center">
  <a href="https://github.com/Raiondesu/vuse-rx/actions"><img src="https://img.shields.io/github/workflow/status/raiondesu/vuse-rx/CI?style=flat-square"/></a>
  <a href="https://npmjs.com/vuse-rx"><img src="https://img.shields.io/npm/v/vuse-rx?style=flat-square"/></a>
  <a href="https://npmjs.com/vuse-rx"><img src="https://img.shields.io/bundlephobia/minzip/vuse-rx?style=flat-square"/></a>
  <a href="https://npmjs.com/vuse-rx"><img src="https://img.shields.io/npm/dt/vuse-rx?style=flat-square"/></a>
</p>

### Install

`npm i -S vuse-rx`

### Use

#### useRxState

```ts
import { reactive } from 'vue';
import { interval, merge, of } from 'rxjs';
import { filter, map, mapTo, switchMap } from 'rxjs/operators';

// Define base state type
interface State {
  count: boolean;
  speed: number;
  value: number;
  maxValue: number;
  step: number;
}

// Define logic rules as simple functions
const createState = () => reactive<State>({
  count: false,
  speed: 10,
  value: 0,
  maxValue: NaN,
  step: 1,
});

const validateSpeed = (speed: number) => speed >= 1 ? speed : 1;

const getNextValue = (state: State) => Math.min(state.value, state.maxValue) + (paused(state) ? 0 : state.step);

const paused = (state: State) => (state.step > 0 && state.value >= state.maxValue) || !state.count;

const calcDelay = (speed: number) => 1000 / speed;

const onInterval = (mapValue: (state: State) => Partial<State>) => (state: State) => (
  paused(state) ? of(state) : interval(calcDelay(state.speed)).pipe(
    mapTo(state),
    map(mapValue)
  )
);
//

// Define business rules as a Vue hook
import { useRxState } from 'vuse-rx';

export const useStopwatch = () => {
  const initialState = createState();

  // Note the double invocation here
  return useRxState(initialState)(
    // Implement basic state reducers
    {
      setStep: (step: number) => ({ step }),
      setValue: (value: number) => ({ value }),
      setSpeed: (speed: number) => ({ speed: validateSpeed(speed) }),

      // Can return observables
      setCountState: (play: boolean) => new BehaviorSubject({ count: play }),


      // Can reference the "older" state by returning a function that accepts the state
      setMaxValue: (max: number) => state => ({ maxValue: max, value: state.value > max ? max : state.value }),
    },

    // Implement common business logic
    (
      /* state observable: */ state$,
      /* reducers you just wrote above: */ reducers
    ) => merge(
      state$.pipe(switchMap(onInterval(_ => reducers.setValue(getNextValue(_))))),
      state$.pipe(filter(_ => !paused(_)))
    )
  );
};

// Use it!

const [
  // Reducers are now actions
  actions,

  // state is reactive
  // and can be used to display data in templates
  state,

  // fires each time an action is activated
  state$
] = useStopwatch();

state$.subscribe(newState => console.log('state updated:', newState));

actions.setValue(1);
// logs:
// state updated: {count: false, speed: 10, value: 1, maxValue: NaN, step: 1}

actions.setCountState(true);
// logs:
// state updated: {count: true, speed: 10, value: 1, maxValue: NaN, step: 1}

console.log('state:', state);
// logs:
// state: {count: true, speed: 10, value: 1, maxValue: NaN, step: 1}
```
