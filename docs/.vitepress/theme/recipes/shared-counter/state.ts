import { delay, of } from 'rxjs';
import { SimpleReducer, State, useRxState } from 'vuse-rx';
import { setToWindow } from '../../set-window';

export const useSharedState = useRxState({ count: 0 });
export type CounterState = State<typeof useSharedState>;

export const delayReduce = (
  reducer: SimpleReducer<CounterState>,
  timeout: number
) => (
  (state: CounterState) => of(reducer(state)).pipe(delay(timeout))
);

setToWindow({
  useSharedState,
  delayReduce
});
