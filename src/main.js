import Vue from 'vue'
import App from './App.vue'
import router from './router'

import Ionic from '@ionic/vue';
import "@ionic/core/css/core.css";
import '@ionic/core/css/ionic.bundle.css';

Vue.use(Ionic);
Vue.config.ignoredElements = [/^ion-/]

// load icons ------------------------------------
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
const currentIcons = Object.keys(allIcons).map(i => {
  const key = i.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
  if(typeof allIcons[i] === 'string') {
    return {
      [key]: allIcons[i],
    }
  }
  return {
    ['ios-' + key]: allIcons[i].ios,
    ['md-' + key]: allIcons[i].md,
  };
});

const iconsObject = Object.assign({}, ...currentIcons);
addIcons(iconsObject);
// end load icons --------------------------------

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
