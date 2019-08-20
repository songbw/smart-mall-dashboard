import isString from 'lodash/isString'
import trim from 'lodash/trim'

const state = {
  search: {
    pageIndex: 1,
    pageSize: 20,
    typeId: null,
    status: null,
    mobile: '',
    timeStart: null,
    timeEnd: null
  }
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
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
