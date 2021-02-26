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
const defineDesc = (ref, desc, descTo, map) => {
    Object.defineProperty(ref, 'value', {
        get: desc === null || desc === void 0 ? void 0 : desc.get,
        set: v => {
            var _a, _b, _c;
            (_a = desc.set) === null || _a === void 0 ? void 0 : _a.call(desc, v);
            (_b = descTo.set) === null || _b === void 0 ? void 0 : _b.call(descTo, (_c = map === null || map === void 0 ? void 0 : map(v)) !== null && _c !== void 0 ? _c : v);
        }
    });
};
export function syncRefs(ref1, mapTo, mapFrom, _ref2) {
    const ref2 = ref(_ref2 !== null && _ref2 !== void 0 ? _ref2 : mapTo === null || mapTo === void 0 ? void 0 : mapTo(ref1.value));
    const desc1 = Object.getOwnPropertyDescriptor(ref1, 'value');
    const desc2 = Object.getOwnPropertyDescriptor(ref2, 'value');
    if (desc1 && desc2) {
        defineDesc(ref1, desc1, desc2, mapTo);
        defineDesc(ref2, desc2, desc1, mapFrom);
    }
    return ref2;
}
//# sourceMappingURL=rx-refs.js.map