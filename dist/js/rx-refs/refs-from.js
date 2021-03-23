"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refsFrom = void 0;
const rxjs_1 = require("rxjs");
const vue_1 = require("vue");
const until_1 = require("../operators/until");
function refsFrom(input, defaultValues = {}) {
    const next = vue_1.ref(defaultValues.next);
    const error = vue_1.ref(defaultValues.error);
    const value$ = until_1.untilUnmounted(rxjs_1.from(input));
    return {
        next,
        error,
        value$,
        subscription: value$.subscribe({
            next: v => next.value = v,
            error: v => error.value = v,
        })
    };
}
exports.refsFrom = refsFrom;
//# sourceMappingURL=refs-from.js.map