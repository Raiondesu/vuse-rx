import { Observable } from 'rxjs';
import { watch } from 'vue';
import { untilUnmounted } from '../operators/until';
export function fromRef(ref, options) {
    return untilUnmounted(new Observable(ctx => watch(ref, value => ctx.next(value), options)));
}
;
//# sourceMappingURL=from-ref.js.map