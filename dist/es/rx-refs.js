import { computed, ref, watch } from 'vue';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
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
//# sourceMappingURL=rx-refs.js.map