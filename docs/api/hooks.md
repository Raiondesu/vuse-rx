# Vue Lifecycle Hooks

> These are some utilities that ease interactions between Vue's lifecycle hooks and rxjs Observables

## `fromHook`

```ts
(hook: VueHook) => Observable<void>
```

Creates an observable from a Vue lifecycle hook, like `onUpdated` or `onMounted`:

```ts
import { onUnmounted } from 'vue';

// somewhere in code
const onUnmounted$ = fromHook(onUnmounted);

// in Vue component's setup function
{
  setup() {
    onUnmounted$.subscribe(() => {
      console.log('this will be logged when onUnmounted hook is fired');
    });
  }
}
```

Note that the hook is only connected to the component that subscribes to the resulting observable:

```ts
// outside of component setup function
onUnmounted$.subscribe(() => {
  console.log('this will never be logged');
});

const component1 = {
  setup() {
    onUnmounted$.subscribe(() => {
      console.log('this will be logged only when component1 is unmounted');
    });
  }
};

const component2 = {
  setup() {
    onUnmounted$.subscribe(() => {
      console.log('this will be logged only when component2 is unmounted');
    });
  }
}
```

---

## `useSubscription`

```ts
(subscription: Unsubscribable) => void
```

Allows to not worry about an observable not being resolved after a component unloads.\
For this, just pass an RxJS [`Subscription`](https://rxjs.dev/guide/subscription) to this hook.

If it's awkward to pass a subscription, consider using [`untilUnmounted`](operators#untilunmounted) operator.
