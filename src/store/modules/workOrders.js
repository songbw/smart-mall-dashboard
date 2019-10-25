const state = {
  search: {
    pageIndex: 1,
    pageSize: 20,
    typeId: null,
    orderId: '',
    status: null,
    receiverPhone: '',
    timeStart: null,
    timeEnd: null,
    refundTimeStart: null,
    refundTimeEnd: null
  }
}

const mutations = {
  SET_SEARCH_DATA: (state, params) => {
    state.search = { ...state.search, ...params }
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
