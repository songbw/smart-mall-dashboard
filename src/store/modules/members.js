const state = {
  membersQuery: {
    name: '',
    telephone: '',
    pageNo: 1,
    pageSize: 20
  },
  balancesQuery: {
    telephone: '',
    pageNo: 1,
    pageSize: 20
  }
}

const mutations = {
  SET_MEMBERS_QUERY: (state, params) => {
    state.membersQuery = { ...state.membersQuery, ...params }
  },
  RESET_MEMBERS_QUERY: state => {
    state.membersQuery.name = ''
    state.membersQuery.telephone = ''
    state.membersQuery.pageNo = 1
    state.membersQuery.pageSize = 20
  },
  SET_BALANCES_QUERY: (state, params) => {
    state.balancesQuery = { ...state.balancesQuery, ...params }
  },
  RESET_BALANCES_QUERY: state => {
    state.balancesQuery.telephone = ''
    state.balancesQuery.pageNo = 1
    state.balancesQuery.pageSize = 20
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
