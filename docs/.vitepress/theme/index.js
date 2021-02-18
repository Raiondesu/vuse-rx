import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import { useRxState } from '../../../dist/es';
import { map, tap } from 'rxjs/operators';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('CounterDemo', {
      setup: () => {
        const [{ increment }, state, state$] = useRxState({ count: 0 })({
          increment: () => state => ({ count: state.count + 1 })
        });

        state$.pipe(
          map(state => ({ count: state.count * 2 }))
        ).subscribe(state => console.log('doubled counter: ', state.count));

        return () => h('div', [
          h('p', ["Counter: ", state.count]),
          h('button', { onClick: increment }, 'increment')
        ]);
      }
    });
  }
};
