"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapError = void 0;
const error_utils_1 = require("./error-utils");
exports.mapError = error_utils_1.createErrorOperator((e, $, cb) => cb(e, $));
//# sourceMappingURL=map-error.js.map