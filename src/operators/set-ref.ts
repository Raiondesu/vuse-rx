import { tap } from 'rxjs/operators';
import { Ref } from 'vue';

/**
 * Sets a ref's value to current observable value.
 */
export const setRef = <T>(ref: Ref<T>) => tap<T>({ next: v => ref.value = v });
