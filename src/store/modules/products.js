const state = {
  search: {
    offset: 1,
    limit: 20,
    query: '',
    skuid: '',
    brand: '',
    state: -1,
    firstCategoryId: null,
    secondCategoryId: null,
    thirdCategoryId: null
  }
}

const mutations = {
  SET_SEARCH_DATA: (state, params) => {
    Object.keys(state.search).forEach(key => {
      if (params.hasOwnProperty(key)) {
        state.search[key] = params[key]
      }
    })
  },
  SET_FIRST_CATEGORY_ID: (state, params) => {
    state.search.firstCategoryId = params.firstCategoryId
  },
  SET_SECOND_CATEGORY_ID: (state, params) => {
    state.search.secondCategoryId = params.secondCategoryId
  },
  SET_THIRD_CATEGORY_ID: (state, params) => {
    state.search.thirdCategoryId = params.thirdCategoryId
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
