import Vue from 'vue'

import './plugins/element-ui'
import './plugins/localforage'
import './plugins/axios'
import './plugins/qriously'
import './plugins/v-charts'
import './plugins/scroll-to'

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
