import DefaultTheme from 'vitepress/theme';
import CounterDemo from './recipies/counter.vue';
import StopwatchDemo from './recipies/stopwatch.vue';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('CounterDemo', CounterDemo);
    app.component('StopwatchDemo', StopwatchDemo);
  }
};
