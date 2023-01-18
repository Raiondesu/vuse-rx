import { canMergeDeep } from '../common';
export const deepReplaceArray = (state) => (mutation) => {
    for (const key in mutation) {
        const submutation = mutation[key];
        state[key] = !Array.isArray(submutation) && canMergeDeep(state, mutation, key)
            ? deepReplaceArray(state[key])(submutation)
            : submutation;
    }
    return state;
};
//# sourceMappingURL=deepReplaceArray.js.map