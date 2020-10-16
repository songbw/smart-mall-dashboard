import {
  getAllCategoriesApi,
  getCategoryInfoApi,
  updateCategoryInfoApi,
  searchCategoryInfoApi,
  createCategoryApi,
  deleteCategoryApi,
  getCategoriesByAppIdApi,
  addCategoriesToAppIdApi,
  deleteCategoriesFromAppIdApi,
  updateCategoriesInAppIdApi
} from '@/api/categories'

const findCategoryByRelationID = (categoryTree, relation) => {
  const parentCategory = categoryTree.find(
    item => item.categoryId === relation.parentId)
  if (parentCategory) {
    return parentCategory.subs.find(
      item => item.categoryId === relation.categoryId)
  }
  return null
}

const deleteCategoryFromTree = (tree, category) => {
  const index = tree.findIndex(item => item.categoryId === category.categoryId)
  if (index >= 0) {
    tree.splice(index, 1)
  }
}
const deleteCategoryFromParent = (tree, category) => {
  const parent = tree.find(item => item.categoryId === category.parentId)
  if (parent) {
    const index = parent.subs.findIndex(
      item => item.categoryId === category.categoryId)
    if (index >= 0) {
      parent.subs.splice(index, 1)
      parent.subTotal--
    }
  }
}

const couldChangeKeys = ['categoryName', 'categoryIcon', 'sortOrder', 'isShow']

const state = {
  dataLoaded: false,
  dataLoading: false,
  categoriesTree: [],
  secondClassTree: [],
  thirdClassList: [],
  appIdList: []
}

const mutations = {
  SET_DATA_LOADED: (state, loaded) => {
    state.dataLoaded = loaded
  },
  SET_DATA_IS_LOADING: (state, loading) => {
    state.dataLoading = loading
  },
  SET_ALL_DATA: (state, data) => {
    state.categoriesTree = data.firstClassList
    state.secondClassTree = data.secondClassList
    state.thirdClassList = data.thirdClassList
  },
  UPDATE_CATEGORY_DATA: (state, params) => {
    const categoryId = params.categoryId
    const parentId = params.parentId
    const classId = params.categoryClass
    let category = null
    switch (classId) {
      case '1': {
        category = state.categoriesTree.find(
          item => item.categoryId === categoryId)
        break
      }
      case '2': {
        category = state.secondClassTree.find(
          item => item.categoryId === categoryId)
        break
      }
      case '3': {
        category = findCategoryByRelationID(state.secondClassTree, {
          parentId,
          categoryId
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
  },
  ADD_CATEGORY: (state, category) => {
    const classId = category.categoryClass
    switch (classId) {
      case '1': {
        if (category.subs === null) {
          category.subs = []
          category.subTotal = 0
        }
        state.categoriesTree.push(category)
        break
      }
      case '2': {
        if (category.subs === null) {
          category.subs = []
          category.subTotal = 0
        }
        const parent = state.categoriesTree.find(
          item => item.categoryId === category.parentId)
        if (parent) {
          parent.subs.push(category)
          parent.subTotal++
          state.secondClassTree.push(category)
        }
        break
      }
      case '3': {
        const parent = state.secondClassTree.find(
          item => item.categoryId === category.parentId)
        if (parent) {
          parent.subs.push(category)
          parent.subTotal++
          delete category.subs
          delete category.subTotal
        }
        break
      }
      default:
        console.warn('Category unknown class:' + classId)
        break
    }
  },
  DELETE_CATEGORY: (state, category) => {
    const classId = category.categoryClass
    switch (classId) {
      case '1': {
        deleteCategoryFromTree(state.categoriesTree, category)
        break
      }
      case '2': {
        deleteCategoryFromParent(state.categoriesTree, category)
        deleteCategoryFromTree(state.secondClassTree, category)
        break
      }
      case '3': {
        deleteCategoryFromParent(state.secondClassTree, category)
        break
      }
      default:
        console.warn('Category unknown class:' + classId)
        break
    }
  },
  SET_APP_ID_LIST: (state, data) => {
    state.appIdList = Array.isArray(data) ? data : []
  }
}

const actions = {
  async getAllData({ commit }, params) {
    commit('SET_DATA_LOADED', false)
    commit('SET_DATA_IS_LOADING', true)
    let total = 0
    try {
      commit('SET_ALL_DATA', { firstClassList: [], secondClassList: [], thirdClassList: [] })

      const { code, data } = await getAllCategoriesApi()
      const allData = code === 200 ? data.result : []
      const firstClassList = []
      const secondClassList = []
      const thirdClassList = []
      for (const item of allData) {
        switch (item.categoryClass) {
          case '1': {
            firstClassList.push(item)
            if (item.subs === null) {
              item.subs = []
            }
            break
          }
          case '2': {
            const first = firstClassList.find(
              category => category.categoryId === item.parentId)
            if (first) {
              first.subs.push(item)
              secondClassList.push(item)
              if (item.subs === null) {
                item.subs = []
              }
            }
            break
          }
          case '3': {
            const second = secondClassList.find(
              category => category.categoryId === item.parentId)
            if (second) {
              second.subs.push(item)
              thirdClassList.push(item)
              delete item.subs
              delete item.subTotal
            }
            break
          }
          default:
            break
        }
      }
      for (const category of firstClassList) {
        category.subTotal = category.subs.length
      }
      for (const category of secondClassList) {
        category.subTotal = category.subs.length
      }
      total = firstClassList.length

      commit('SET_ALL_DATA', { firstClassList, secondClassList, thirdClassList })
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
    const values = { categoryId: params.categoryId }
    couldChangeKeys.forEach(key => {
      if (key in params) {
        values[key] = params[key]
        if (key === 'isShow') {
          values[key] = !params[key]
        }
      }
    })
    await updateCategoryInfoApi(values)
    commit('UPDATE_CATEGORY_DATA', Object.assign({}, params, values))
  },
  async searchCategoryInfo({ commit }, params) {
    const { data } = await searchCategoryInfoApi(params)
    return data.result
  },
  async createCategory({ commit, dispatch }, params) {
    const value = { ...params }
    value.isShow = !params.isShow
    const { data } = await createCategoryApi(value)
    const categoryParams = {
      id: data.categoryId,
      includeSub: false
    }
    const category = await dispatch('getDataByID', categoryParams)
    commit('ADD_CATEGORY', category[0])
  },
  async deleteCategory({ commit }, params) {
    await deleteCategoryApi({ id: params.categoryId })
    commit('DELETE_CATEGORY', params)
  },
  async getCategoryDataByAppId({ commit }, params) {
    let list = []
    try {
      commit('SET_DATA_IS_LOADING', true)
      const { code, data } = await getCategoriesByAppIdApi(params)
      if (code === 200) {
        list = data
      }
    } catch (e) {
      console.warn('Get category by app id error:' + e)
    } finally {
      commit('SET_APP_ID_LIST', list)
      commit('SET_DATA_IS_LOADING', false)
    }
  },
  async addCategoriesToAppId({ commit }, params) {
    let ret = false
    try {
      commit('SET_DATA_IS_LOADING', true)
      const { code } = await addCategoriesToAppIdApi(params)
      if (code === 200) {
        ret = true
      }
    } catch (e) {
      console.warn('Add category to app id error:' + e)
    } finally {
      commit('SET_DATA_IS_LOADING', false)
    }
    return ret
  },
  async deleteCategoryFromAppId({ commit }, params) {
    let ret = false
    try {
      commit('SET_DATA_IS_LOADING', true)
      const { code } = await deleteCategoriesFromAppIdApi(params)
      if (code === 200) {
        ret = true
      }
    } catch (e) {
      console.warn('Delete category from app id error:' + e)
    } finally {
      commit('SET_DATA_IS_LOADING', false)
    }
    return ret
  },
  async updateCategoriesInAppId({ commit }, params) {
    let ret = false
    try {
      commit('SET_DATA_IS_LOADING', true)
      const { isShow, ...rest } = params
      const { code } = await updateCategoriesInAppIdApi([{ isShow: isShow ? 0 : 1, ...rest }])
      if (code === 200) {
        ret = true
      }
    } catch (e) {
      console.warn('Update category in app id error:' + e)
    } finally {
      commit('SET_DATA_IS_LOADING', false)
    }
    return ret
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
