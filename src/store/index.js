import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import user from './modules/user'
import vendor from './modules/vendor'
import products from './modules/products'
import categories from './modules/categories'
import aggregations from './modules/aggregations'
import promotions from './modules/promotions'
import coupons from './modules/coupons'
import barterCards from './modules/barterCards'
import orders from './modules/orders'
import workOrders from './modules/workOrders'
import members from './modules/members'
import freight from './modules/freight'

if (!window.Vuex) Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const store = new Vuex.Store({
  modules: {
    app,
    user,
    vendor,
    products,
    categories,
    aggregations,
    promotions,
    coupons,
    barterCards,
    orders,
    workOrders,
    members,
    freight
  },
  getters,
  strict: debug
})

export default store
