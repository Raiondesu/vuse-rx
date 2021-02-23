import { isObservable, merge, of, Subject, identity } from 'rxjs';
import { map, mergeScan, scan } from 'rxjs/operators';
import { onUnmounted, reactive } from 'vue';
import { pipeUntil } from "./hooks/until.js";
const updateKeys = (prev) => (curr) => {
    for (const key in curr) {
        prev[key] = curr[key] ?? prev[key];
    }
    return prev;
};
const getAction$Name = (name) => `on${name[0].toUpperCase()}${name.slice(1)}`;
export function useRxState(initialState) {
    const reactiveState = reactive(initialState);
    const mergeStates = mergeScan((state, curr) => {
        const update = updateKeys(state);
        const newState = typeof curr === 'function'
            ? curr(state)
            : curr;
        return (isObservable(newState)
            ? newState.pipe(map(update))
            : of(update(newState)));
    }, reactiveState);
    return function (reducers, map$ = identity) {
        const actions = {};
        const actions$ = {};
        for (const key in reducers) {
            const args$ = new Subject();
            actions[key] = ((...args) => args$.next(reducers[key](...args)));
            actions$[getAction$Name(key)] = args$.pipe(mergeStates);
        }
        const state$ = map$(merge(...Object.values(actions$)), reducers, reactiveState, actions$).pipe(scan((acc, curr) => updateKeys(acc)(curr), reactiveState), pipeUntil(onUnmounted));
        const result = {
            actions,
            state: reactiveState,
            state$,
            actions$,
        };
        return {
            ...result,
            subscribe: (...args) => ({
                ...result,
                subscription: state$.subscribe(...args),
            }),
        };
    };
}
//# sourceMappingURL=use-rx.js.map