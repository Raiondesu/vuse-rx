"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRxState = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const vue_1 = require("vue");
const until_1 = require("./hooks/until");
const deepUpdate = (prev) => (curr) => {
    for (const key in curr) {
        prev[key] = (typeof prev[key] === 'object'
            && typeof curr[key] === 'object'
            && curr != null) ? deepUpdate(prev[key])(curr[key]) : curr[key];
    }
    return prev;
};
function useRxState(initialState, mergeKeys = deepUpdate) {
    return function (reducers, map$) {
        var _a;
        const state = vue_1.reactive(maybeCall(initialState));
        const mergeStates = operators_1.mergeScan((prev, curr) => {
            const newState = maybeCall(curr, prev);
            return (rxjs_1.isObservable(newState)
                ? newState
                : rxjs_1.of(newState)).pipe(operators_1.map(mergeKeys(prev)));
        }, state);
        const actions = {};
        const actions$ = {};
        for (const key in reducers) {
            const mutations$ = new rxjs_1.Subject();
            actions[key] = ((...args) => mutations$.next(reducers[key](...args)));
            actions$[getAction$Name(key)] = mutations$.pipe(mergeStates);
        }
        const merged$ = rxjs_1.merge(...Object.values(actions$));
        return createRxResult({
            actions,
            state: vue_1.readonly(state),
            state$: until_1.untilUnmounted((_a = map$ === null || map$ === void 0 ? void 0 : map$(merged$, reducers, state, actions$).pipe(operators_1.scan((acc, curr) => mergeKeys(acc)(curr), state))) !== null && _a !== void 0 ? _a : merged$),
            actions$: actions$,
        });
    };
}
exports.useRxState = useRxState;
const getAction$Name = (name) => `on${name[0].toUpperCase()}${name.slice(1)}`;
const createRxResult = (result) => (Object.assign(Object.assign({}, result), { subscribe: (...args) => (Object.assign(Object.assign({}, result), { subscription: result.state$.subscribe(...args) })) }));
const maybeCall = (fn, ...args) => (typeof fn === 'function'
    ? fn(...args)
    : fn);
//# sourceMappingURL=use-rx.js.map