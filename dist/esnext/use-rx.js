import { isObservable, merge, of, Subject, identity } from 'rxjs';
import { map, mergeScan, scan, takeUntil } from 'rxjs/operators';
import { ref } from 'vue';
import { createOnDestroy$ } from "./util.js";
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
    const mergeStates = mergeScan((state, curr) => {
        const update = updateKeys(state);
        const newState = typeof curr === 'function'
            ? curr(state)
            : curr;
        return (isObservable(newState)
            ? newState.pipe(map(update))
            : of(update(newState)));
    }, initialState);
    return function (reducers, map$ = identity) {
        const handlers = {};
        const observables = [];
        for (const key in reducers) {
            const args$ = new Subject();
            handlers[key] = ((...args) => args$.next(reducers[key](...args)));
            observables.push(args$);
        }
        const events$ = merge(...observables).pipe(mergeStates);
        return [
            handlers,
            initialState,
            map$(events$, reducers, initialState).pipe(scan((acc, curr) => updateKeys(acc)(curr), initialState), takeUntil(createOnDestroy$()))
        ];
    };
}
//# sourceMappingURL=use-rx.js.map