"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deep = void 0;
const common_1 = require("../common");
const deep = (state) => (mutation) => {
    for (const key in mutation) {
        state[key] = (0, common_1.canMergeDeep)(state, mutation, key)
            ? (0, exports.deep)(state[key])(mutation[key])
            : mutation[key];
    }
    return state;
};
exports.deep = deep;
//# sourceMappingURL=deep.js.map