import sortBy from 'lodash/sortBy'
import moment from 'moment'
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
  updatePromotionScheduleApi,
  deletePromotionScheduleApi,
  getPromotionDefaultSchedulesApi,
  updatePromotionDefaultSchedulesApi
} from '@/api/promotions'

const promotionTemplate = {
  id: -1,
  name: '',
  promotionTypeId: null,
  tag: '',
  dailySchedule: false,
  startDate: '',
  endDate: '',
  accountType: 0,
  discountType: 0,
  status: 1,
  promotionSkus: [],
  promotionSchedules: []
}

const state = {
  query: {
    name: '',
    status: 0,
    dailySchedule: -1,
    accountType: -1,
    offset: 1,
    limit: 20
  },
  promotion: { ...promotionTemplate },
  promotionTypes: [],
  promotionTypeId: -1,
  conflictedMpus: [],
  defaultSchedules: []
}

const mutations = {
  SET_SEARCH_DATA: (state, params) => {
    state.query = Object.assign({}, state.query, params)
  },
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
        const { price, discount, promotionImage, ...rest } = sku
        return {
          price: Number.parseFloat(price),
          discount: Number.parseFloat(discount),
          promotionImage: promotionImage !== null ? promotionImage : '',
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
  SET_SKU_PROMOTION: (state, params) => {
    const { mpu, ...rest } = params
    const index = state.promotion.promotionSkus.findIndex(item => item.mpu === mpu)
    if (index >= 0) {
      const sku = state.promotion.promotionSkus[index]
      state.promotion.promotionSkus[index] = { ...sku, ...rest }
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
  UPDATE_SCHEDULE: (state, params) => {
    const found = state.promotion.promotionSchedules.find(item => item.id === params.id)
    if (found) {
      found.schedule = params.schedule
      found.startTime = params.startTime
      found.endTime = params.endTime
    }
  },
  DELETE_SCHEDULE: (state, id) => {
    const schedules = state.promotion.promotionSchedules
    state.promotion.promotionSchedules = schedules.filter(item => item.id !== id)
  },
  SET_CONFLICTED_MPUS: (state, mpus) => {
    state.conflictedMpus = [...mpus]
  },
  SET_DEFAULT_SCHEDULES: (state, schedules) => {
    state.defaultSchedules = schedules
  }
}

const actions = {
  async findById({ commit }, params) {
    const { code, msg, data } = await getPromotionByIdApi(params)
    if (code === 200) {
      commit('SET_DATA', data.result)
    }
    return { code, msg }
  },
  async create({ commit }, params) {
    const { code, msg, data } = await createPromotionApi(params)
    if (code === 200) {
      const id = data.promotionId
      commit('SET_DATA', { id, ...params })
      return { id }
    } else {
      return { id: -1, msg }
    }
  },
  async update({ commit }, params) {
    const { code, msg } = await updatePromotionApi(params)
    if (code === 200) {
      commit('SET_DATA', params)
    }
    return { code, msg }
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
    const { code, data } = await createPromotionScheduleApi(params)
    if (code === 200) commit('ADD_SCHEDULE', { id: data.scheduleId, ...params })
    return data.scheduleId
  },
  async updateScheduleTime({ commit }, params) {
    const { code } = await updatePromotionScheduleApi(params)
    if (code === 200) commit('UPDATE_SCHEDULE', { ...params })
    return code
  },
  async deleteScheduleTime({ commit }, params) {
    await deletePromotionScheduleApi(params)
    commit('DELETE_SCHEDULE', params.id)
  },
  async getDefaultSchedules({ commit }, params) {
    const { data } = await getPromotionDefaultSchedulesApi(params)
    if (data && data.result) {
      const schedules = data.result.initialSchedules
      if (Array.isArray(schedules)) {
        commit('SET_DEFAULT_SCHEDULES', schedules)
      }
    }
  },
  async updateDefaultSchedules({ commit }, params) {
    const { code } = await updatePromotionDefaultSchedulesApi(params)
    if (code === 200) {
      commit('SET_DEFAULT_SCHEDULES', params.initialSchedules)
    }
  },
  async clonePromotion({ commit }, params) {
    const format = 'YYYY-MM-DD HH:mm:ss'
    let newId = -1
    const srcRes = await getPromotionByIdApi({ id: params.id })
    if (srcRes.code === 200) {
      const srcPromotion = srcRes.data.result
      const newPromotion = {
        name: params.name,
        dailySchedule: srcPromotion.dailySchedule,
        startDate: srcPromotion.startDate,
        endDate: srcPromotion.endDate,
        accountType: srcPromotion.accountType,
        appId: params.appId
      }
      const newRes = await createPromotionApi(newPromotion)
      if (newRes.code === 200) {
        newId = newRes.data.promotionId
        let schedules = []
        if (srcPromotion.dailySchedule && Array.isArray(srcPromotion.promotionSchedules)) {
          schedules = srcPromotion.promotionSchedules.map(item => ({
            promotionId: newId,
            schedule: item.schedule,
            startTime: moment(item.startTime).format(format),
            endTime: moment(item.endTime).format(format)
          }))
          for (const schedule of schedules) {
            const scheduleRes = await createPromotionScheduleApi(schedule)
            if (scheduleRes.code === 200) {
              schedule.scheduleId = scheduleRes.data.scheduleId
            }
          }
        }
        const findNewScheduleId = scheduleId => {
          const scheduleItem = srcPromotion.promotionSchedules.find(item => item.id === scheduleId)
          const schedule = scheduleItem ? scheduleItem.schedule : null
          const newItem = schedule ? schedules.find(item => item.schedule === schedule) : null
          return newItem ? newItem.scheduleId : null
        }
        if (Array.isArray(srcPromotion.promotionSkus) && srcPromotion.promotionSkus.length > 0) {
          const content = {
            id: newId,
            promotionSkus: srcPromotion.promotionSkus.map(item => ({
              skuid: item.skuid,
              mpu: item.mpu,
              discount: item.discount,
              scheduleId: srcPromotion.dailySchedule ? findNewScheduleId(item.scheduleId) : -1,
              name: item.name,
              brand: item.brand,
              price: item.price,
              promotionImage: item.promotionImage,
              perLimited: item.perLimited
            }))
          }
          await addPromotionContentApi(content)
        }
      }
    }
    return newId
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
