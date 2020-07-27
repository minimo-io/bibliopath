import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/bootstrap-vue'
import App from './App.vue'
import router from './router'
import store from './store'


Vue.prototype.$appDetails = {
  appName: "Bibliopath",
  appVersion: "0.1.20",
  appDevNameUrl: "https://minimo.io/en/",
  appAPIUri: "https://api.bibliopath.net"
}

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
