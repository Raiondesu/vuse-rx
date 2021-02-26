import type { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { onUnmounted } from 'vue';
import { VueHook, fromHook } from './from';

/**
 * Creates an takeUntil that emits when a vue hook is executed
 *
 * If subscribed to outside the component scope - equivalent to a NEVER observable
 *
 * @param hook the vue hook to listen to
 *
 * for example: onUnmounted, onActivated, onUpdated, etc.
 *
 * ---
 */
export const pipeUntil = <T>(hook: VueHook) => takeUntil<T>(fromHook(hook));

/**
 * Stops an observable when a vue component is unmounted
 *
 * If the resulting observable is subscribed to outside the component scope - it is equivalent to a NEVER observable
 *
 * @param obs - obserable to stop on unmounted
 *
 * ---
 */
export const untilUnmounted = <T>(obs: Observable<T>) => obs.pipe(pipeUntil(onUnmounted));
