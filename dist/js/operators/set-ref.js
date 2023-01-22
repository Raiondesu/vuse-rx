"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRef = void 0;
const operators_1 = require("rxjs/operators");
const setRef = (ref) => (0, operators_1.tap)({ next: v => ref.value = v });
exports.setRef = setRef;
//# sourceMappingURL=set-ref.js.map