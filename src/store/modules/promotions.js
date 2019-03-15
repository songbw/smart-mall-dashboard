import {
  getPromotionsApi,
  searchPromotionsApi,
  createPromotionApi,
  updatePromotionApi,
  getPromotionByIdApi,
  deletePromotionApi,
  addPromotionContentApi,
  updatePromotionContentApi,
  deletePromotionContentApi
} from '@/api/promotions'

const promotionTemplate = {
  id: -1,
  name: '',
  tag: '',
  startDate: '',
  endDate: '',
  promotionType: 0,
  status: 1,
  promotionSkus: []
}

const promotions = {
  state: {
    promotionList: [],
    totalNum: 0,
    promotion: promotionTemplate
  },
  mutations: {
    resetPromotion(state) {
      state.promotion = Object.assign({}, promotionTemplate, { promotionSkus: [] })
    },
    setPromotionList(state, data) {
      data.list.forEach(item => {
        if (item.promotionSkus === null) {
          item.promotionSkus = []
        }
        if (item.promotionType === null) {
          item.hasPromotionType = false
        } else {
          item.hasPromotionType = true
        }
      })

      state.promotionList = data.list
      state.totalNum = data.total
    },
    deletePromotionById(state, id) {
      const index = state.promotionList.findIndex(item => item.id === id)
      if (index >= 0) {
        state.promotionList.splice(index, 1)
      }
    },
    setPromotionData(state, data) {
      const promotion = state.promotionList.find(item => item.id === data.id)
      if (promotion) {
        if (data.promotionSkus && data.promotionSkus.length > 0) {
          if (promotion.promotionSkus === null) {
            promotion.promotionSkus = []
          }
          data.promotionSkus.forEach(item => {
            promotion.promotionSkus.push(item)
          })
        }
      } else {
        state.promotionList.push(data)
      }
    },
    updatePromotionInfo(state, params) {
      const promotion = state.promotionList.find(item => item.id === params.id)
      if (promotion) {
        if (params.hasOwnProperty('status')) {
          promotion.status = params.status
        }
        if (params.hasOwnProperty('name')) {
          promotion.name = params.name
        }
        if (params.hasOwnProperty('tag')) {
          promotion.tag = params.tag
        }
        if (params.hasOwnProperty('startDate')) {
          promotion.startDate = params.startDate
        }
        if (params.hasOwnProperty('endDate')) {
          promotion.endDate = params.endDate
        }
        if (params.hasOwnProperty('promotionType')) {
          promotion.promotionType = params.promotionType
        }
      }
    },
    setCurrentPromotion(state, id) {
      if (state.promotion === null || state.promotion.id !== id) {
        state.promotion = state.promotionList.find(item => item.id === id)
      }
    },
    setPromotionId(state, id) {
      state.promotion.id = id
    },
    setPromotionName(state, name) {
      state.promotion.name = name
    },
    setPromotionTag(state, tag) {
      state.promotion.tag = tag
    },
    setPromotionStartDate(state, date) {
      state.promotion.startDate = date
    },
    setPromotionEndDate(state, date) {
      state.promotion.endDate = date
    },
    setPromotionType(state, type) {
      state.promotion.promotionType = type
    },
    setPromotionStatus(state, status) {
      state.promotion.status = status
    },
    addPromotionContent(state, sku) {
      state.promotion.promotionSkus.push(sku)
    },
    deletePromotionContent(state, index) {
      state.promotion.promotionSkus.splice(index, 1)
    },
    setPromotionDiscount(state, params) {
      const sku = state.promotion.promotionSkus.find(item => item.skuid === params.skuid)
      if (sku) {
        sku.discount = params.discount
      }
    },
    setPromotionContentDiscount(state, params) {
      const index = params.index
      const value = params.value
      if (index < state.promotion.promotionSkus.length) {
        const sku = state.promotion.promotionSkus[index]
        sku.discount = value
      }
    }
  },
  actions: {
    createPromotion({ commit }, params) {
      return new Promise((resolve, reject) => {
        createPromotionApi(params).then(response => {
          const id = response.promotionId
          commit('setPromotionId', id)
          resolve(id)
        }).catch(error => {
          reject(error)
        })
      })
    },
    updatePromotion({ commit }, params) {
      return new Promise((resolve, reject) => {
        updatePromotionApi(params).then(response => {
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    getPromotions({ commit }, params) {
      return new Promise((resolve, reject) => {
        getPromotionsApi(params).then(response => {
          const data = response.result
          commit('setPromotionList', data)
          resolve(data.list.length)
        }).catch(error => {
          reject(error)
        })
      })
    },
    searchPromotions({ commit }, params) {
      return new Promise((resolve, reject) => {
        searchPromotionsApi(params).then(response => {
          const data = response.result
          commit('setPromotionList', data)
          resolve(data.list.length)
        }).catch(error => {
          reject(error)
        })
      })
    },
    findPromotionById({ commit }, params) {
      return new Promise((resolve, reject) => {
        getPromotionByIdApi(params).then(response => {
          const data = response.result
          commit('setPromotionData', data)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    deletePromotion({ commit }, params) {
      return new Promise((resolve, reject) => {
        deletePromotionApi(params).then(response => {
          commit('deletePromotionById', params.id)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    addPromotionContent({ commit }, params) {
      return new Promise((resolve, reject) => {
        addPromotionContentApi(params).then(response => {
          const data = response.result
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },
    updatePromotionContent({ commit }, params) {
      return new Promise((resolve, reject) => {
        updatePromotionContentApi(params).then(response => {
          const data = response.result
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },
    deletePromotionContent({ commit }, params) {
      return new Promise((resolve, reject) => {
        deletePromotionContentApi(params).then(response => {
          const data = response.result
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default promotions
