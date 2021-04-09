"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRxState = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const vue_1 = require("vue");
const until_1 = require("../operators/until");
const shallowArray_1 = require("./strategies/shallowArray");
const defaultOptions = {
    mutationStrategy: shallowArray_1.shallowArray,
};
function useRxState(initialState, options) {
    const { mutationStrategy: mergeKeys } = Object.assign(Object.assign({}, defaultOptions), options);
    return function (reducers, map$) {
        const state = vue_1.reactive(maybeCall(initialState));
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
            const mutations$ = new rxjs_1.Subject();
            actions[key] = ((...args) => mutations$.next(reducers[key].apply(reducers, args)));
            actions$Arr.push(actions$[`${key}$`] = (operators_1.mergeScan((prev, curr) => {
                curr = maybeCall(curr, prev, context);
                return (rxjs_1.isObservable(curr)
                    ? curr
                    : rxjs_1.of(curr)).pipe(operators_1.map(mergeKeys(prev, mergeKeys)), operators_1.tap({
                    next: () => error
                        ? error = mutations$.error(error)
                        : complete && mutations$.complete()
                }));
            }, state)(mutations$)));
        }
        const merged$ = rxjs_1.merge(...actions$Arr);
        return createRxResult({
            actions,
            state: vue_1.readonly(state),
            state$: until_1.untilUnmounted(map$ ? map$(merged$, reducers, state, actions$, context).pipe(operators_1.scan((prev, curr) => mergeKeys(prev, mergeKeys)(curr), state)) : merged$),
            actions$: actions$,
        });
    };
}
exports.useRxState = useRxState;
const createRxResult = (result) => (Object.assign(Object.assign({}, result), { subscribe: (...args) => (Object.assign(Object.assign({}, result), { subscription: result.state$.subscribe(...args) })) }));
const maybeCall = (fn, ...args) => (typeof fn === 'function'
    ? fn(...args)
    : fn);
;
;
//# sourceMappingURL=use-rx-state.js.map