import { isObservable, merge, Observable, of, Subject } from 'rxjs';
import { map, mergeScan, switchMap, takeUntil } from 'rxjs/operators';
import { reactive, ref, watch } from 'vue';
import { createOnDestroy$ } from "./util.js";
export function useSubject(subject) {
    const _subject = subject ?? new Subject();
    const rState = ref();
    return [(state) => _subject.next(rState.value = state), rState, _subject.asObservable()];
}
export const observeRef = (ref) => new Observable(ctx => watch(ref, value => ctx.next(value)));
function _useRxState(stateUpdate) {
    const args$ = new Subject();
    return [
        (...args) => args$.next(args),
        args$.pipe(map(args => stateUpdate(...args)), switchMap(update => isObservable(update)
            ? update
            : of(update))),
    ];
}
const updateKeys = (prev) => (curr) => {
    for (const key in curr) {
        prev[key] = curr[key] ?? prev[key];
    }
    return prev;
};
export function useRxState(initialState) {
    const state = reactive(initialState);
    return function (reducers) {
        const mergeStates = [
            mergeScan((state, curr) => {
                const update = updateKeys(state);
                const newState = typeof curr === 'function'
                    ? curr(state)
                    : curr;
                return isObservable(newState)
                    ? newState.pipe(map(update))
                    : of(update(newState));
            }, state),
            takeUntil(createOnDestroy$()),
        ];
        const handlers = {};
        const observables = [];
        for (const key in reducers) {
            const [handler, state$] = _useRxState(reducers[key]);
            handlers[key] = handler;
            observables.push(state$);
        }
        const events$ = merge(...observables).pipe(...mergeStates);
        return [handlers, state, events$];
    };
}
//# sourceMappingURL=use-rx.js.map