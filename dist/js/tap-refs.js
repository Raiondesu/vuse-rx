"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tapRefs = void 0;
const vue_1 = require("vue");
const operators_1 = require("rxjs/operators");
const tapRefs = (rxState, map) => {
    const ops = [];
    const refs = {};
    const [handlers, state, state$] = rxState;
    for (const key in map) {
        refs[key] = vue_1.ref(map[key](state));
        ops.push(operators_1.tap(state => refs[key].value = map[key](state)));
    }
    return [
        refs,
        handlers,
        state,
        state$.pipe(...ops),
    ];
};
exports.tapRefs = tapRefs;
//# sourceMappingURL=tap-refs.js.map