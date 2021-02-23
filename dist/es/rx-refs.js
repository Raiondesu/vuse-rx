import { isRef, ref, toRef, watch } from 'vue';
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
export function syncRef(state, prop, map, refValue) {
    const _map = (isRef(map) || !map) ? (_) => _ : map;
    const _refValue = refValue !== null && refValue !== void 0 ? refValue : (isRef(map) ? map : undefined);
    const refVar = _refValue !== null && _refValue !== void 0 ? _refValue : ref(_map(state[prop]));
    fromRef(toRef(state, prop)).subscribe(_ => refVar.value = _map(_));
    return refVar;
}
//# sourceMappingURL=rx-refs.js.map