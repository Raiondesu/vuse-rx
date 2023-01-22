"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepReplaceArray = void 0;
const deepReplaceBuiltin_1 = require("./deepReplaceBuiltin");
const deepReplaceArray = (state) => (mutation) => deepReplaceBuiltin_1.deepReplaceBuiltin.apply([Array], [state])(mutation);
exports.deepReplaceArray = deepReplaceArray;
//# sourceMappingURL=deepReplaceArray.js.map