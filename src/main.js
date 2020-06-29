import Vue from 'vue'
import App from './App.vue'
import Ionic from '@ionic/vue'
import '@ionic/core/css/ionic.bundle.css';
import router from './router'

Vue.use(Ionic)

Vue.config.productionTip = false



new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
