import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import user from './modules/user'
import brands from './modules/brands'
import categories from './modules/categories'
import products from './modules/products'
import aggregations from './modules/aggregations'
import promotions from './modules/promotions'
import coupons from './modules/coupons'
import getters from './getters'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production';

const store = new Vuex.Store({
  strict: debug,
  modules: {
    app,
    user,
    brands,
    categories,
    products,
    aggregations,
    promotions,
    coupons
  },
  getters
})

export default store
