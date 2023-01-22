import { deepReplaceBuiltin } from './deepReplaceBuiltin';
export const deepReplaceArray = (state) => (mutation) => deepReplaceBuiltin.apply([Array], [state])(mutation);
//# sourceMappingURL=deepReplaceArray.js.map