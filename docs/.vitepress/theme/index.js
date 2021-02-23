import DefaultTheme from 'vitepress/theme';
import CounterDemo from './recipes/counter.vue';
import StopwatchDemo from './recipes/stopwatch.vue';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('CounterDemo', CounterDemo);
    app.component('StopwatchDemo', StopwatchDemo);
  }
};
