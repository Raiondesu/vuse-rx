import { isObservable, merge, of, Subject } from 'rxjs';
import { map, mergeScan, switchMap, takeUntil } from 'rxjs/operators';
import { reactive, ref } from 'vue';
import { createOnDestroySubject } from "./util.js";
function _useRX(stateUpdate) {
    const args$ = new Subject();
    return [
        (...args) => args$.next(args),
        args$.pipe(map(args => stateUpdate(...args)), switchMap(update => isObservable(update)
            ? update
            : of(update))),
    ];
}
export function useRx(subject) {
    const _subject = subject !== null && subject !== void 0 ? subject : new Subject();
    const rState = ref(null);
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
            takeUntil(createOnDestroySubject()),
        ];
        const handlers = {};
        const observables = [];
        for (const key in reducers) {
            const [handler, state$] = _useRX(reducers[key]);
            handlers[key] = handler;
            observables.push(state$);
        }
        const events$ = merge(...observables).pipe(...mergeStates);
        return [handlers, state, events$];
    };
}
//# sourceMappingURL=use-rx.js.map