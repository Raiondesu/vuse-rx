"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnDestroy$ = void 0;
const rxjs_1 = require("rxjs");
const vue_1 = require("vue");
const createOnDestroy$ = () => {
    if (!vue_1.getCurrentInstance()) {
        return rxjs_1.NEVER;
    }
    const onDestroy$ = new rxjs_1.Subject();
    vue_1.onUnmounted(() => {
        onDestroy$.next();
    });
    return onDestroy$.asObservable();
};
exports.createOnDestroy$ = createOnDestroy$;
//# sourceMappingURL=util.js.map