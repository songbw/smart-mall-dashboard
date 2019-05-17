import { getInfo, login } from '@/api/login'
import { userLogin } from '@/api/userLogin'
import { getUserInfo, userLogout } from '@/api/users'
import {
  getToken, removeToken, setToken,
  getUserName, setUserName, removeUserName
} from '@/utils/cookie'

const user = {
  state: {
    token: getToken(),
    username: getUserName(),
    name: '',
    avatar: '',
    roles: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_USERNAME: (state, username) => {
      state.username = username
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        login(username, userInfo.password).then(response => {
          const data = response.data
          setToken(data.token)
          setUserName(username)
          commit('SET_USERNAME', username)
          commit('SET_TOKEN', data.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    RefreshToken({ commit }, token) {
      return new Promise(resolve => {
        commit('SET_TOKEN', token)
        setToken(token)
        resolve()
      })
    },
    DelToken({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        setToken('')
        resolve()
      })
    },
    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo(state.token).then(response => {
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    UserLogin({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        userLogin(userInfo).then(response => {
          const username = userInfo.username.trim()
          const headToken = response.headers.authorization
          setToken(headToken)
          setUserName(username)
          commit('SET_USERNAME', username)
          commit('SET_TOKEN', headToken)
          // console.log('=== UserLogin promise resolve ' + username + ' Token: ' + headToken)
          resolve()
        }).catch(error => {
          // console.log('==== userlogin promise catch : ' + error)
          reject(error)
        })
      })
    },

    GetUserInfo({ commit, state }) {
      // console.log('===GetUserInfo : ' + state.username)
      return new Promise((resolve, reject) => {
        getUserInfo(state.username).then(response => {
          commit('SET_ROLES', response.data.permissionCodes)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        userLogout(state.username).then(() => {
          commit('SET_USERNAME', '')
          commit('SET_TOKEN', '')
          removeToken()
          removeUserName()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        removeUserName()
        resolve()
      })
    }
  }
}

export default user
