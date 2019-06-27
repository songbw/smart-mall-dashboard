import router from './router'
import store from './store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import localForage from 'localforage'
import isEmpty from 'lodash/isEmpty'
import {
  storage_key_token,
  storage_key_name,
  storage_key_role
} from '@/utils/constants'

const goThrough = false

router.beforeEach(async(to, from, next) => {
  if (goThrough) {
    next()
    return
  }

  const pass = to.matched.some(record => {
    if (record.meta.hasOwnProperty('requiresAuth')) {
      return !record.meta.requiresAuth
    } else {
      return false
    }
  })

  NProgress.start()
  try {
    if (pass) {
      next()
    } else {
      const username = await localForage.getItem(storage_key_name)
      const token = await localForage.getItem(storage_key_token)
      const role = await localForage.getItem(storage_key_role)
      if (isEmpty(username) || isEmpty(token) || isEmpty(role)) {
        next('/login')
      } else {
        next()
      }
    }
  } catch (e) {
    console.warn(`router.beforeEach:${e}`)
    store.dispatch('user/resetUser').then((_) => {
      console.log('Reset user state')
    }).catch(e => {
      console.log('Reset user token with error:' + e)
    }).finally(() => {
      next('/login')
    })
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
