import { createApp } from 'vue';
import ArcoVue from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';

import App from './App.vue';
import store from './store';

const app = createApp(App);

// Register additional dependencies.
app.use(store);
app.use(ArcoVue);

app.mount('#app');
