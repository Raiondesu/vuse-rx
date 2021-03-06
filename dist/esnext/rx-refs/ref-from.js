import { from } from 'rxjs';
import { isProxy, ref, toRef } from 'vue';
export function refFrom(arg, subArg) {
    const argIsProxy = isProxy(arg);
    if (typeof arg === 'object' && !argIsProxy)
        try {
            const ref$ = ref(subArg);
            from(arg).subscribe(value => ref$.value = value);
            return ref$;
        }
        catch (_) { }
    return argIsProxy
        ? toRef(arg, subArg)
        : ref(arg);
}
//# sourceMappingURL=ref-from.js.map