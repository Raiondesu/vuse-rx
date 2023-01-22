"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapError = void 0;
const operators_1 = require("rxjs/operators");
const mapError = (cb) => ((0, operators_1.catchError)((e, $) => { throw cb(e, $); }));
exports.mapError = mapError;
//# sourceMappingURL=map-error.js.map