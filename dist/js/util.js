"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnDestroySubject = void 0;
const rxjs_1 = require("rxjs");
const vue_1 = require("vue");
const createOnDestroySubject = () => {
    if (!vue_1.getCurrentInstance()) {
        return rxjs_1.NEVER;
    }
    const onDestroy$ = new rxjs_1.Subject();
    vue_1.onUnmounted(() => {
        onDestroy$.next();
    });
    return onDestroy$.asObservable();
};
exports.createOnDestroySubject = createOnDestroySubject;
//# sourceMappingURL=util.js.map