import localForage from 'localforage'
import {
  getCategoryInfoApi,
  getMainCategoriesApi
} from '@/api/categories'
import {
  storage_product_categories
} from '@/utils/constants'

const state = {
  dataLoaded: false,
  dataLoading: false,
  allData: []
}

const mutations = {
  SET_DATA_LOADED: (state, loaded) => {
    state.dataLoaded = loaded
  },
  SET_DATA_IS_LOADING: (state, loading) => {
    state.dataLoading = loading
  },
  SET_ALL_DATA: (state, data) => {
    state.allData = data
  }
}

const actions = {
  async getAllData({ dispatch, commit, state }) {
    commit('SET_DATA_LOADED', false)
    commit('SET_DATA_IS_LOADING', true)
    let total = 0
    let allData = null
    try {
      allData = await localForage.getItem(storage_product_categories)
      if (allData === null) {
        const { data } = await getMainCategoriesApi({ offset: 1, limit: 1000 })
        const firstClassList = data.result.list
        for (const item of firstClassList) {
          const categoryParams = {
            id: item.categoryId,
            includeSub: true
          }
          const category = await dispatch('getCategoryDataByID', categoryParams)
          if (category.length > 0) {
            const subCategory = category[0]
            subCategory.subs.forEach(sec => {
              sec.subs.forEach(third => {
                delete third.subs
              })
            })
            item.subs = subCategory.subs
          }
        }
        await localForage.setItem(storage_product_categories, firstClassList)
        allData = firstClassList
        total = data.result.total
      } else {
        total = allData.length
      }
      commit('SET_ALL_DATA', allData)
      commit('SET_DATA_LOADED', true)
    } catch (e) {
      console.warn(`Store categories :${e}`)
    } finally {
      commit('SET_DATA_IS_LOADING', false)
    }
    return total
  },
  async getCategoryDataByID({ commit }, params) {
    const { data } = await getCategoryInfoApi(params)
    return data.result
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
