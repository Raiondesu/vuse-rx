export const canMergeDeep = (state, mutation, key) => (mutation != null
    && typeof mutation[key] === 'object'
    && typeof state[key] === 'object');
//# sourceMappingURL=common.js.map