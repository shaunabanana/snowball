import { createApp } from 'vue'
import { createPinia } from 'pinia';
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '@arco-design/web-vue/dist/arco.css';

import App from './App.vue'

const pinia = createPinia();

createApp(App)
  .use(pinia)
  .use(ArcoVue)
  .use(ArcoVueIcon)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
