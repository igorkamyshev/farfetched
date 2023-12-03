import DefaultTheme from 'vitepress/theme';
import LiveDemo from './LiveDemo.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    ctx.app.component('LiveDemo', LiveDemo);
  },
};
