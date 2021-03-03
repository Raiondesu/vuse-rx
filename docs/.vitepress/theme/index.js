import DefaultTheme from 'vitepress/theme';
import CounterDemo from './recipes/counter.vue';
import StopwatchDemo from './recipes/stopwatch.vue';
import SyncRef from './recipes/sync-ref.vue';
import './custom.css';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('CounterDemo', CounterDemo);
    app.component('StopwatchDemo', StopwatchDemo);
    app.component('SyncRef', SyncRef);
  }
};
