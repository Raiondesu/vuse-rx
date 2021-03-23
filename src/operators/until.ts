import type { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { onUnmounted } from 'vue';
import { VueHook, fromHook } from '../hooks/from';

/**
 * Creates an takeUntil that emits when a vue hook is executed
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
 * @param $ - obserable to stop on unmounted
 *
 * ---
 */
export const untilUnmounted: <T>($: Observable<T>) => Observable<T> = pipeUntil(onUnmounted);
