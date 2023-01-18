import { isObservable, merge, of, Subject } from 'rxjs';
import { map, mergeScan, scan, tap } from 'rxjs/operators';
import { reactive, readonly } from 'vue';
import { untilUnmounted } from '../operators/until';
import { deepReplaceArray } from './strategies/deepReplaceArray';
const defaultOptions = {
    mutationStrategy: deepReplaceArray,
};
export function useRxState(initialState, options) {
    const { mutationStrategy: mergeKeys } = Object.assign(Object.assign({}, defaultOptions), options);
    return function (reducers, map$) {
        const state = reactive(callMeMaybe(initialState));
        const actions = {};
        const actions$ = {};
        const actions$Arr = [];
        let complete = false;
        let error = undefined;
        const context = {
            error: e => { error = e; },
            complete: () => { complete = true; }
        };
        for (const key in reducers) {
            const mutations$ = new Subject();
            actions[key] = ((...args) => mutations$.next(reducers[key].apply(reducers, args)));
            actions$Arr.push(actions$[`${key}$`] = (mergeScan((prev, curr) => {
                curr = callMeMaybe(curr, prev, context);
                return (isObservable(curr)
                    ? curr
                    : of(curr)).pipe(map(mergeKeys(prev, mergeKeys)), tap({
                    next: () => error
                        ? error = mutations$.error(error)
                        : complete && mutations$.complete()
                }));
            }, state)(mutations$)));
        }
        const merged$ = merge(...actions$Arr);
        return createRxResult({
            actions,
            state: readonly(state),
            state$: untilUnmounted(map$ ? map$(merged$, reducers, state, actions$, context).pipe(scan((prev, curr) => mergeKeys(prev, mergeKeys)(curr), state)) : merged$),
            actions$: actions$,
        });
    };
}
const createRxResult = (result) => (Object.assign(Object.assign({}, result), { subscribe: (...args) => (Object.assign(Object.assign({}, result), { subscription: result.state$.subscribe(...args) })) }));
const callMeMaybe = (fn, ...args) => (typeof fn === 'function'
    ? fn(...args)
    : fn);
;
;
//# sourceMappingURL=use-rx-state.js.map