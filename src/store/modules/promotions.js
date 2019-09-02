import sortBy from 'lodash/sortBy'
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
  deletePromotionTypeApi,
  createPromotionScheduleApi,
  deletePromotionScheduleApi
} from '@/api/promotions'

const promotionTemplate = {
  id: -1,
  name: '',
  promotionTypeId: null,
  tag: '',
  dailySchedule: false,
  startDate: '',
  endDate: '',
  discountType: 0,
  status: 1,
  promotionSkus: [],
  promotionSchedules: []
}

const state = {
  promotion: { ...promotionTemplate },
  promotionTypes: [],
  promotionTypeId: -1,
  conflictedMpus: []
}

const mutations = {
  RESET_DATA: state => {
    state.promotion = { ...promotionTemplate }
    state.promotion.promotionTypeId = state.promotionTypeId >= 0 ? state.promotionTypeId : null
    state.promotion.promotionSkus = []
    state.promotion.promotionSchedules = []
  },
  SET_DATA: (state, params) => {
    const keys = Object.keys(promotionTemplate)
    keys.forEach(key => {
      if (key in params) {
        state.promotion[key] = params[key]
      }
    })
    if (state.promotion.promotionSkus === null) {
      state.promotion.promotionSkus = []
    } else {
      state.promotion.promotionSkus = state.promotion.promotionSkus.map(sku => {
        const { price, discount, ...rest } = sku
        return {
          price: Number.parseFloat(price),
          discount: Number.parseFloat(discount),
          ...rest
        }
      })
    }
    if (state.promotion.promotionSchedules === null) {
      state.promotion.promotionSchedules = []
    } else {
      state.promotion.promotionSchedules = sortBy(state.promotion.promotionSchedules, ['schedule'])
    }
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
  },
  ADD_SCHEDULE: (state, params) => {
    state.promotion.promotionSchedules.push(params)
    state.promotion.promotionSchedules = sortBy(state.promotion.promotionSchedules, ['schedule'])
  },
  DELETE_SCHEDULE: (state, id) => {
    const schedules = state.promotion.promotionSchedules
    state.promotion.promotionSchedules = schedules.filter(item => item.id !== id)
  },
  SET_CONFLICTED_MPUS: (state, mpus) => {
    state.conflictedMpus = [...mpus]
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
    return new Promise((resolve, reject) => {
      addPromotionContentApi(params).then(response => {
        resolve(response.data.result)
      }).catch(error => {
        reject(error)
      })
    })
  },
  async updateContent({ commit }, params) {
    return new Promise((resolve, reject) => {
      updatePromotionContentApi(params).then(response => {
        resolve(response.data.result)
      }).catch(error => {
        reject(error)
      })
    })
  },
  async deleteContent({ commit }, params) {
    return new Promise((resolve, reject) => {
      deletePromotionContentApi(params).then(response => {
        resolve(response.data.result)
      }).catch(error => {
        reject(error)
      })
    })
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
  },
  async addScheduleTime({ commit }, params) {
    const { data } = await createPromotionScheduleApi(params)
    commit('ADD_SCHEDULE', { id: data.scheduleId, ...params })
    return data.scheduleId
  },
  async deleteScheduleTime({ commit }, params) {
    await deletePromotionScheduleApi(params)
    commit('DELETE_SCHEDULE', params.id)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
