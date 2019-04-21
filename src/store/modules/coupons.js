import {
  getCouponsApi,
  searchCouponsApi,
  createCouponApi,
  getCouponByIdApi
} from '@/api/coupons'

const couponTemplate = {
  id: -1,
  name: '',
  releaseStartDate: null,
  releaseEndDate: null,
  releaseTotal: 0,
  limitPerUser: 0,
  priceBreak: 0,
  discount: 0,
  description: '',
  effectiveStartDate: null,
  effectiveEndDate: null,
  excludeDates: [],
  type: 1,
  couponSkus: [],
  excludeSkus: [],
  categories: [],
  rulesDescription: ''
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
  },
  mutations: {
    resetCoupon(state) {
      state.coupon = Object.assign({}, couponTemplate)
    },
    setCouponList(state, data) {
      state.couponList = data.list
      state.totalNum = data.total
    },
    setCouponData(state, params) {
      state.coupon = Object.assign(state.coupon, params)
    },
    setQueryData(state, params) {
      state.query = Object.assign(state.query, params)
    }
  },
  actions: {
    getCoupons({commit}, params) {
      return new Promise((resolve, reject) => {
        getCouponsApi(params).then(response => {
          const data = response.result
          commit('setCouponList', data)
          resolve(data.list.length)
        }).catch(error => {
          reject(error)
        })
      })
    },
    searchCoupons({commit}, params) {
      return new Promise((resolve, reject) => {
        searchCouponsApi(params).then(response => {
          const data = response.result
          commit('setCouponList', data)
          resolve(data.list.length)
        }).catch(error => {
          reject(error)
        })
      })
    },
    createCoupon({commit}, params) {
      return new Promise((resolve, reject) => {
        createCouponApi(params).then(response => {
          const id = response.id
          commit('setCouponData', {id})
          resolve(id)
        }).catch(error => {
          reject(error)
        })
      })
    },
    getCouponById({commit}, params) {
      return new Promise((resolve, reject) => {
        getCouponByIdApi(params).then(response => {
          const data = response.result
          if (data.couponSkus === null) {
            data.couponSkus = []
          }
          if (data.excludeSkus === null) {
            data.excludeSkus = []
          }
          if (data.categories === null) {
            data.categories = []
          }
          commit('setCouponData', data)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default coupons
