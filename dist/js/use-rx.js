"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRxState = exports.useSubject = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const vue_1 = require("vue");
const until_1 = require("./hooks/until");
function useSubject(subject) {
    const _subject = subject !== null && subject !== void 0 ? subject : new rxjs_1.Subject();
    const rState = vue_1.ref(_subject.value);
    return [(state) => _subject.next(rState.value = state), rState, _subject.asObservable()];
}
exports.useSubject = useSubject;
const updateKeys = (prev) => (curr) => {
    var _a;
    for (const key in curr) {
        prev[key] = (_a = curr[key]) !== null && _a !== void 0 ? _a : prev[key];
    }
    return prev;
};
function useRxState(initialState) {
    const mergeStates = operators_1.mergeScan((state, curr) => {
        const update = updateKeys(state);
        const newState = typeof curr === 'function'
            ? curr(state)
            : curr;
        return (rxjs_1.isObservable(newState)
            ? newState.pipe(operators_1.map(update))
            : rxjs_1.of(update(newState)));
    }, initialState);
    return function (reducers, map$ = rxjs_1.identity) {
        const handlers = {};
        const observables = [];
        for (const key in reducers) {
            const args$ = new rxjs_1.Subject();
            handlers[key] = ((...args) => args$.next(reducers[key](...args)));
            observables.push(args$);
        }
        const state$ = map$(rxjs_1.merge(...observables).pipe(mergeStates), reducers, initialState).pipe(operators_1.scan((acc, curr) => updateKeys(acc)(curr), initialState), until_1.pipeUntil(vue_1.onUnmounted));
        const result = [
            handlers,
            initialState,
            state$,
        ];
        result.subscribe = (...args) => [
            ...result,
            state$.subscribe(...args),
        ];
        return result;
    };
}
exports.useRxState = useRxState;
//# sourceMappingURL=use-rx.js.map