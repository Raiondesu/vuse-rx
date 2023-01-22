import { Observable } from 'rxjs';
import { getCurrentInstance } from 'vue';
export const fromHook = (hook) => new Observable(ctx => { getCurrentInstance() && hook(() => ctx.next()); });
//# sourceMappingURL=from.js.map