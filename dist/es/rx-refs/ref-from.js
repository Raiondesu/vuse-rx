import { from } from 'rxjs';
import { isProxy, ref, toRef } from 'vue';
export function refFrom(arg, subArg) {
    if (typeof arg === 'object')
        try {
            const ref$ = ref(subArg);
            from(arg).subscribe(value => ref$.value = value);
            return ref$;
        }
        catch (_) { }
    return isProxy(arg)
        ? toRef(arg, subArg)
        : ref(arg);
}
//# sourceMappingURL=ref-from.js.map