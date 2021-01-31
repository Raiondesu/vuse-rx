import { ref, Ref } from 'vue';
import { tap } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';
import { RxResult } from './use-rx';

export type RefsMap<O> = Record<string, (state: Readonly<O>) => any>;

export type RefsObj<T extends RefsMap<any>> = {
  [key in keyof T]: Ref<ReturnType<T[key]>>
};

export const tapRefs = <O, R, T extends RefsMap<O>>(
  rxState: RxResult<R, O>,
  map: T,
): [refs: RefsObj<T>, ...rx: RxResult<R, O>] => {
  const ops: OperatorFunction<O, O>[] = [];
  const refs = {} as RefsObj<T>;
  const [ handlers, state, state$ ] = rxState;

  for (const key in map) {
    refs[key] = ref(map[key](state));

    ops.push(tap(state => refs[key].value = map[key](state)));
  }

  return [
    refs,
    handlers,
    state,
    state$.pipe(...ops),
  ];
};
