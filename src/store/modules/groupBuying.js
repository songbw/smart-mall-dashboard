import {
  getGroupBuyingListApi,
} from '@/api/groupBuying'

const groupBuyings = {
  state: {
    campaignList: [],
    totalNum: 0,
    query: {
      name: '',
      status: 0,
      startDate: null,
      endDate: null,
      offset: 1,
      limit: 20
    },
    groupUsages: [],
    groupsUsageTotal: 0
  },
  mutations: {
    setGroupBuyingList(state, data) {
      state.campaignList = data.list
      state.totalNum = data.total
    },
    setGroupBuyingQueryData(state, params) {
      state.query = Object.assign(state.query, params)
    },
  },
  actions: {
    getGroupBuyingList({ commit }, params) {
      return new Promise((resolve, reject) => {
        getGroupBuyingListApi(params).then(response => {
          const data = response.result
          commit('setGroupBuyingList', data)
          resolve(data.list.length)
        }).catch(error => {
          commit('setGroupBuyingList', { list: [], total: 0 })
          reject(error)
        })
      })
    }
  }
}

export default groupBuyings
