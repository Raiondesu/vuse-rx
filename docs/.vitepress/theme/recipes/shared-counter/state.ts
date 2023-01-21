import { delay, of } from 'rxjs';
import { SimpleReducer, State, useRxState } from 'vuse-rx';

// This state will be shared between all its users
export const useSharedState = useRxState({ count: 0 });
export type CounterState = State<typeof useSharedState>;

// Shared delay logic
export const delayReduce = (
  reducer: SimpleReducer<CounterState>,
  timeout: number
) => (
  (state: CounterState) => of(reducer(state)).pipe(delay(timeout))
);
