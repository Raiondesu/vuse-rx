import { isObservable, merge, of, Subject } from 'rxjs';
import { map, mergeScan } from 'rxjs/operators';
import { reactive, readonly } from 'vue';
import { untilUnmounted } from './hooks/until';
export const deepMergeKeys = (prev) => (curr) => {
    for (const key in curr) {
        prev[key] = (typeof curr[key] === 'object'
            && curr !== null
            && typeof prev[key] === 'object') ? deepMergeKeys(prev[key])(curr[key])
            : curr[key];
    }
    return prev;
};
export function useRxState(initialState, mergeKeys = deepMergeKeys) {
    return function (reducers, map$) {
        const state = reactive(maybeCall(initialState));
        const mergeStates = mergeScan((prev, curr) => {
            const newState = maybeCall(curr, prev);
            return (isObservable(newState)
                ? newState
                : of(newState)).pipe(map(mergeKeys(prev)));
        }, state);
        const actions = {};
        const actions$ = {};
        for (const key in reducers) {
            const mutations$ = new Subject();
            actions[key] = ((...args) => mutations$.next(reducers[key](...args)));
            actions$[getAction$Name(key)] = mutations$.pipe(mergeStates);
        }
        const merged$ = merge(...Object.values(actions$));
        return createRxResult({
            actions,
            state: readonly(state),
            state$: untilUnmounted(map$?.(merged$, reducers, state, actions$).pipe(mergeStates) ?? merged$),
            actions$: actions$,
        });
    };
}
const getAction$Name = (name) => `${name}$`;
const createRxResult = (result) => ({
    ...result,
    subscribe: (...args) => ({
        ...result,
        subscription: result.state$.subscribe(...args),
    }),
});
const maybeCall = (fn, ...args) => (typeof fn === 'function'
    ? fn(...args)
    : fn);
//# sourceMappingURL=use-rx.js.map