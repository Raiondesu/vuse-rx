"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRxState = exports.deepMergeKeys = exports.canMergeDeep = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const vue_1 = require("vue");
const until_1 = require("./hooks/until");
const canMergeDeep = (state, mutation, key) => (typeof mutation[key] === 'object'
    && mutation !== null
    && typeof state[key] === 'object');
exports.canMergeDeep = canMergeDeep;
const deepMergeKeys = (state) => (mutation) => {
    for (const key in mutation) {
        state[key] = exports.canMergeDeep(state, mutation, key)
            ? exports.deepMergeKeys(state[key])(mutation[key])
            : mutation[key];
    }
    return state;
};
exports.deepMergeKeys = deepMergeKeys;
const defaultOptions = {
    mutationStrategy: exports.deepMergeKeys,
};
function useRxState(initialState, options = defaultOptions) {
    const { mutationStrategy: mergeKeys, } = Object.assign(Object.assign({}, defaultOptions), options);
    return function (reducers, map$) {
        const state = vue_1.reactive(maybeCall(initialState));
        const actions = {};
        const actions$ = {};
        const actions$Arr = [];
        for (const key in reducers) {
            const mutations$ = new rxjs_1.Subject();
            actions[key] = ((...args) => mutations$.next(reducers[key].apply(reducers, args)));
            actions$Arr.push(actions$[`${key}$`] = (operators_1.mergeScan((prev, curr) => {
                let complete = false;
                let error = undefined;
                curr = maybeCall(curr, prev, {
                    error: e => { error = e; },
                    complete: () => { complete = true; }
                });
                return (rxjs_1.isObservable(curr) ? curr : rxjs_1.of(curr)).pipe(operators_1.map(mergeKeys(prev, mergeKeys)), operators_1.tap(() => (complete
                    ? mutations$.complete()
                    : error && mutations$.error(error))));
            }, state)(mutations$)));
        }
        const merged$ = rxjs_1.merge(...actions$Arr);
        return createRxResult({
            actions,
            state: vue_1.readonly(state),
            state$: until_1.untilUnmounted(map$ ? map$(merged$, reducers, state, actions$).pipe(operators_1.scan((prev, curr) => (mergeKeys(prev, mergeKeys)(curr)), state)) : merged$),
            actions$: actions$,
        });
    };
}
exports.useRxState = useRxState;
const createRxResult = (result) => (Object.assign(Object.assign({}, result), { subscribe: (...args) => (Object.assign(Object.assign({}, result), { subscription: result.state$.subscribe(...args) })) }));
const maybeCall = (fn, ...args) => (typeof fn === 'function'
    ? fn(...args)
    : fn);
//# sourceMappingURL=use-rx.js.map