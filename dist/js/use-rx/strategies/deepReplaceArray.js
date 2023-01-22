"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepReplaceArray = void 0;
const common_1 = require("../common");
const deepReplaceArray = (state) => (mutation) => {
    for (const key in mutation) {
        const submutation = mutation[key];
        state[key] = !Array.isArray(submutation) && (0, common_1.canMergeDeep)(state, mutation, key)
            ? (0, exports.deepReplaceArray)(state[key])(submutation)
            : submutation;
    }
    return state;
};
exports.deepReplaceArray = deepReplaceArray;
//# sourceMappingURL=deepReplaceArray.js.map