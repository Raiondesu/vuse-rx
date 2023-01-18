import { from } from 'rxjs';
import { ref } from 'vue';
import { untilUnmounted } from '../operators/until';
export function refsFrom(input, defaultValues = {}) {
    const next = ref(defaultValues.next);
    const error = ref(defaultValues.error);
    const value$ = untilUnmounted(from(input));
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