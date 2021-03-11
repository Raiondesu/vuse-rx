import { tap } from 'rxjs/operators';
import { Ref } from 'vue';

export const setRef = <T>(ref: Ref<T>) => tap<T>(v => ref.value = v);
