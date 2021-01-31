import { NEVER, Subject } from 'rxjs';
import { getCurrentInstance, onUnmounted } from 'vue';
export const createOnDestroySubject = () => {
    if (!getCurrentInstance()) {
        return NEVER;
    }
    const onDestroy$ = new Subject();
    onUnmounted(() => {
        onDestroy$.next();
    });
    return onDestroy$.asObservable();
};
//# sourceMappingURL=util.js.map