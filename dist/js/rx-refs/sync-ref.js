"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncRef = void 0;
const vue_1 = require("vue");
function syncRef(ref1, { to, from }, _ref2) {
    if (to && from) {
        return vue_1.computed({
            get: () => to(ref1.value),
            set: v => ref1.value = from(v),
        });
    }
    const ref2 = vue_1.ref(_ref2 !== null && _ref2 !== void 0 ? _ref2 : ref1.value);
    if (to) {
        vue_1.watch(ref1, v => ref2.value = to(v));
    }
    else if (from) {
        vue_1.watch(ref2, v => ref1.value = from(v));
    }
    return ref2;
}
exports.syncRef = syncRef;
//# sourceMappingURL=sync-ref.js.map