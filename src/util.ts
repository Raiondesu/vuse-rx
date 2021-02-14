import { Observable } from 'rxjs';
import { getCurrentInstance, onUnmounted } from 'vue';

/**
 * Creates an observable that emits when a vue component is unmounted
 *
 * If executed outside the component scope - returns a NEVER observable
 *
 * @returns Observable\<void\> that emits on component unmount hook
 */
export const createOnDestroy$ = () => new Observable<void>(ctx => {
  if (getCurrentInstance()) {
    onUnmounted(() => {
      ctx.next();
    });
  }
});
