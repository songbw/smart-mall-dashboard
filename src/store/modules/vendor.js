import {
  getProfileApi,
  getRenterProfileApi,
  createProfileApi,
  updateProfileApi,
  submitProfileApi
} from '@/api/vendor'
import { invalid_renter_id, platform_renter_id } from '@/utils/constants'

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
    id: invalid_renter_id
  }
}

const mutations = {
  SET_VENDOR_PROFILE: (state, data) => {
    Object.keys(state.profile).forEach(key => {
      if (key in data) {
        state.profile[key] = data[key]
      }
    })
    if ('renterId' in data) {
      state.renter.id = data.renterId
    }
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
      let renterId = invalid_renter_id
      const { company, renterList } = await getProfileApi()
      if (Array.isArray(renterList)) {
        const platformRenter = renterList.find(item => item.renterId === platform_renter_id)
        const ownRenter = renterList.find(item => item.renterId !== platform_renter_id)
        renterId = platformRenter ? platform_renter_id : ownRenter ? ownRenter.renterId : invalid_renter_id
      }
      commit('SET_VENDOR_PROFILE', { ...company, renterId })
      return { status: company.status, id: company.id, renterId }
    } catch (_) {
      commit('SET_VENDOR_PROFILE',
        {
          id: -1,
          name: '',
          address: '',
          industry: '',
          licenseUrl: '',
          status: 0,
          comments: '',
          renterId: invalid_renter_id
        }
      )
      return { status: 0, id: '-1', renterId: invalid_renter_id }
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
      return { status: 0, companyId: -1, renterId: invalid_renter_id }
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
