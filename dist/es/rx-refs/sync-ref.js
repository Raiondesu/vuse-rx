import { computed, ref, watch } from 'vue';
export function syncRef(ref1, { to, from }, _ref2) {
    if (to && from) {
        return computed({
            get: () => to(ref1.value),
            set: v => ref1.value = from(v),
        });
    }
    const ref2 = ref(_ref2 !== null && _ref2 !== void 0 ? _ref2 : ref1.value);
    if (to) {
        watch(ref1, v => ref2.value = to(v));
    }
    else if (from) {
        watch(ref2, v => ref1.value = from(v));
    }
    return ref2;
}
//# sourceMappingURL=sync-ref.js.map