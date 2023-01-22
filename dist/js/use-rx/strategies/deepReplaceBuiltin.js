"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepReplaceBuiltin = exports.defaultBuiltin = void 0;
const common_1 = require("./common");
exports.defaultBuiltin = [
    Array,
    Date,
    RegExp,
    Error,
];
function deepReplaceBuiltin(state) {
    return (mutation) => {
        for (const key in mutation) {
            const submutation = mutation[key];
            state[key] = ((0, common_1.canMergeDeep)(state, mutation, key)
                && !this.some(c => [state[key].constructor, submutation.constructor].includes(c)))
                ? deepReplaceBuiltin.call(this, state[key])(submutation)
                : submutation;
        }
        return state;
    };
}
exports.deepReplaceBuiltin = deepReplaceBuiltin;
//# sourceMappingURL=deepReplaceBuiltin.js.map