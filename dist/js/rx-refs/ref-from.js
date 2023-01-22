"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refFrom = void 0;
const rxjs_1 = require("rxjs");
const vue_1 = require("vue");
const until_1 = require("../operators/until");
function refFrom(arg, subArg) {
    if (typeof arg === 'object' && !(0, vue_1.isProxy)(arg))
        try {
            const ref$ = (0, vue_1.ref)(subArg);
            (0, until_1.untilUnmounted)((0, rxjs_1.from)(arg)).subscribe({
                next: value => ref$.value = value
            });
            return ref$;
        }
        catch (_) { }
    return (0, vue_1.isProxy)(arg)
        ? (0, vue_1.toRef)(arg, subArg)
        : (0, vue_1.ref)(arg);
}
exports.refFrom = refFrom;
//# sourceMappingURL=ref-from.js.map