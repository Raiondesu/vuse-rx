import { isObservable, merge, of, Subject } from 'rxjs';
import { map, mergeScan } from 'rxjs/operators';
import { reactive, readonly } from 'vue';
import { isObject } from '@vue/shared';
import { untilUnmounted } from "./hooks/until.js";
export const deepMergeKeys = (prev) => (curr) => {
    for (const key in curr) {
        prev[key] = isObject(curr[key]) && isObject(prev[key])
            ? deepMergeKeys(prev[key])(curr[key])
            : curr[key];
    }
    return prev;
};
export function useRxState(initialState, mergeKeys = deepMergeKeys) {
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
            state$: untilUnmounted((_a = map$ === null || map$ === void 0 ? void 0 : map$(merged$, reducers, state, actions$).pipe(mergeStates)) !== null && _a !== void 0 ? _a : merged$),
            actions$: actions$,
        });
    };
}
const getAction$Name = (name) => `${name}$`;
const createRxResult = (result) => (Object.assign(Object.assign({}, result), { subscribe: (...args) => (Object.assign(Object.assign({}, result), { subscription: result.state$.subscribe(...args) })) }));
const maybeCall = (fn, ...args) => (typeof fn === 'function'
    ? fn(...args)
    : fn);
//# sourceMappingURL=use-rx.js.map