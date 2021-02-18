import { ref, toRef, watch } from 'vue';
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
    return [
        refs,
        observable.pipe(...ops),
    ];
};
export const useRxRefs = (rxState, map) => {
    const [handlers, state, state$] = rxState;
    const [refs, newState$] = tapRefs(state$, map, state);
    return [
        refs,
        handlers,
        state,
        newState$,
    ];
};
export function observeRef(ref) {
    return untilUnmounted(new Observable(ctx => watch(ref, value => ctx.next(value))));
}
;
export function syncRef(state, prop, map, refValue) {
    const refVar = refValue ?? ref(map(state[prop]));
    observeRef(toRef(state, prop)).subscribe(_ => refVar.value = map(_));
    return refVar;
}
//# sourceMappingURL=rx-refs.js.map