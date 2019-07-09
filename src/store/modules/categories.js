import localForage from 'localforage'
import {
  getCategoryInfoApi,
  getMainCategoriesApi,
  updateCategoryInfoApi,
  searchCategoryInfoApi
} from '@/api/categories'
import {
  storage_product_categories
} from '@/utils/constants'

const findCategoryByRelationID = (allClassesData, relation) => {
  const grandCategory = allClassesData.find(item => item.categoryId === relation.grandID)
  if (relation.parentID) {
    if (grandCategory) {
      const parentCategory = grandCategory.subs.find(item => item.categoryId === relation.parentID)
      if (relation.childID) {
        return parentCategory.subs.find(item => item.categoryId === relation.childID)
      } else {
        return parentCategory
      }
    } else {
      return null
    }
  } else {
    return grandCategory
  }
}

const couldChangeKeys = ['categoryIcon', 'sortOrder']

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
  },
  UPDATE_CATEGORY_DATA: (state, params) => {
    const categoryID = params.categoryId
    const parentID = params.parentId
    const grandID = params.grandId
    const classID = params.categoryClass
    let category = null
    switch (classID) {
      case '1': {
        category = findCategoryByRelationID(state.allData, {
          grandID: categoryID
        })
        break
      }
      case '2': {
        category = findCategoryByRelationID(state.allData, {
          grandID: parentID, parentID: categoryID
        })
        break
      }
      case '3': {
        category = findCategoryByRelationID(state.allData, {
          grandID: grandID,
          parentID: parentID,
          childID: categoryID
        })
        break
      }
    }
    if (category) {
      couldChangeKeys.forEach(key => {
        if (key in params) {
          category[key] = params[key]
        }
      })
    }
  }
}

const actions = {
  async getAllData({ dispatch, commit, state }, params) {
    commit('SET_DATA_LOADED', false)
    commit('SET_DATA_IS_LOADING', true)
    let total = 0
    let allData = null
    try {
      if (params && params.clearCache) {
        await localForage.removeItem(storage_product_categories)
      } else {
        allData = await localForage.getItem(storage_product_categories)
      }
      if (allData === null) {
        const { data } = await getMainCategoriesApi({ offset: 1, limit: 1000 })
        const firstClassList = data.result.list
        for (const item of firstClassList) {
          const categoryParams = {
            id: item.categoryId,
            includeSub: true
          }
          const category = await dispatch('getDataByID', categoryParams)
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
  async getDataByID({ commit }, params) {
    const { data } = await getCategoryInfoApi(params)
    return data.result
  },
  async updateCategoryInfo({ commit, state }, params) {
    await updateCategoryInfoApi(params)
    commit('UPDATE_CATEGORY_DATA', params)
    await localForage.setItem(storage_product_categories, state.allData)
  },
  async searchCategoryInfo({ commit }, params) {
    const { data } = await searchCategoryInfoApi(params)
    return data.result
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
