import {
  getProfileApi,
  createProfileApi,
  updateProfileApi,
  submitProfileApi
} from '@/api/vendor'

const state = {
  status: 0, // 0:未创建 1:编辑中 2:神话中 3:审核通过 4:审核有问题
  profile: {
    name: '',
    address: '',
    industry: '', // 'FINANCE;GAME;TRAFFIC;LIFE;E_BUSINESS;SOCIAL;CATERERS;CAR;RECRUIT;OTHER'
    licenseUrl: ''
  }
}

const mutations = {
  SET_VENDOR_STATUS(state, status) {
    state.status = status
  },
  SET_VENDOR_PROFILE(state, data) {
    if (data.hasOwnProperty('name')) {
      state.profile.name = data.name
    }
    if (data.hasOwnProperty('address')) {
      state.profile.address = data.address
    }
    if (data.hasOwnProperty('industry')) {
      state.profile.industry = data.industry
    }
    if (data.hasOwnProperty('licenseUrl')) {
      state.profile.licenseUrl = data.licenseUrl
    }
  }
}

const actions = {
  async getProfile({ commit, state }) {
    const data = await getProfileApi()
    commit('SET_VENDOR_STATUS', data.status)
    commit('SET_VENDOR_PROFILE', data.profile)
  },
  async createProfile({ commit, dispatch }, params) {
    const data = await createProfileApi(params)
    commit('SET_VENDOR_STATUS', data.status)
    commit('SET_VENDOR_PROFILE', params)
  },
  async updateProfile({ commit, dispatch }, params) {
    const data = await updateProfileApi(params)
    commit('SET_VENDOR_STATUS', data.status)
    commit('SET_VENDOR_PROFILE', params)
  },
  async submitProfile({ commit }) {
    const data = await submitProfileApi()
    commit('SET_VENDOR_STATUS', data.status)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
