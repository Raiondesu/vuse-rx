import { canMergeDeep } from '../common';
export const shallowArray = (state) => (mutation) => {
    for (const key in mutation) {
        const submutation = mutation[key];
        state[key] = !Array.isArray(submutation) && canMergeDeep(state, mutation, key)
            ? shallowArray(state[key])(submutation)
            : submutation;
    }
    return state;
};
//# sourceMappingURL=shallowArray.js.map