import { isObservable, merge, Observable, of, Subject } from 'rxjs';
import { map, mergeScan, takeUntil } from 'rxjs/operators';
import { ref, watch } from 'vue';
import { createOnDestroy$ } from "./util.js";
export function useSubject(subject) {
    const _subject = subject !== null && subject !== void 0 ? subject : new Subject();
    const rState = ref();
    return [(state) => _subject.next(rState.value = state), rState, _subject.asObservable()];
}
export const observeRef = (ref) => new Observable(ctx => watch(ref, value => ctx.next(value)));
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
        return isObservable(newState)
            ? newState.pipe(map(update))
            : of(update(newState));
    }, initialState);
    return function (reducers) {
        const handlers = {};
        const observables = [];
        for (const key in reducers) {
            const args$ = new Subject();
            const handler = (...args) => args$.next(args);
            const state$ = args$.pipe(map(args => reducers[key](...args)), mergeStates);
            handlers[key] = handler;
            observables.push(state$);
        }
        const events$ = merge(...observables).pipe(takeUntil(createOnDestroy$()));
        return [handlers, initialState, events$];
    };
}
//# sourceMappingURL=use-rx.js.map