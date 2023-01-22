import { tap } from 'rxjs/operators';
export const setRef = (ref) => tap({ next: v => ref.value = v });
//# sourceMappingURL=set-ref.js.map