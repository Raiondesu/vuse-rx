"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shallowArray = void 0;
const common_1 = require("../common");
const shallowArray = (state) => (mutation) => {
    for (const key in mutation) {
        const submutation = mutation[key];
        state[key] = !Array.isArray(submutation) && common_1.canMergeDeep(state, mutation, key)
            ? exports.shallowArray(state[key])(submutation)
            : submutation;
    }
    return state;
};
exports.shallowArray = shallowArray;
//# sourceMappingURL=shallowArray.js.map