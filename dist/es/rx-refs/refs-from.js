import { from } from 'rxjs';
import { ref } from 'vue';
export function refsFrom(input) {
    const next = ref();
    const error = ref();
    from(input).subscribe({
        next: v => next.value = v,
        error: v => error.value = v,
    });
    return { next, error };
}
//# sourceMappingURL=refs-from.js.map