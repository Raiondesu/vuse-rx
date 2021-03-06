"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refFrom = void 0;
const rxjs_1 = require("rxjs");
const vue_1 = require("vue");
function refFrom(arg, subArg) {
    const argIsProxy = vue_1.isProxy(arg);
    if (typeof arg === 'object' && !argIsProxy)
        try {
            const ref$ = vue_1.ref(subArg);
            rxjs_1.from(arg).subscribe(value => ref$.value = value);
            return ref$;
        }
        catch (_) { }
    return argIsProxy
        ? vue_1.toRef(arg, subArg)
        : vue_1.ref(arg);
}
exports.refFrom = refFrom;
//# sourceMappingURL=ref-from.js.map