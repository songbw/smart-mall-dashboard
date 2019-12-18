import router from './router'
import store from './store'
import NProgress from 'nprogress'
import isEmpty from 'lodash/isEmpty'
import uniq from 'lodash/uniq'
import {
  storage_key_token,
  storage_key_name,
  storage_key_role,
  storage_key_permissions
} from '@/utils/constants'
import { storageGetItem } from '@/utils/storage'

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
  const needSettings = to.matched.reduce(
    (need, record) => need || ('needSettings' in record.meta ? record.meta.needSettings : false),
    false)

  const needAuth = to.matched.reduce(
    (auth, record) => auth || ('requiresAuth' in record.meta ? record.meta.requiresAuth : true),
    false)

  const authRoles = to.matched.reduce(
    (roles, record) => roles.concat('roles' in record.meta ? record.meta.roles : []), [])

  const roles = uniq(authRoles)

  NProgress.start()

  store.commit('app/SET_NEED_SETTINGS', needSettings)

  try {
    if (!needAuth) {
      next()
    } else {
      const username = await storageGetItem(storage_key_name)
      const token = await storageGetItem(storage_key_token)
      const role = await storageGetItem(storage_key_role)
      const permissions = await storageGetItem(storage_key_permissions)
      if (isEmpty(username) ||
        isEmpty(token) ||
        isEmpty(role) ||
        isEmpty(permissions) ||
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
