import { ref } from 'vue';
import { tap } from 'rxjs/operators';
export const tapRefs = (rxState, map) => {
    const ops = [];
    const refs = {};
    const [handlers, state, state$] = rxState;
    for (const key in map) {
        refs[key] = ref(map[key](state));
        ops.push(tap(state => refs[key].value = map[key](state)));
    }
    return [
        refs,
        handlers,
        state,
        state$.pipe(...ops),
    ];
};
//# sourceMappingURL=tap-refs.js.map