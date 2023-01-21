# Shared Counter

An example of using useRxState to enforce separation of concerns between different components regarding how they can mutate the state.\
This example also highlights the difference between passing a plain object vs a factory as a first parameter to `useRxState`.

The full source can be found [here](https://github.com/Raiondesu/vuse-rx/blob/main/docs/.vitepress/theme/recipes/shared-counter).

Every variable in this example is exposed to `window`,
so feel free to open the console and play with it in the console!

## State

First, let's define a state for our counter app:

```ts
// state.ts
import { delay, of } from 'rxjs';
import { SimpleReducer, State, useRxState } from 'vuse-rx';

// This state will be shared between all its users
export const useSharedState = useRxState({ count: 0 });
export type CounterState = State<typeof useSharedState>;

// Shared delay logic
export const delayReduce = (reducer: SimpleReducer<CounterState>, timeout: number) => (
  (state: CounterState) => of(reducer(state)).pipe(delay(timeout))
);
```

Because we have defined our state as a plain object instead of a factory function,\
it will be shared across all modules that use `useSharedState` hook!

Then, using the [`State`](/api/use-rx-state#state) type,
we can infer the type of our state instead of writing it ourselves.

## Components

By splitting `useRxState` usage into two parts,
it's easy to allow different components and modules to share the same state
without necessarily sharing the logic associated with it.

This allows for easier separation of concerns,
as there's now never a need to pile unrelated code together,
like in this example:
counter increment logic lives in one component,
while counter set logic is in a completely different component!

While, of course, in this minimal example this might seem a bit unnecessary,
but this scales well for more complicated logic that involves long chains of operators on observables.

Separating reducers into a atomic functions that can be imported into different modules
is also extremely easy because it's just simple functions with simplest type signatures!

### Counter1.vue

First counter component will be responsible for incrementing `state.count`:

```vue {4,9,11-13,16,18,25-30}
<script lang="ts">
import { defineComponent } from 'vue';

import { useSharedState, delayReduce, CounterState } from './state';

export default defineComponent({
  setup() {
    const { actions, state, state$ } = useSharedState({
      increment: () => (state) => ({ count: state.count + 1 }),

      incrementAfter(timeout: number) {
        return delayReduce(this.increment(), timeout);
      },
    });

    state$.subscribe(state => console.log('counter1: ', state.count));

    return { actions, state };
  }
});
</script>

<template>
  <div>
    <button @click="actions.increment">
      increment to {{ state.count + 1 }}
    </button>
    <button @click="actions.incrementAfter(1000)">
      increment to {{ state.count + 1 }} after 1 sec
    </button>
  </div>
</template>
```

### Counter2.vue

Second counter component will be responsible for setting `state.count`
to a specific value from the `<input>` using [`syncRef`](/api/refs#syncref):

```vue {5,10-13,14-16,25-26,34-36}
<script lang="ts">
import { defineComponent, toRef } from 'vue';

import { syncRef } from 'vuse-rx';
import { useSharedState, delayReduce } from './state';

export default defineComponent({
  setup() {
    const { actions, state, state$ } = useSharedState({
      setCount: (count: string) => () => ({
        count: isNaN(Number(count)) ? 0 : +count
      }),

      setCountAfter(count: string, timeout: number) {
        return delayReduce(this.setCount(count), timeout);
      },
    });

    state$.subscribe(state => console.log('counter2: ', state.count));

    return {
      actions,
      state,

      // One-way data binding from reactive state (with type convertation)
      countRef: syncRef(toRef(state, 'count'), { to: String }),
    };
  }
});
</script>

<template>
  <div>
    <input v-model="countRef"/>
    <button @click="actions.setCount(countRef)">set count to {{ countRef }}</button>
    <button @click="actions.setCountAfter(countRef, 1000)">set count to {{ countRef }} after 1 sec</button>
  </div>
</template>
```

## App.vue

Finally, let's place all our components in an app to see how it all works together!

```vue {4-6,14-17}
<script lang="ts">
import { defineComponent } from 'vue';

import { useSharedState } from './state';
import Counter1 from './counter1.vue';
import Counter2 from './counter2.vue';

export default defineComponent({
  components: {
    Counter1,
    Counter2,
  },
  setup() {
    // It's perfectly ok to just use the hook without passing any reducers into it
    // That way, the `actions` will be empty
    const { state } = useSharedState({});

    return { state };
  }
});
</script>

<template>
  <main class="counter-app">
    <p>counter in app.vue: {{ state.count }}</p>

    <p>counter1.vue:</p>
    <counter1/>

    <p>counter2.vue:</p>
    <counter2/>
  </main>
  <console/>
</template>
```

Great! Now our app looks like this:

<ClientOnly>
  <SharedCounter/>
</ClientOnly>
