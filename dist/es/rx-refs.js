import { ref, watch } from 'vue';
import { tap } from 'rxjs/operators';
import { identity, Observable } from 'rxjs';
import { untilUnmounted } from "./hooks/until.js";
export const tapRefs = (observable, map, initialState) => {
    const ops = [];
    const refs = {};
    for (const key in map) {
        refs[key] = ref(map[key](initialState));
        ops.push(tap(state => refs[key].value = map[key](state)));
    }
    return {
        refs,
        state$: observable.pipe(...ops),
    };
};
export const useRxRefs = (rxState, map) => {
    const { actions, state, state$ } = rxState;
    const { refs, state$: newState$ } = tapRefs(state$, map, state);
    return {
        refs,
        actions,
        state,
        state$: newState$,
    };
};
export function fromRef(ref) {
    return untilUnmounted(new Observable(ctx => watch(ref, value => ctx.next(value))));
}
;
export const bindRefs = (ref1, ref2, mapValue) => watch(ref1, _ => ref2.value = mapValue(_));
export function syncRef(ref1, map, _ref2) {
    var _a, _b, _c, _d;
    const ref2 = ref((_b = _ref2 !== null && _ref2 !== void 0 ? _ref2 : (_a = map === null || map === void 0 ? void 0 : map.to) === null || _a === void 0 ? void 0 : _a.call(map, ref1.value)) !== null && _b !== void 0 ? _b : ref1.value);
    bindRefs(ref1, ref2, (_c = map === null || map === void 0 ? void 0 : map.to) !== null && _c !== void 0 ? _c : identity);
    if (!map || (map === null || map === void 0 ? void 0 : map.from)) {
        bindRefs(ref2, ref1, (_d = map === null || map === void 0 ? void 0 : map.from) !== null && _d !== void 0 ? _d : identity);
    }
    return ref2;
}
//# sourceMappingURL=rx-refs.js.map