"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRxState = exports.observeRef = exports.useSubject = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const vue_1 = require("vue");
const util_1 = require("./util");
function useSubject(subject) {
    const _subject = subject !== null && subject !== void 0 ? subject : new rxjs_1.Subject();
    const rState = vue_1.ref();
    return [(state) => _subject.next(rState.value = state), rState, _subject.asObservable()];
}
exports.useSubject = useSubject;
const observeRef = (ref) => new rxjs_1.Observable(ctx => vue_1.watch(ref, value => ctx.next(value)));
exports.observeRef = observeRef;
function _useRxState(stateUpdate) {
    const args$ = new rxjs_1.Subject();
    return [
        (...args) => args$.next(args),
        args$.pipe(operators_1.map(args => stateUpdate(...args)), operators_1.switchMap(update => rxjs_1.isObservable(update)
            ? update
            : rxjs_1.of(update))),
    ];
}
const updateKeys = (prev) => (curr) => {
    var _a;
    for (const key in curr) {
        prev[key] = (_a = curr[key]) !== null && _a !== void 0 ? _a : prev[key];
    }
    return prev;
};
function useRxState(initialState) {
    return function (reducers) {
        const mergeStates = [
            operators_1.mergeScan((state, curr) => {
                const update = updateKeys(state);
                const newState = typeof curr === 'function'
                    ? curr(state)
                    : curr;
                return rxjs_1.isObservable(newState)
                    ? newState.pipe(operators_1.map(update))
                    : rxjs_1.of(update(newState));
            }, initialState),
            operators_1.takeUntil(util_1.createOnDestroy$()),
        ];
        const handlers = {};
        const observables = [];
        for (const key in reducers) {
            const [handler, state$] = _useRxState(reducers[key]);
            handlers[key] = handler;
            observables.push(state$);
        }
        const events$ = rxjs_1.merge(...observables).pipe(...mergeStates);
        return [handlers, initialState, events$];
    };
}
exports.useRxState = useRxState;
//# sourceMappingURL=use-rx.js.map