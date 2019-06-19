import localForage from 'localforage'
import {
  loginApi,
  registerApi,
  getVerificationCodeApi,
  getRoleApi,
  logoutApi
} from '@/api/auth'

import {
  storage_key_token,
  storage_key_name,
  storage_key_role
} from '@/utils/constants'

const state = {
  token: '',
  name: '',
  phone: '',
  role: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_PHONE: (state, phone) => {
    state.phone = phone
  },
  SET_ROLE: (state, role) => {
    state.role = role
  }
}

const actions = {
  async login({ commit }, userInfo) {
    const username = userInfo.username.trim()
    const password = userInfo.password.trim()
    const data = await loginApi({ name: username, password: password })
    commit('SET_NAME', username)
    commit('SET_TOKEN', data.token)
    commit('SET_PHONE', data.phone || '')
    commit('SET_ROLE', '')

    await localForage.setItem(storage_key_token, data.token)
    await localForage.setItem(storage_key_name, username)
    return data.token
  },

  async register({ commit }, params) {
    const name = params.username.trim()
    const phone = params.phone
    const code = params.code
    const data = await registerApi({ name, phone, password: params.password.trim(), code })
    return data.token
  },

  async getVerificationCode({ commit }, params) {
    const data = await getVerificationCodeApi({ phone: params.phone })
    return data.code
  },

  async getRole({ commit, state }) {
    const data = await getRoleApi()
    commit('SET_ROLE', data.role)
    await localForage.setItem(storage_key_role, data.role)
    return data.role
  },

  async logout({ commit, dispatch }) {
    try {
      await logoutApi()
    } catch (e) {
      console.warn('Store user logout:' + e)
    } finally {
      await dispatch('resetUser')
    }
  },

  // remove token
  async resetUser({ commit, dispatch }) {
    commit('SET_TOKEN', '')
    commit('SET_ROLE', '')
    commit('SET_NAME', '')
    commit('SET_PHONE', '')
    await dispatch('resetStorage')
  },

  async resetStorage() {
    try {
      await localForage.removeItem(storage_key_token)
      await localForage.removeItem(storage_key_name)
      await localForage.removeItem(storage_key_role)
    } catch (e) {
      console.warn(`User reset storage error:${e}`)
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

