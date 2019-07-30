import {
  getPromotionByIdApi,
  createPromotionApi,
  updatePromotionApi,
  addPromotionContentApi,
  updatePromotionContentApi,
  deletePromotionContentApi,
  getPromotionTypesApi,
  createPromotionTypeApi,
  updatePromotionTypeApi,
  deletePromotionTypeApi
} from '@/api/promotions'

const promotionTemplate = {
  id: -1,
  name: '',
  promotionTypeId: null,
  tag: '',
  startDate: '',
  endDate: '',
  discountType: 0,
  status: 1,
  promotionSkus: []
}

const state = {
  promotion: { ...promotionTemplate },
  promotionTypes: [],
  promotionTypeId: -1
}

const mutations = {
  RESET_DATA: state => {
    state.promotion = { ...promotionTemplate }
    state.promotion.promotionTypeId = state.promotionTypeId >= 0 ? state.promotionTypeId : null
    state.promotion.promotionSkus = []
  },
  SET_DATA: (state, params) => {
    const keys = Object.keys(promotionTemplate)
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
  },
  SET_TYPE_LIST: (state, types) => {
    state.promotionTypes = types
  },
  SET_CURRENT_TYPE: (state, typeId) => {
    state.promotionTypeId = typeId
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
    commit('SET_DATA', { id, ...params })
    return id
  },
  async update({ commit }, params) {
    await updatePromotionApi(params)
    commit('SET_DATA', params)
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
  },
  async getTypes({ commit }, params) {
    const { data } = await getPromotionTypesApi(params)
    commit('SET_TYPE_LIST', data.result.list)
    return data.result.total
  },
  async createType({ commit, state }, params) {
    const { data } = await createPromotionTypeApi(params)
    const id = data.id
    const list = state.promotionTypes.concat([{ id: id, typeName: params.typeName }])
    commit('SET_TYPE_LIST', list)
  },
  async updateType({ commit, state }, params) {
    await updatePromotionTypeApi(params)
    const list = state.promotionTypes.map(
      type => type.id === params.id ? { ...params } : { ...type }
    )
    commit('SET_TYPE_LIST', list)
  },
  async deleteType({ commit, state }, params) {
    await deletePromotionTypeApi(params)
    const list = state.promotionTypes.filter(type => type.id !== params.promotionTypeId)
    commit('SET_TYPE_LIST', list)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
