import isString from 'lodash/isString'
import trim from 'lodash/trim'

const state = {
  query: {
    tabType: 'mall',
    pageNo: 1,
    pageSize: 20
  }
}

const mutations = {
  SET_SEARCH_DATA: (state, params) => {
    Object.keys(state.query).forEach(key => {
      if (key in params) {
        if (isString(params[key])) {
          state.query[key] = trim(params[key])
        } else {
          state.query[key] = params[key]
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
