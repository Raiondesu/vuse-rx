import { from } from 'rxjs';
import { isProxy, ref, toRef } from 'vue';
import { untilUnmounted } from '../operators/until';
export function refFrom(arg, subArg) {
    if (typeof arg === 'object')
        try {
            const ref$ = ref(subArg);
            untilUnmounted(from(arg)).subscribe({
                next: value => ref$.value = value
            });
            return ref$;
        }
        catch (_) { }
    return isProxy(arg)
        ? toRef(arg, subArg)
        : ref(arg);
}
//# sourceMappingURL=ref-from.js.map