"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tapError = void 0;
const error_utils_1 = require("./error-utils");
exports.tapError = error_utils_1.createErrorOperator((e, $, cb) => (cb(e, $), e));
//# sourceMappingURL=tap-error.js.map