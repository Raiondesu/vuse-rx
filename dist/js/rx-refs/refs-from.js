"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refsFrom = void 0;
const rxjs_1 = require("rxjs");
const vue_1 = require("vue");
function refsFrom(input) {
    const next = vue_1.ref();
    const error = vue_1.ref();
    rxjs_1.from(input).subscribe({
        next: v => next.value = v,
        error: v => error.value = v,
    });
    return { next, error };
}
exports.refsFrom = refsFrom;
//# sourceMappingURL=refs-from.js.map