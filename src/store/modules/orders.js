import isString from 'lodash/isString'
import trim from 'lodash/trim'

const queryTemplate = {
  pageIndex: 1,
  pageSize: 20,
  tradeNo: '',
  subOrderId: '',
  mobile: '',
  payDateStart: null,
  payDateEnd: null,
  subStatus: -1,
  merchantId: -1
}
const state = {
  search: {
    ...queryTemplate
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
  },
  RESET_SEARCH_DATA: state => {
    state.search = { ...queryTemplate }
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
