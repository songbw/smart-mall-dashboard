import axios from 'axios'
import store from '../store'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  timeout: 60000
})

// request拦截器
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['Authorization'] = store.getters.token
    }
    config.headers['Content-Type'] = 'application/json'
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// respone拦截器
service.interceptors.response.use(
  response => response.data.data,
  error => {
    console.log('err' + error) // for debug
    return Promise.reject(error)
  }
)

export default service
