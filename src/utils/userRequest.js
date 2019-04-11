import axios from 'axios'
import { Message } from 'element-ui'
import store from '../store'

// 创建axios实例
const userService = axios.create({
  baseURL: process.env.VUE_APP_USER_BASE_URL,
  timeout: 60000
})

// request拦截器
userService.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['Authorization'] = store.getters.token
    }
    config.headers['content-type'] = 'application/json'
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// respone拦截器
userService.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      switch (res.code) {
        case 5000 :
          console.log('=== remove expired token')
          this.$store.dispatch('DelToken')
          window.location.href = '#/user/login'
          break
        default:
          Message({
            message: res.msg,
            type: 'error',
            duration: 5 * 1000
          })
          return Promise.reject(Message)
      }
    } else {
      const headToken = response.headers.authorization
      if (headToken) {
        console.log('=== refresh token : ')
        store.dispatch('RefreshToken', headToken)
      }
      return response.data
    }
  },
  error => {
    switch (error.response.status) {
      case 403:
         Message({
          message: ' 无此权限 ! ',
          type: 'error',
          duration: 5 * 1000
         })
        break
      default:
        Message({
          message: error.message,
          type: 'error',
          duration: 5 * 1000
        })
        break
    }
    return Promise.reject(error)
  }
)

export default userService
