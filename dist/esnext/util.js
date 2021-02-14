import ifConst from 'if-const';
import { Observable } from 'rxjs';
import { getCurrentInstance, onUnmounted } from 'vue';
export const createOnDestroy$ = () => new Observable(ctx => ifConst(getCurrentInstance(), inst => {
    onUnmounted(() => {
        ctx.next();
    }, inst);
}));
//# sourceMappingURL=util.js.map