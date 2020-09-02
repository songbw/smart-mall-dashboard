import isEmpty from 'lodash/isEmpty'
import {
  loginApi,
  twoFactorAuthApi,
  registerApi,
  passwordNewApi,
  passwordChangeApi,
  getVerificationCodeApi,
  getRoleApi,
  logoutApi
} from '@/api/auth'
import {
  storage_key_token,
  storage_key_name,
  storage_key_phone,
  storage_key_role,
  storage_key_permissions,
  storage_merchant_id
} from '@/utils/constants'
import {
  storageSetItem,
  storageRemoveItem
} from '@/utils/storage'

const state = {
  token: '',
  name: '',
  phone: '',
  role: '',
  permissions: []
}

const mutations = {
  SET_USER: (state, user) => {
    Object.keys(user).forEach(key => {
      if (key !== 'permissions') {
        state[key] = user[key]
      } else {
        const permissions = user['permissions']
        if (isEmpty(permissions)) {
          state.permissions = []
        } else {
          state.permissions = permissions.split(',')
            .filter(item => isEmpty(item.trim()) === false)
        }
      }
    })
  }
}

const actions = {
  async login({ commit }, userInfo) {
    const username = userInfo.username.trim()
    const password = userInfo.password.trim()
    const data = await loginApi({ name: username, password: password })
    const phone = data.phone || ''
    const user = {
      name: username,
      token: data.token,
      phone: phone,
      role: ''
    }
    commit('SET_USER', user)
    const reset = isEmpty(phone) === false && data.loginCount === 0
    if (reset === false) {
      await storageSetItem(storage_key_token, data.token)
      await storageSetItem(storage_key_name, username)
      await storageSetItem(storage_key_phone, phone)
      await storageRemoveItem(storage_key_role)
      await storageRemoveItem(storage_key_permissions)
    }
    return { passwordReset: reset, twoFactorAuth: data.twoFactorAuth }
  },
  async twoFactorAuth({ commit }, params) {
    const data = await twoFactorAuthApi(params)
    const user = {
      token: data.token,
      role: data.role,
      permissions: data.permissions || ''
    }
    commit('SET_USER', user)
    await storageSetItem(storage_key_token, user.token)
    await storageSetItem(storage_key_role, user.role)
    await storageSetItem(storage_key_permissions, user.permissions)
    return data.role
  },
  async register({ commit }, params) {
    const name = params.username.trim()
    const phone = params.phone
    const code = params.code
    const data = await registerApi(
      { name, phone, password: params.password.trim(), code })
    return data.token
  },
  async passwordNew({ commit }, params) {
    const name = params.username.trim()
    const phone = params.phone
    const code = params.code
    const data = await passwordNewApi(
      { name, phone, password: params.password.trim(), code })
    return data.id
  },
  async passwordChange({ commit }, params) {
    const data = await passwordChangeApi({
      username: params.username,
      oldPassword: params.oldPassword,
      newPassword: params.newPassword
    })
    return data.id
  },
  async getVerificationCode({ commit }, params) {
    const data = await getVerificationCodeApi({ phone: params.phone })
    return data.code
  },
  async getRole({ commit, state }) {
    const data = await getRoleApi()
    const user = {
      role: data.role,
      permissions: data.permissions || ''
    }
    commit('SET_USER', user)
    await storageSetItem(storage_key_role, user.role)
    await storageSetItem(storage_key_permissions, user.permissions)
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
    commit('SET_USER', {
      token: '',
      role: '',
      name: '',
      phone: '',
      permissions: []
    })
    await dispatch('resetStorage')
  },
  async resetStorage() {
    try {
      await storageRemoveItem(storage_key_token)
      await storageRemoveItem(storage_key_name)
      await storageRemoveItem(storage_key_phone)
      await storageRemoveItem(storage_key_role)
      await storageRemoveItem(storage_key_permissions)
      await storageRemoveItem(storage_merchant_id)
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

