import {
  getPromotionByIdApi,
  createPromotionApi,
  updatePromotionApi,
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

const state = {
  promotion: { ...promotionTemplate }
}

const mutations = {
  RESET_DATA: state => {
    state.promotion = { ...promotionTemplate }
    state.promotion.promotionSkus = []
  },
  SET_DATA: (state, params) => {
    const keys = ['id', 'name', 'tag', 'startDate', 'endDate', 'promotionType', 'status', 'promotionSkus']
    keys.forEach(key => {
      if (key in params) {
        state.promotion[key] = params[key]
      }
    })
  },
  SET_SKU_DISCOUNT: (state, params) => {
    const sku = state.promotion.promotionSkus.find(item => item.mpu === params.mpu)
    if (sku) {
      sku.discount = params.discount
    }
  },
  SET_SKUS_DISCOUNT: (state, params) => {
    params.mpus.forEach(mpu => {
      const sku = state.promotion.promotionSkus.find(item => item.mpu === mpu)
      if (sku) {
        sku.discount = params.discount
      }
    })
  },
  ADD_SKUS: (state, skus) => {
    const current = state.promotion.promotionSkus
    state.promotion.promotionSkus = current.concat(skus)
  },
  DELETE_SKU_INDEX: (state, index) => {
    state.promotion.promotionSkus.splice(index, 1)
  },
  DELETE_SKUS: (state, mpus) => {
    const current = state.promotion.promotionSkus
    state.promotion.promotionSkus = current.filter(item => !mpus.includes(item.mpu))
  }
}

const actions = {
  async findById({ commit }, params) {
    const { data } = await getPromotionByIdApi(params)
    commit('SET_DATA', data.result)
  },
  async create({ commit }, params) {
    const { data } = await createPromotionApi(params)
    const id = data.promotionId
    commit('SET_DATA', { id })
    return id
  },
  async update({ commit }, params) {
    await updatePromotionApi(params)
  },
  async addContent({ commit }, params) {
    const { data } = await addPromotionContentApi(params)
    return data.result
  },
  async updateContent({ commit }, params) {
    const { data } = await updatePromotionContentApi(params)
    return data.result
  },
  async deleteContent({ commit }, params) {
    const { data } = await deletePromotionContentApi(params)
    return data.result
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
