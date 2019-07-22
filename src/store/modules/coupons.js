import isString from 'lodash/isString'
import trim from 'lodash/trim'

const state = {
  search: {
    name: '',
    status: 0,
    type: 0,
    startDate: null,
    endDate: null,
    offset: 1,
    limit: 20
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
