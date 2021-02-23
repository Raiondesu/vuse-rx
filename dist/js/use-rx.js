"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRxState = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const vue_1 = require("vue");
const until_1 = require("./hooks/until");
const updateKeys = (prev) => (curr) => {
    var _a;
    for (const key in curr) {
        prev[key] = (_a = curr[key]) !== null && _a !== void 0 ? _a : prev[key];
    }
    return prev;
};
const getAction$Name = (name) => `on${name[0].toUpperCase()}${name.slice(1)}`;
function useRxState(initialState) {
    const reactiveState = vue_1.reactive(initialState);
    const mergeStates = operators_1.mergeScan((state, curr) => {
        const update = updateKeys(state);
        const newState = typeof curr === 'function'
            ? curr(state)
            : curr;
        return (rxjs_1.isObservable(newState)
            ? newState.pipe(operators_1.map(update))
            : rxjs_1.of(update(newState)));
    }, reactiveState);
    return function (reducers, map$ = rxjs_1.identity) {
        const actions = {};
        const actions$ = {};
        for (const key in reducers) {
            const args$ = new rxjs_1.Subject();
            actions[key] = ((...args) => args$.next(reducers[key](...args)));
            actions$[getAction$Name(key)] = args$.pipe(mergeStates);
        }
        const state$ = map$(rxjs_1.merge(...Object.values(actions$)), reducers, reactiveState, actions$).pipe(operators_1.scan((acc, curr) => updateKeys(acc)(curr), reactiveState), until_1.pipeUntil(vue_1.onUnmounted));
        const result = {
            actions,
            state: reactiveState,
            state$,
            actions$,
        };
        return Object.assign(Object.assign({}, result), { subscribe: (...args) => (Object.assign(Object.assign({}, result), { subscription: state$.subscribe(...args) })) });
    };
}
exports.useRxState = useRxState;
//# sourceMappingURL=use-rx.js.map