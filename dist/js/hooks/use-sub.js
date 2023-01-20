"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSubscription = void 0;
const vue_1 = require("vue");
const useSubscription = (subscrition) => (0, vue_1.onUnmounted)(() => subscrition.unsubscribe());
exports.useSubscription = useSubscription;
//# sourceMappingURL=use-sub.js.map