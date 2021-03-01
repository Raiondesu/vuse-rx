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
    const ref2 = ref(_ref2 ?? map?.to?.(ref1.value) ?? ref1.value);
    bindRefs(ref1, ref2, map?.to ?? identity);
    if (!map || map?.from) {
        bindRefs(ref2, ref1, map?.from ?? identity);
    }
    return ref2;
}
//# sourceMappingURL=rx-refs.js.map