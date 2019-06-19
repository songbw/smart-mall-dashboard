import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import isEmpty from 'lodash/isEmpty'
import localForage from 'localforage'
import { Message } from 'element-ui'
import store from '@/store'
import {
  storage_key_token
} from '@/utils/constants'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL, // url = base url + request url
  withCredentials: false,
  timeout: 5000 // request timeout
})

service.interceptors.request.use(
  async config => {
    try {
      const token = await localForage.getItem(storage_key_token)
      if (!isEmpty(token)) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    } catch (e) {
      console.warn(`Axios request: ${e}`)
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    return response.data
  },
  async error => {
    const res = error.response
    if (res && res.status === 400 && res.data) {
      const data = res.data
      if (data.hasOwnProperty('error') && data.error === 400001) {
        console.warn('Token expired.')
        try {
          Message({
            message: '登录超时，请重新登录！',
            type: 'error',
            duration: 5 * 1000
          })
          await store.dispatch('user/resetUser')
        } catch (e) {
          console.warn('Axios reset token error: ' + e)
        } finally {
          // location.reload()
        }
      }
    }
    return Promise.reject(error)
  }
)

Vue.use(VueAxios, service)
