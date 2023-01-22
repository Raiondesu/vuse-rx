"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canMergeDeep = void 0;
const canMergeDeep = (state, mutation, key) => (mutation != null
    && typeof mutation[key] === 'object'
    && typeof state[key] === 'object');
exports.canMergeDeep = canMergeDeep;
//# sourceMappingURL=common.js.map