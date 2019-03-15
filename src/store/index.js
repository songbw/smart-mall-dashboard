import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import user from './modules/user'
import brands from './modules/brands'
import categories from './modules/categories'
import products from './modules/products'
import aggregations from './modules/aggregations'
import promotions from './modules/promotions'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  strict: true,
  modules: {
    app,
    user,
    brands,
    categories,
    products,
    aggregations,
    promotions
  },
  getters
})

export default store
