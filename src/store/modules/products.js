const state = {
  search: {
    offset: 1,
    limit: 20,
    query: '',
    skuid: '',
    brand: '',
    state: -1
  }
}

const mutations = {
  SET_SEARCH_DATA: (state, params) => {
    Object.keys(state.search).forEach(key => {
      if (params.hasOwnProperty(key)) {
        state.search[key] = params[key]
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
