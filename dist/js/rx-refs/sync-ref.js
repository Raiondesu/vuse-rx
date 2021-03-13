"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncRef = void 0;
const vue_1 = require("vue");
function syncRef(ref1, maps, _ref2) {
    var _a, _b;
    const ref2 = vue_1.ref((_b = _ref2 !== null && _ref2 !== void 0 ? _ref2 : (_a = maps.to) === null || _a === void 0 ? void 0 : _a.call(maps, ref1.value)) !== null && _b !== void 0 ? _b : ref1.value);
    for (const key in maps) {
        ref2[key] = {};
        bind(ref1, ref2, maps, key, this)();
    }
    return ref2;
}
exports.syncRef = syncRef;
syncRef.with = (...options) => {
    const opts = Object.assign({}, ...options);
    const f = syncRef.bind(opts);
    f.with = syncRef.with.bind(opts);
    return f;
};
const bind = (refBase, refDest, maps, dir, options) => refDest[dir].bind = (bindOptions) => {
    const { ref, map, watch: opts } = Object.assign({ ref: refBase, map: maps[dir], watch: options }, bindOptions);
    if (refDest[dir].stop) {
        refDest[dir].stop();
    }
    refDest[dir].stop = dir === 'to'
        ? vue_1.watch(ref, v => refDest.value = map(v), Object.assign({}, options, opts))
        : vue_1.watch(refDest, v => ref.value = map(v), Object.assign({}, options, opts));
};
//# sourceMappingURL=sync-ref.js.map