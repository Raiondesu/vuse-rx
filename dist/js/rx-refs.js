"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncRefs = exports.syncRef = exports.fromRef = exports.useRxRefs = exports.tapRefs = void 0;
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
function syncRef(state, prop, map, refValue) {
    const _map = (vue_1.isRef(map) || !map) ? (_) => _ : map;
    const _refValue = refValue !== null && refValue !== void 0 ? refValue : (vue_1.isRef(map) ? map : undefined);
    const refVar = _refValue !== null && _refValue !== void 0 ? _refValue : vue_1.ref(_map(state[prop]));
    fromRef(vue_1.toRef(state, prop)).subscribe(_ => refVar.value = _map(_));
    return refVar;
}
exports.syncRef = syncRef;
const defineDesc = (ref, desc, descTo, map) => {
    Object.defineProperty(ref, 'value', {
        get: desc === null || desc === void 0 ? void 0 : desc.get,
        set: v => {
            var _a, _b, _c;
            (_a = desc.set) === null || _a === void 0 ? void 0 : _a.call(desc, v);
            (_b = descTo.set) === null || _b === void 0 ? void 0 : _b.call(descTo, (_c = map === null || map === void 0 ? void 0 : map(v)) !== null && _c !== void 0 ? _c : v);
        }
    });
};
function syncRefs(ref1, mapTo, mapFrom, _ref2) {
    const ref2 = vue_1.ref(_ref2 !== null && _ref2 !== void 0 ? _ref2 : mapTo === null || mapTo === void 0 ? void 0 : mapTo(ref1.value));
    const desc1 = Object.getOwnPropertyDescriptor(ref1, 'value');
    const desc2 = Object.getOwnPropertyDescriptor(ref2, 'value');
    if (desc1 && desc2) {
        defineDesc(ref1, desc1, desc2, mapTo);
        defineDesc(ref2, desc2, desc1, mapFrom);
    }
    return ref2;
}
exports.syncRefs = syncRefs;
//# sourceMappingURL=rx-refs.js.map