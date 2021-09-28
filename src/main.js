import Vue from 'vue';
import shortKey from 'vue-shortkey';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import i18n from './i18n';
import './plugins/mock';

Vue.config.productionTip = false;

Vue.use(shortKey);

new Vue({
    router,
    store,
    vuetify,
    i18n,
    render: (h) => h(App),
}).$mount('#app');
