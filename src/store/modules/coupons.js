import {
  getCouponsApi,
  searchCouponsApi,
  createCouponApi,
  getCouponByIdApi,
  deleteCouponApi,
  updateCouponApi
} from '@/api/coupons'
import moment from 'moment'

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

const parseDates = coupon => {
  const format = 'YYYY-MM-DD HH:mm:ss'
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
    coupon.excludeDates.forEach(exclude => {
      const start = moment(exclude.start)
      if (start.isValid()) {
        exclude.start = start.format(format)
      }
      const end = moment(exclude.end)
      if (end.isValid()) {
        exclude.end = end.format(format)
      }
    })
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
  },
  mutations: {
    resetCoupon(state) {
      state.coupon = Object.assign({}, couponTemplate)
    },
    setCouponList(state, data) {
      state.couponList = data.list
      state.couponList.forEach(coupon => parseDates(coupon))
      state.totalNum = data.total
    },
    updateCouponInList(state, params) {
      const index = state.couponList.findIndex(item => item.id === params.id)
      if (index >= 0) {
        state.couponList[index] = Object.assign(state.couponList[index], params)
      }
    },
    setCouponData(state, params) {
      parseDates(params)
      state.coupon = Object.assign(state.coupon, params)
    },
    setQueryData(state, params) {
      state.query = Object.assign(state.query, params)
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
    }
  }
}

export default coupons
