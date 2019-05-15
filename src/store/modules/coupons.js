import {
  getCouponsApi,
  searchCouponsApi,
  createCouponApi,
  getCouponByIdApi,
  deleteCouponApi,
  updateCouponApi,
  getCouponUsageByIdApi
} from '@/api/coupons'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import isString from 'lodash/isString'

const couponTemplate = {
  id: -1,
  name: '',
  releaseStartDate: null,
  releaseEndDate: null,
  releaseTotal: 0,
  effectiveStartDate: null,
  effectiveEndDate: null,
  excludeDates: [],
  category: null,
  tags: [],
  imageUrl: '',
  url: '',
  description: '',
  rules: {
    code: '',
    perLimited: 0,
    scopes: [],
    couponRules: {
      type: 0,
      fullReduceCoupon: {
        fullPrice: 0,
        reducePrice: 0
      },
      discountCoupon: {
        discountRatio: 1
      },
      cashCoupon: {
        amount: 0
      }
    },
    collect: {
      type: 1,
      points: 0
    },
    scenario: {
      type: 2,
      couponSkus: [],
      excludeSkus: [],
      categories: [],
    },
  },
  rulesDescription: ''
}

const parseCoupon = coupon => {
  const format = 'YYYY-MM-DD HH:mm:ss'
  if (isString(coupon.category)) {
    const cat = coupon.category
    delete coupon.category
    coupon.category = Number.parseInt(cat)
  }
  let momentDate = moment(coupon.releaseStartDate)
  if (momentDate.isValid()) {
    coupon.releaseStartDate = momentDate.format(format)
  }
  momentDate = moment(coupon.releaseEndDate)
  if (momentDate.isValid()) {
    coupon.releaseEndDate = momentDate.format(format)
  }
  momentDate = moment(coupon.effectiveStartDate)
  if (momentDate.isValid()) {
    coupon.effectiveStartDate = momentDate.format(format)
  }
  momentDate = moment(coupon.effectiveEndDate)
  if (momentDate.isValid()) {
    coupon.effectiveEndDate = momentDate.format(format)
  }
  if (coupon.excludeDates && Array.isArray(coupon.excludeDates)) {
    coupon.excludeDates = coupon.excludeDates
      .filter(exclude => exclude.hasOwnProperty('start') && exclude.hasOwnProperty('end'))
      .map(exclude => {
        const item = { start: '', end: '' }
        const start = moment(exclude.start)
        if (start.isValid()) {
          item.start = start.format(format)
        }
        const end = moment(exclude.end)
        if (end.isValid()) {
          item.end = end.format(format)
        }
        return item
      })
  } else {
    coupon.excludeDates = []
  }
  if (!isEmpty(coupon.tags)) {
    coupon.tags = coupon.tags.filter(tag => !isEmpty(tag)).map(tag => tag.trim())
  } else {
    coupon.tags = []
  }
  if (coupon.hasOwnProperty('rules')) {
    if (!isEmpty(coupon.rules.scopes)) {
      coupon.rules.scopes = coupon.rules.scopes.filter(scope => !isEmpty(scope)).map(scope => scope.trim())
    } else {
      coupon.rules.scopes = []
    }
    if (coupon.rules.hasOwnProperty('scenario')) {
      if (Array.isArray(coupon.rules.scenario.couponSkus) && coupon.rules.scenario.couponSkus.length > 0) {
        coupon.rules.scenario.couponSkus = coupon.rules.scenario.couponSkus
          .filter(skuId => !isEmpty(skuId))
          .map(skuId => skuId.trim())
      } else {
        coupon.rules.scenario.couponSkus = []
      }
      if (Array.isArray(coupon.rules.scenario.excludeSkus) && coupon.rules.scenario.excludeSkus.length > 0) {
        coupon.rules.scenario.excludeSkus = coupon.rules.scenario.excludeSkus
          .filter(skuId => !isEmpty(skuId))
          .map(skuId => skuId.trim())
      } else {
        coupon.rules.scenario.excludeSkus = []
      }
      if (Array.isArray(coupon.rules.scenario.brands) && coupon.rules.scenario.brands.length > 0) {
        coupon.rules.scenario.brands = coupon.rules.scenario.brands
          .filter(brand => !isEmpty(brand))
          .map(brand => brand.trim())
      } else {
        coupon.rules.scenario.brands = []
      }
      if (Array.isArray(coupon.rules.scenario.categories) && coupon.rules.scenario.categories.length > 0) {
        coupon.rules.scenario.categories = coupon.rules.scenario.categories
          .filter(category => !isEmpty(category))
          .map(category => category.trim())
          .map(category => isString(category) ? Number.parseInt(category) : category)
      }
    } else {
      coupon.rules.scenario = {}
    }
  } else {
    coupon.rules = {}
  }
}

const coupons = {
  state: {
    couponList: [],
    totalNum: 0,
    coupon: couponTemplate,
    query: {
      name: '',
      status: 0,
      type: 0,
      startDate: null,
      endDate: null,
      offset: 1,
      limit: 20
    },
    couponUsage: [],
    couponUsageTotal: 0
  },
  mutations: {
    resetCoupon(state) {
      state.coupon = Object.assign({}, couponTemplate)
    },
    setCouponList(state, data) {
      state.couponList = data.list
      state.couponList.forEach(coupon => parseCoupon(coupon))
      state.totalNum = data.total
    },
    updateCouponInList(state, params) {
      const index = state.couponList.findIndex(item => item.id === params.id)
      if (index >= 0) {
        state.couponList[index] = Object.assign(state.couponList[index], params)
      }
    },
    setCouponData(state, params) {
      parseCoupon(params)
      state.coupon = Object.assign(state.coupon, params)
    },
    setQueryData(state, params) {
      state.query = Object.assign(state.query, params)
    },
    setCouponUsage(state, data) {
      state.couponUsage = data.list
      state.couponUsageTotal = data.total
    }
  },
  actions: {
    getCoupons({ commit }, params) {
      return new Promise((resolve, reject) => {
        getCouponsApi(params).then(response => {
          const data = response.result
          commit('setCouponList', data)
          resolve(data.list.length)
        }).catch(error => {
          commit('setCouponList', { list: [], total: 0 })
          reject(error)
        })
      })
    },
    searchCoupons({ commit }, params) {
      return new Promise((resolve, reject) => {
        searchCouponsApi(params).then(response => {
          const data = response.result
          commit('setCouponList', data)
          resolve(data.list.length)
        }).catch(error => {
          commit('setCouponList', { list: [], total: 0 })
          reject(error)
        })
      })
    },
    createCoupon({ commit }, params) {
      return new Promise((resolve, reject) => {
        createCouponApi(params).then(response => {
          const id = response.id
          commit('setCouponData', { id })
          resolve(id)
        }).catch(error => {
          reject(error)
        })
      })
    },
    getCouponById({ commit }, params) {
      return new Promise((resolve, reject) => {
        getCouponByIdApi(params).then(response => {
          const data = response.result
          commit('setCouponData', data)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    deleteCouponById({ commit }, params) {
      return new Promise((resolve, reject) => {
        deleteCouponApi(params).then(() => {
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    updateCoupon({ commit }, params) {
      return new Promise((resolve, reject) => {
        updateCouponApi(params).then(response => {
          commit('updateCouponInList', params)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    getCouponUsageById({ commit }, params) {
      return new Promise((resolve, reject) => {
        getCouponUsageByIdApi(params).then(response => {
          const data = response.result
          commit('setCouponUsage', data)
          resolve(data.list.length)
        }).catch(error => {
          commit('setCouponUsage', { list: [], total: 0 })
          reject(error)
        })
      })
    }
  }
}

export default coupons
