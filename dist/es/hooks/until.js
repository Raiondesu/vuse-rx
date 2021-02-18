import { takeUntil } from 'rxjs/operators';
import { onUnmounted } from 'vue';
import { fromHook } from "./from.js";
export const pipeUntil = (hook) => takeUntil(fromHook(hook));
export const untilUnmounted = (obs) => obs.pipe(pipeUntil(onUnmounted));
//# sourceMappingURL=until.js.map