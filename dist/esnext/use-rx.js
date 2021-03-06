import { isObservable, merge, of, Subject, identity } from 'rxjs';
import { map, mergeScan, scan } from 'rxjs/operators';
import { onUnmounted, reactive, readonly } from 'vue';
import { pipeUntil } from "./hooks/until.js";
const deepUpdate = (prev) => (curr) => {
    for (const key in curr) {
        if (typeof prev[key] === 'object'
            && typeof curr[key] === 'object'
            && curr != null) {
            prev[key] = deepUpdate(prev[key])(curr[key]);
        }
        else {
            prev[key] = curr[key];
        }
    }
    return prev;
};
export function useRxState(initialState, mergeKeys = deepUpdate) {
    return function (reducers, map$ = identity) {
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
        const state$ = map$(merge(...Object.values(actions$)), reducers, state, actions$).pipe(scan((acc, curr) => deepUpdate(acc)(curr), state), pipeUntil(onUnmounted));
        return createRxResult({
            actions,
            state: readonly(state),
            state$,
            actions$: actions$,
        });
    };
}
const getAction$Name = (name) => `on${name[0].toUpperCase()}${name.slice(1)}`;
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