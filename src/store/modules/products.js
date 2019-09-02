import isString from 'lodash/isString'
import trim from 'lodash/trim'

const queryTemplate = {
  offset: 1,
  limit: 20,
  query: '',
  skuid: '',
  brand: '',
  mpu: '',
  state: -2,
  vendorId: -1,
  firstCategoryId: null,
  secondCategoryId: null,
  thirdCategoryId: null
}
const state = {
  search: {
    ...queryTemplate
  },
  vendors: []
}

const mutations = {
  SET_SEARCH_DATA: (state, params) => {
    Object.keys(state.search).forEach(key => {
      if (key in params) {
        if (isString(params[key])) {
          state.search[key] = trim(params[key])
        } else {
          state.search[key] = params[key]
        }
      }
    })
  },
  RESET_SEARCH_DATA: state => {
    state.search = { ...queryTemplate }
  },
  SET_FIRST_CATEGORY_ID: (state, params) => {
    state.search.firstCategoryId = params.firstCategoryId
  },
  SET_SECOND_CATEGORY_ID: (state, params) => {
    state.search.secondCategoryId = params.secondCategoryId
  },
  SET_THIRD_CATEGORY_ID: (state, params) => {
    state.search.thirdCategoryId = params.thirdCategoryId
  },
  SET_VENDOR_OPTIONS: (state, options) => {
    state.vendors = options
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
