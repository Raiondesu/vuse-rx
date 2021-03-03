import { Observable } from 'rxjs';
import { watch } from 'vue';
import { untilUnmounted } from "../hooks/until.js";
export function fromRef(ref) {
    return untilUnmounted(new Observable(ctx => watch(ref, value => ctx.next(value))));
}
;
//# sourceMappingURL=from-ref.js.map