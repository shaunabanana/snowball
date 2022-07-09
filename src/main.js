import { createApp } from 'vue';
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '@arco-design/web-vue/dist/arco.css';

import App from './App.vue';
import store from './store';

const app = createApp(App);

// Register additional dependencies.
app.use(store);
app.use(ArcoVue);
app.use(ArcoVueIcon);

app.mount('#app');
