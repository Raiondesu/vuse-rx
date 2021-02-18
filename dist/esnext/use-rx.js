import { isObservable, merge, of, Subject, identity } from 'rxjs';
import { map, mergeScan, scan } from 'rxjs/operators';
import { onUnmounted, reactive, ref } from 'vue';
import { pipeUntil } from "./hooks/until.js";
export function useSubject(subject) {
    const _subject = subject ?? new Subject();
    const rState = ref(_subject.value);
    return [(state) => _subject.next(rState.value = state), rState, _subject.asObservable()];
}
const updateKeys = (prev) => (curr) => {
    for (const key in curr) {
        prev[key] = curr[key] ?? prev[key];
    }
    return prev;
};
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
        const observables = [];
        for (const key in reducers) {
            const args$ = new Subject();
            handlers[key] = ((...args) => args$.next(reducers[key](...args)));
            observables.push(args$);
        }
        const state$ = map$(merge(...observables).pipe(mergeStates), reducers, reactiveState).pipe(scan((acc, curr) => updateKeys(acc)(curr), reactiveState), pipeUntil(onUnmounted));
        const result = [
            handlers,
            reactiveState,
            state$,
        ];
        result.subscribe = (...args) => [
            ...result,
            state$.subscribe(...args),
        ];
        return result;
    };
}
//# sourceMappingURL=use-rx.js.map