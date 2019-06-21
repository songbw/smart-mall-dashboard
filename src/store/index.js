import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import user from './modules/user'
import vendor from './modules/vendor'
import products from './modules/products'
import categories from './modules/categories'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  modules: {
    app,
    user,
    vendor,
    products,
    categories
  },
  getters,
  strict: debug
})

export default store
