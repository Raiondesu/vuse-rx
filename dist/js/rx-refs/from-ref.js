"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromRef = void 0;
const rxjs_1 = require("rxjs");
const vue_1 = require("vue");
const until_1 = require("../operators/until");
function fromRef(ref, options) {
    return (0, until_1.untilUnmounted)(new rxjs_1.Observable(ctx => (0, vue_1.watch)(ref, value => ctx.next(value), options)));
}
exports.fromRef = fromRef;
;
//# sourceMappingURL=from-ref.js.map