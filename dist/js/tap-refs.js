"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRxRefs = exports.tapRefs = void 0;
const vue_1 = require("vue");
const operators_1 = require("rxjs/operators");
const tapRefs = (observable, map, initialState) => {
    const ops = [];
    const refs = {};
    for (const key in map) {
        refs[key] = vue_1.ref(map[key](initialState));
        ops.push(operators_1.tap(state => refs[key].value = map[key](state)));
    }
    return [
        refs,
        observable.pipe(...ops),
    ];
};
exports.tapRefs = tapRefs;
const useRxRefs = (rxState, map) => {
    const [handlers, state, state$] = rxState;
    const [refs, newState$] = exports.tapRefs(state$, map, state);
    return [
        refs,
        handlers,
        state,
        newState$,
    ];
};
exports.useRxRefs = useRxRefs;
//# sourceMappingURL=tap-refs.js.map