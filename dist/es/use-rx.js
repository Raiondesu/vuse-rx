import { isObservable, merge, of, Subject } from 'rxjs';
import { map, mergeScan, scan } from 'rxjs/operators';
import { reactive, readonly } from 'vue';
import { untilUnmounted } from "./hooks/until.js";
const deepUpdate = (prev) => (curr) => {
    for (const key in curr) {
        prev[key] = (typeof prev[key] === 'object'
            && typeof curr[key] === 'object'
            && curr != null) ? deepUpdate(prev[key])(curr[key]) : curr[key];
    }
    return prev;
};
export function useRxState(initialState, mergeKeys = deepUpdate) {
    return function (reducers, map$) {
        var _a;
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
        const merged$ = merge(...Object.values(actions$));
        return createRxResult({
            actions,
            state: readonly(state),
            state$: untilUnmounted((_a = map$ === null || map$ === void 0 ? void 0 : map$(merged$, reducers, state, actions$).pipe(scan((acc, curr) => mergeKeys(acc)(curr), state))) !== null && _a !== void 0 ? _a : merged$),
            actions$: actions$,
        });
    };
}
const getAction$Name = (name) => `on${name[0].toUpperCase()}${name.slice(1)}`;
const createRxResult = (result) => (Object.assign(Object.assign({}, result), { subscribe: (...args) => (Object.assign(Object.assign({}, result), { subscription: result.state$.subscribe(...args) })) }));
const maybeCall = (fn, ...args) => (typeof fn === 'function'
    ? fn(...args)
    : fn);
//# sourceMappingURL=use-rx.js.map