"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncRef = exports.observeRef = exports.useRxRefs = exports.tapRefs = void 0;
const vue_1 = require("vue");
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
const until_1 = require("./hooks/until");
const tapRefs = (observable, map, initialState) => {
    const ops = [];
    const refs = {};
    for (const key in map) {
        refs[key] = vue_1.ref(map[key](initialState));
        ops.push(operators_1.tap(state => refs[key].value = map[key](state)));
    }
    return {
        refs,
        state$: observable.pipe(...ops),
    };
};
exports.tapRefs = tapRefs;
const useRxRefs = (rxState, map) => {
    const { actions, state, state$ } = rxState;
    const { refs, state$: newState$ } = exports.tapRefs(state$, map, state);
    return {
        refs,
        actions,
        state,
        state$: newState$,
    };
};
exports.useRxRefs = useRxRefs;
function observeRef(ref) {
    return until_1.untilUnmounted(new rxjs_1.Observable(ctx => vue_1.watch(ref, value => ctx.next(value))));
}
exports.observeRef = observeRef;
;
function syncRef(state, prop, map, refValue) {
    const refVar = refValue !== null && refValue !== void 0 ? refValue : vue_1.ref(map(state[prop]));
    observeRef(vue_1.toRef(state, prop)).subscribe(_ => refVar.value = map(_));
    return refVar;
}
exports.syncRef = syncRef;
//# sourceMappingURL=rx-refs.js.map