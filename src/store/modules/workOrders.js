const state = {
  search: {
    pageIndex: 1,
    pageSize: 20,
    typeId: null,
    status: null,
    mobile: '',
    createTimeStart: null,
    createTimeEnd: null
  }
}

const mutations = {
  SET_SEARCH_DATA: (state, params) => {
    Object.keys(state.search).forEach(key => {
      if (key in params) {
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
