import {
  getProfileApi,
  createProfileApi,
  updateProfileApi,
  submitProfileApi
} from '@/api/vendor'

const state = {
  profile: {
    id: -1,
    name: '',
    address: '',
    industry: '', // 'FINANCE;GAME;TRAFFIC;LIFE;E_BUSINESS;SOCIAL;CATERERS;CAR;RECRUIT;OTHER'
    licenseUrl: '',
    status: 0, // 0:未创建 1:编辑中 2:神话中 3:审核通过 4:审核有问题
    comments: ''
  }
}

const mutations = {
  SET_VENDOR_PROFILE: (state, data) => {
    Object.keys(state.profile).forEach(key => {
      if (data.hasOwnProperty(key)) {
        state.profile[key] = data[key]
      }
    })
  }
}

const actions = {
  async getProfile({ commit, state }) {
    const { company } = await getProfileApi()
    commit('SET_VENDOR_PROFILE', company)
    return { status: company.status, id: company.id }
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
