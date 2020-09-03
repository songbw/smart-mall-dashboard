import {
  getProfileApi,
  getRenterProfileApi,
  createProfileApi,
  updateProfileApi,
  submitProfileApi
} from '@/api/vendor'

const state = {
  profile: {
    id: -2, // not fetched is -2, failed is -1
    name: '',
    address: '',
    industry: '', // 'FINANCE;GAME;TRAFFIC;LIFE;E_BUSINESS;SOCIAL;CATERERS;CAR;RECRUIT;OTHER'
    licenseUrl: '',
    status: 0, // 0:未创建 1:编辑中 2:神话中 3:审核通过 4:审核有问题
    comments: ''
  },
  renter: {
    id: -2
  }
}

const mutations = {
  SET_VENDOR_PROFILE: (state, data) => {
    Object.keys(state.profile).forEach(key => {
      if (key in data) {
        state.profile[key] = data[key]
      }
    })
  },
  SET_RENTER_PROFILE: (state, data) => {
    state.profile.id = data.companyId
    state.profile.name = data.renterName
    state.profile.status = data.status
    state.renter.id = data.renterId
  }
}

const actions = {
  async getProfile({ commit, state }) {
    try {
      const { company } = await getProfileApi()
      commit('SET_VENDOR_PROFILE', company)
      return { status: company.status, id: company.id }
    } catch (_) {
      commit('SET_VENDOR_PROFILE',
        {
          id: -1,
          name: '',
          address: '',
          industry: '',
          licenseUrl: '',
          status: 0,
          comments: ''
        }
      )
      return { status: 0, id: -1 }
    }
  },
  async getRenterProfile({ commit }) {
    try {
      const { code, data } = await getRenterProfileApi()
      if (code === 200) {
        commit('SET_RENTER_PROFILE', data)
      }
      return { status: data.status, companyId: data.companyId, renterId: data.renterId }
    } catch (_) {
      return { status: 0, companyId: -1, renterId: -1 }
    }
  },
  async createProfile({ commit, dispatch }, params) {
    const data = await createProfileApi(params)
    commit('SET_VENDOR_PROFILE', { ...params, status: data.status })
  },
  async updateProfile({ commit, dispatch }, params) {
    const data = await updateProfileApi(params)
    commit('SET_VENDOR_PROFILE', { ...params, status: data.status })
  },
  async submitProfile({ commit }) {
    const data = await submitProfileApi()
    commit('SET_VENDOR_PROFILE', { status: data.status })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
