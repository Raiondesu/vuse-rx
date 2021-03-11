import { ref, watch } from 'vue';
export function syncRef(ref1, { to, from }, _ref2) {
    const ref2 = ref(_ref2 ?? ref1.value);
    if (to) {
        watch(ref1, v => ref2.value = to(v), this);
    }
    if (from) {
        watch(ref2, v => ref1.value = from(v), this);
    }
    return ref2;
}
syncRef.with = (options) => syncRef.bind(options);
//# sourceMappingURL=sync-ref.js.map