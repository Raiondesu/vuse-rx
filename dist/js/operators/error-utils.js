"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorOperator = void 0;
const operators_1 = require("rxjs/operators");
const createErrorOperator = (operation) => (cb) => (operators_1.catchError((e, $) => { throw operation(e, $, cb); }));
exports.createErrorOperator = createErrorOperator;
//# sourceMappingURL=error-utils.js.map