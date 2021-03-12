import { isObservable, merge, of, Subject } from 'rxjs';
import { map, mergeScan, scan, tap } from 'rxjs/operators';
import { reactive, readonly } from 'vue';
import { untilUnmounted } from './operators/until';
export function useRxState(initialState, options = defaultOptions) {
    const { mutationStrategy: mergeKeys, } = { ...defaultOptions, ...options };
    return function (reducers, map$) {
        const state = reactive(maybeCall(initialState));
        const actions = {};
        const actions$ = {};
        const actions$Arr = [];
        for (const key in reducers) {
            const mutations$ = new Subject();
            actions[key] = ((...args) => mutations$.next(reducers[key].apply(reducers, args)));
            actions$Arr.push(actions$[`${key}$`] = (mergeScan((prev, curr) => {
                let complete = false;
                let error = undefined;
                curr = maybeCall(curr, prev, {
                    error: e => { error = e; },
                    complete: () => { complete = true; }
                });
                return (isObservable(curr)
                    ? curr
                    : of(curr)).pipe(map(mergeKeys(prev, mergeKeys)), tap(() => (complete
                    ? mutations$.complete()
                    : error && mutations$.error(error))));
            }, state)(mutations$)));
        }
        const merged$ = merge(...actions$Arr);
        return createRxResult({
            actions,
            state: readonly(state),
            state$: untilUnmounted(map$ ? map$(merged$, reducers, state, actions$).pipe(scan((prev, curr) => (mergeKeys(prev, mergeKeys)(curr)), state)) : merged$),
            actions$: actions$,
        });
    };
}
export const canMergeDeep = (state, mutation, key) => (typeof mutation[key] === 'object'
    && mutation !== null
    && typeof state[key] === 'object');
export const deepMergeKeys = (state) => (mutation) => {
    for (const key in mutation) {
        state[key] = canMergeDeep(state, mutation, key)
            ? deepMergeKeys(state[key])(mutation[key])
            : mutation[key];
    }
    return state;
};
const defaultOptions = {
    mutationStrategy: deepMergeKeys,
};
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