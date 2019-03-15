import axios from 'axios'
import { Message } from 'element-ui'

// 创建axios实例
const authService = axios.create({
  baseURL: process.env.VUE_APP_AUTH_BASE_URL, // api的base_url
  timeout: 5000 // 请求超时时间
})

// request拦截器
authService.interceptors.request.use(
  config => {
    config.headers['content-type'] = 'application/json'
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// respone拦截器
authService.interceptors.response.use(
  response => {
    /**
     * code为非20000是抛错 可结合自己业务进行修改
     */
    const res = response.data
    if (res.code !== 200) {
      Message({
        message: res.message,
        type: 'error',
        duration: 5 * 1000
      })

      return Promise.reject('error')
    } else {
      return response.data
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default authService
