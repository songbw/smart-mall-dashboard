const queryTemplate = {
  pageIndex: 1,
  pageSize: 20,
  aoyiId: '',
  tradeNo: '',
  subOrderId: '',
  mobile: '',
  payDateStart: null,
  payDateEnd: null,
  completeDateStart: null,
  completeDateEnd: null,
  subStatus: -1,
  merchantId: -1,
  appId: 'all'
}
const state = {
  search: {
    ...queryTemplate
  }
}

const mutations = {
  SET_SEARCH_DATA: (state, params) => {
    state.search = { ...state.search, ...params }
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
