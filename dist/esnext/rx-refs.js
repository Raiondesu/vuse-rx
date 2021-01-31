import { ref } from 'vue';
import { tap } from 'rxjs/operators';
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
//# sourceMappingURL=rx-refs.js.map