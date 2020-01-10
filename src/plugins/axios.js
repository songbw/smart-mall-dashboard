import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import isEmpty from 'lodash/isEmpty'
import store from '@/store'
import {
  storage_key_token,
  storage_merchant_id
} from '@/utils/constants'
import { storageGetItem } from '@/utils/storage'

const axiosMap = new Map()
const relogin = () => {
  /*
  Message({
    message: '登录超时或在其它地方登录，请重新登录！',
    type: 'error',
    duration: 5 * 1000
  })
   */
  store.dispatch('user/resetUser')
    .then(() => {
    })
    .catch(() => {
    })
    .finally(() => location.reload(true))
}
const axiosService = apiKey => {
  if (axiosMap.has(apiKey)) {
    return axiosMap.get(apiKey)
  } else {
    // create an axios instance
    const service = axios.create({
      baseURL: process.env.VUE_APP_BASE_URL, // url = base url + request url
      withCredentials: false,
      timeout: 30000 // request timeout
    })
    service.interceptors.request.use(
      async config => {
        try {
          const token = await storageGetItem(storage_key_token)
          const id = await storageGetItem(storage_merchant_id)
          if (!isEmpty(token)) {
            config.headers['Authorization'] = `Bearer ${token}`
          }
          if (id !== null && id !== -1) {
            config.headers['Merchant'] = id
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
      error => {
        const res = error.response
        if (res && res.status === 401) {
          relogin()
        } else if (res && res.status === 400 && res.data) {
          const data = res.data
          if ('error' in data && data.error === 400001) {
            console.warn('Token expired.')
            relogin()
          }
        }
        return Promise.reject(error)
      }
    )
    axiosMap.set(apiKey, service)
    return service
  }
}

Vue.use(VueAxios, axiosService)
