import { takeUntil } from 'rxjs/operators';
import { onUnmounted } from 'vue';
import { fromHook } from '../hooks/from';
export const pipeUntil = (hook) => takeUntil(fromHook(hook));
export const untilUnmounted = pipeUntil(onUnmounted);
//# sourceMappingURL=until.js.map