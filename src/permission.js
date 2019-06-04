import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css' // Progress 进度条样式
import { getToken, getUserName } from '@/utils/cookie'

const whiteList = ['/user/login', '/pageDisplay'] // 不重定向白名单
const goThrough = true

router.beforeEach((to, from, next) => {
  if (goThrough) {
    next()
    return
  }

  let pass = false
  for (const item of whiteList) {
    if (to.path.indexOf(item) !== -1) {
      pass = true
      next()
      return
    }
  }

  NProgress.start()

  const username = getUserName() || store.getters.username
  if (getToken() && username) {
    if (to.path === '/user/login') {
      next({ path: '/' })
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    } else {
      if (pass) {
        next()
      } else {
        store.dispatch('GetUserInfo').then(res => { // 拉取用户信息
          next()
        }).catch((err) => {
          store.dispatch('FedLogOut').then(() => {
            next({ path: '/' })
          })
        })
      }
    }
  } else {
    if (pass) {
      next()
    } else {
      next('/user/login')
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})
