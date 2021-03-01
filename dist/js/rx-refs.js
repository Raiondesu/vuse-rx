"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncRef = exports.bindRefs = exports.fromRef = exports.useRxRefs = exports.tapRefs = void 0;
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
const bindRefs = (ref1, ref2, mapValue) => vue_1.watch(ref1, _ => ref2.value = mapValue(_));
exports.bindRefs = bindRefs;
function syncRef(ref1, map, _ref2) {
    var _a, _b, _c, _d;
    const ref2 = vue_1.ref((_b = _ref2 !== null && _ref2 !== void 0 ? _ref2 : (_a = map === null || map === void 0 ? void 0 : map.to) === null || _a === void 0 ? void 0 : _a.call(map, ref1.value)) !== null && _b !== void 0 ? _b : ref1.value);
    exports.bindRefs(ref1, ref2, (_c = map === null || map === void 0 ? void 0 : map.to) !== null && _c !== void 0 ? _c : rxjs_1.identity);
    if (!map || (map === null || map === void 0 ? void 0 : map.from)) {
        exports.bindRefs(ref2, ref1, (_d = map === null || map === void 0 ? void 0 : map.from) !== null && _d !== void 0 ? _d : rxjs_1.identity);
    }
    return ref2;
}
exports.syncRef = syncRef;
//# sourceMappingURL=rx-refs.js.map