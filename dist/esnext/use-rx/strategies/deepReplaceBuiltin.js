import { canMergeDeep } from './common';
export const defaultBuiltin = [
    Array,
    Date,
    RegExp,
    Error,
];
export function deepReplaceBuiltin(state) {
    return (mutation) => {
        for (const key in mutation) {
            const submutation = mutation[key];
            state[key] = (canMergeDeep(state, mutation, key)
                && !this.some(c => [state[key].constructor, submutation.constructor].includes(c)))
                ? deepReplaceBuiltin.call(this, state[key])(submutation)
                : submutation;
        }
        return state;
    };
}
//# sourceMappingURL=deepReplaceBuiltin.js.map