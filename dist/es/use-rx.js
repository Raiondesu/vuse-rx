import { isObservable, merge, of, Subject, identity } from 'rxjs';
import { map, mergeScan, scan, takeUntil } from 'rxjs/operators';
import { ref } from 'vue';
import { createOnDestroy$ } from "./util.js";
export function useSubject(subject) {
    const _subject = subject !== null && subject !== void 0 ? subject : new Subject();
    const rState = ref(_subject.value);
    return [(state) => _subject.next(rState.value = state), rState, _subject.asObservable()];
}
const updateKeys = (prev) => (curr) => {
    var _a;
    for (const key in curr) {
        prev[key] = (_a = curr[key]) !== null && _a !== void 0 ? _a : prev[key];
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
        const state$ = map$(merge(...observables).pipe(mergeStates), reducers, initialState).pipe(scan((acc, curr) => updateKeys(acc)(curr), initialState), takeUntil(createOnDestroy$()));
        const result = [
            handlers,
            initialState,
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