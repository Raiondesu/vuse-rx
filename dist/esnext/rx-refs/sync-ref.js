import { ref, watch } from 'vue';
export function syncRef(ref1, maps, _ref2) {
    const ref2 = ref(_ref2 == null
        ? maps.to
            ? maps.to(ref1.value)
            : ref1.value
        : _ref2);
    for (const key in maps) {
        ref2[key] = {};
        bind(ref1, ref2, maps, key, this)();
    }
    return ref2;
}
syncRef.with = (...options) => {
    const opts = Object.assign({}, ...options);
    const f = syncRef.bind(opts);
    f.with = syncRef.with.bind(opts);
    return f;
};
const bind = (refBase, refDest, maps, dir, options) => refDest[dir].bind = (bindOptions) => {
    const { ref, map, watch: opts } = {
        ref: refBase,
        map: maps[dir],
        watch: options,
        ...bindOptions,
    };
    if (refDest[dir].stop) {
        refDest[dir].stop();
    }
    refDest[dir].stop = dir === 'to'
        ? watch(ref, v => refDest.value = map(v), Object.assign({}, options, opts))
        : watch(refDest, v => ref.value = map(v), Object.assign({}, options, opts));
};
//# sourceMappingURL=sync-ref.js.map