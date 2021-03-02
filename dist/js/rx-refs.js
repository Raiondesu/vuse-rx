"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncRef = exports.fromRef = exports.useRxRefs = exports.tapRefs = void 0;
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
function fromRef(ref) {
    return until_1.untilUnmounted(new rxjs_1.Observable(ctx => vue_1.watch(ref, value => ctx.next(value))));
}
exports.fromRef = fromRef;
;
function syncRef(ref1, { to, from }, _ref2) {
    if (to && from) {
        return vue_1.computed({
            get: () => to(ref1.value),
            set: v => ref1.value = from(v),
        });
    }
    const ref2 = vue_1.ref(_ref2 !== null && _ref2 !== void 0 ? _ref2 : ref1.value);
    if (to) {
        vue_1.watch(ref1, v => ref2.value = to(v));
    }
    else if (from) {
        vue_1.watch(ref2, v => ref1.value = from(v));
    }
    return ref2;
}
exports.syncRef = syncRef;
//# sourceMappingURL=rx-refs.js.map