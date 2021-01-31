import { NEVER, Subject } from 'rxjs';
import { getCurrentInstance, onUnmounted } from 'vue';

/**
 * Creates an observable that emits when a vue component is unmounted
 *
 * If executed outside the component scope - returns a NEVER observable
 *
 * @returns Observable\<void\> that emits on component unmount hook
 */
export const createOnDestroy$ = () => {
  if (!getCurrentInstance()) {
    return NEVER;
  }

  const onDestroy$ = new Subject<void>();

  onUnmounted(() => {
    onDestroy$.next();
  });

  return onDestroy$.asObservable();
};
