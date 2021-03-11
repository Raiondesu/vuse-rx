import { from } from 'rxjs';
import { ref } from 'vue';
export function refsFrom(input, defaultValues) {
    const next = ref(defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.next);
    const error = ref(defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.error);
    const value$ = from(input);
    return {
        next,
        error,
        value$,
        subscription: value$.subscribe({
            next: v => next.value = v,
            error: v => error.value = v,
        })
    };
}
//# sourceMappingURL=refs-from.js.map