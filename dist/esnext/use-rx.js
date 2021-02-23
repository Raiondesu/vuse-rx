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
const getHandler$Name = (name) => `on${name[0].toUpperCase()}${name.slice(1)}`;
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
        const handlers = {};
        const handlers$ = {};
        for (const key in reducers) {
            const args$ = new Subject();
            handlers[key] = ((...args) => args$.next(reducers[key](...args)));
            handlers$[getHandler$Name(key)] = args$.pipe(mergeStates);
        }
        const state$ = map$(merge(...Object.values(handlers$)), reducers, reactiveState, handlers$).pipe(scan((acc, curr) => updateKeys(acc)(curr), reactiveState), pipeUntil(onUnmounted));
        const result = {
            handlers,
            state: reactiveState,
            state$,
            handlers$,
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