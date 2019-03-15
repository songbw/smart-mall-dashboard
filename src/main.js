import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n
import '@/styles/index.scss' // global css
import App from './App'
import router from './router'
import store from './store'
import VueScrollTo from 'vue-scrollto'
import '@/icons' // icon
import '@/permission' // permission control
import i18n from './i18n'
import VueQriously from 'vue-qriously'

Vue.use(VueQriously)
Vue.use(VueScrollTo)
Vue.use(ElementUI, { locale })

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})
