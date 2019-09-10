import router from './router'
import store from './store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import localForage from 'localforage'
import isEmpty from 'lodash/isEmpty'
import uniq from 'lodash/uniq'
import {
  storage_key_token,
  storage_key_name,
  storage_key_role
} from '@/utils/constants'

const goThrough = false

const gotoLogin = (next) => {
  store.dispatch('user/resetUser').then((_) => {
    console.log('Reset user state')
  }).catch(e => {
    console.log('Reset user token with error:' + e)
  }).finally(() => {
    next({ path: '/login', replace: true })
  })
}

router.beforeEach(async(to, from, next) => {
  if (goThrough) {
    next()
    return
  }
  const needAuth = to.matched.reduce(
    (auth, record) => auth && ('requiresAuth' in record.meta ? record.meta.requiresAuth : true),
    true)

  const authRoles = to.matched.reduce(
    (roles, record) => roles.concat('roles' in record.meta ? record.meta.roles : []),
    [])

  const roles = uniq(authRoles)

  NProgress.start()
  try {
    if (!needAuth) {
      next()
    } else {
      const username = await localForage.getItem(storage_key_name)
      const token = await localForage.getItem(storage_key_token)
      const role = await localForage.getItem(storage_key_role)
      if (isEmpty(username) ||
        isEmpty(token) ||
        isEmpty(role) ||
        (roles.length > 0 && !roles.includes(role))
      ) {
        gotoLogin(next)
      } else {
        next()
      }
    }
  } catch (e) {
    console.warn(`router.beforeEach:${e}`)
    gotoLogin(next)
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
