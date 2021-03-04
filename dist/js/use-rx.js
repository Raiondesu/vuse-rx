"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRxState = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const vue_1 = require("vue");
const until_1 = require("./hooks/until");
const updateKeys = (prev) => (curr) => {
    for (const key in curr) {
        prev[key] = curr[key];
    }
    return prev;
};
const getAction$Name = (name) => `on${name[0].toUpperCase()}${name.slice(1)}`;
const createRxResult = (result) => (Object.assign(Object.assign({}, result), { subscribe: (...args) => (Object.assign(Object.assign({}, result), { subscription: result.state$.subscribe(...args) })) }));
const maybeCall = (fn, ...args) => (typeof fn === 'function'
    ? fn(...args)
    : fn);
function useRxState(initialState) {
    return function (reducers, map$ = rxjs_1.identity) {
        const state = vue_1.reactive(maybeCall(initialState));
        const mergeStates = operators_1.mergeScan((prev, curr) => {
            const newState = maybeCall(curr, prev);
            return (rxjs_1.isObservable(newState)
                ? newState
                : rxjs_1.of(newState)).pipe(operators_1.map(updateKeys(prev)));
        }, state);
        const actions = {};
        const actions$ = {};
        for (const key in reducers) {
            const mutations$ = new rxjs_1.Subject();
            actions[key] = ((...args) => mutations$.next(reducers[key](...args)));
            actions$[getAction$Name(key)] = mutations$.pipe(mergeStates);
        }
        const state$ = map$(rxjs_1.merge(...Object.values(actions$)), reducers, state, actions$).pipe(operators_1.scan((acc, curr) => updateKeys(acc)(curr), state), until_1.pipeUntil(vue_1.onUnmounted));
        return createRxResult({
            actions,
            state,
            state$,
            actions$,
        });
    };
}
exports.useRxState = useRxState;
//# sourceMappingURL=use-rx.js.map