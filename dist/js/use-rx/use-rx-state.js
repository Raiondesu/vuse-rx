"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRxState = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const vue_1 = require("vue");
const until_1 = require("../operators/until");
const deepReplaceArray_1 = require("./strategies/deepReplaceArray");
const defaultOptions = {
    mutationStrategy: deepReplaceArray_1.deepReplaceArray,
};
function useRxState(initialState, options) {
    const { mutationStrategy: mergeKeys } = Object.assign(Object.assign({}, defaultOptions), options);
    return function (reducers, map$) {
        const state = (0, vue_1.reactive)(callMeMaybe(initialState));
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
            actions$Arr.push(actions$[`${key}$`] = ((0, operators_1.mergeScan)((prev, curr) => {
                curr = callMeMaybe(curr, prev, context);
                return ((0, rxjs_1.isObservable)(curr)
                    ? curr
                    : (0, rxjs_1.of)(curr)).pipe((0, operators_1.map)(mergeKeys(prev, mergeKeys)), (0, operators_1.tap)({
                    next: () => error
                        ? error = mutations$.error(error)
                        : complete && mutations$.complete()
                }));
            }, state)(mutations$)));
        }
        const merged$ = (0, rxjs_1.merge)(...actions$Arr);
        return createRxResult({
            actions,
            state: (0, vue_1.readonly)(state),
            state$: (0, until_1.untilUnmounted)(map$ ? map$(merged$, reducers, state, actions$, context).pipe((0, operators_1.scan)((prev, curr) => mergeKeys(prev, mergeKeys)(curr), state)) : merged$),
            actions$: actions$,
        });
    };
}
exports.useRxState = useRxState;
const createRxResult = (result) => (Object.assign(Object.assign({}, result), { subscribe: (...args) => (Object.assign(Object.assign({}, result), { subscription: result.state$.subscribe(...args) })) }));
const callMeMaybe = (fn, ...args) => (typeof fn === 'function'
    ? fn(...args)
    : fn);
;
;
//# sourceMappingURL=use-rx-state.js.map