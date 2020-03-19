import {
  suborder_status_waiting_deliver
} from '@/utils/constants'

const queryTemplate = {
  pageIndex: 1,
  pageSize: 20,
  aoyiId: '',
  tradeNo: '',
  subOrderId: '',
  mobile: '',
  receiverName: '',
  payDateStart: null,
  payDateEnd: null,
  completeDateStart: null,
  completeDateEnd: null,
  subStatus: -1,
  merchantId: -1,
  appId: 'all'
}

const deliveryQuery = {
  appId: 'all',
  subOrderId: '',
  mobile: '',
  receiverName: '',
  subStatus: suborder_status_waiting_deliver,
  payDateStart: null,
  payDateEnd: null,
  pageIndex: 1,
  pageSize: 20
}

const state = {
  search: {
    ...queryTemplate
  },
  deliveryQuery: {
    ...deliveryQuery
  }
}

const mutations = {
  SET_SEARCH_DATA: (state, params) => {
    state.search = { ...state.search, ...params }
  },
  RESET_SEARCH_DATA: state => {
    const params = { appId: state.search.appId }
    state.search = { ...queryTemplate, ...params }
  },
  SET_DELIVERY_QUERY_DATA: (state, params) => {
    state.deliveryQuery = { ...state.deliveryQuery, ...params }
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
