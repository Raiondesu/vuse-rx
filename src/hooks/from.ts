import { Observable } from 'rxjs';
import { getCurrentInstance } from 'vue';

export type VueHook = (hook: () => any, ...args: any[]) => any;

/**
 * Creates an observable that emits when a vue hook is executed
 *
 * If subscribed to outside the component scope - equivalent to a NEVER observable
 *
 * @param hook the vue hook to listen to
 *
 * for example: onUnmounted, onActivated, onUpdated, etc.
 *
 * ---
 */
export const fromHook = (hook: VueHook) => new Observable<void>(
  ctx => { getCurrentInstance() && hook(() => ctx.next()); }
);
