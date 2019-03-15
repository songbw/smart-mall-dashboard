import axios from 'axios'
import { Message } from 'element-ui'

// 创建axios实例
const userLoginService = axios.create({
  baseURL: process.env.VUE_APP_USER_BASE_URL, // api的base_url
  timeout: 5000 // 请求超时时间
})

// request拦截器
userLoginService.interceptors.request.use(
  config => {
    config.headers['content-type'] = 'application/json'
    return config
  },
  error => {
    // Do something with request error
    Promise.reject(error)
  }
)

// respone拦截器
userLoginService.interceptors.response.use(
  response => {
    /**
     * code为非20000是抛错 可结合自己业务进行修改
     */
    const res = response.data
    if (res.code !== 200) {
      Message({
        message: res.msg,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(res.msg)
    } else {
      // console.log(response)
      return response
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

export default userLoginService
