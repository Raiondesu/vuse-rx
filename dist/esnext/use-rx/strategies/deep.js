import { canMergeDeep } from '../common';
export const deep = (state) => (mutation) => {
    for (const key in mutation) {
        state[key] = canMergeDeep(state, mutation, key)
            ? deep(state[key])(mutation[key])
            : mutation[key];
    }
    return state;
};
//# sourceMappingURL=deep.js.map