<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import localForage from 'localforage'
import isEmpty from 'lodash/isEmpty'
import {
  storage_key_token,
  storage_key_name,
  storage_key_phone,
  storage_key_role,
  storage_key_permissions,
  storage_merchant_id,
  storage_platform_id,
  role_admin_name,
  role_watcher_name,
  vendor_status_approved
} from '@/utils/constants'

import {
  storageGetItem,
  storageSetItem,
  storageRemoveItem
} from '@/utils/storage'

export default {
  name: 'App',
  created() {
    this.initApp()
  },
  methods: {
    async initApp() {
      try {
        await localForage.ready()
        const token = await storageGetItem(storage_key_token)
        if (!isEmpty(token)) {
          this.$store.commit('user/SET_TOKEN', token)
        }
        const name = await storageGetItem(storage_key_name)
        if (!isEmpty(name)) {
          this.$store.commit('user/SET_NAME', name)
        }
        const phone = await storageGetItem(storage_key_phone)
        if (!isEmpty(phone)) {
          this.$store.commit('user/SET_PHONE', phone)
        }
        const role = await storageGetItem(storage_key_role)
        if (!isEmpty(role)) {
          this.$store.commit('user/SET_ROLE', role)
        }
        const permissions = await storageGetItem(storage_key_permissions)
        if (!isEmpty(permissions)) {
          this.$store.commit('user/SET_PERMISSIONS', permissions)
        }
        const appId = await storageGetItem(storage_platform_id)
        if (!isEmpty(appId)) {
          this.$store.commit('app/SET_PLATFORM_ID', appId)
        }
        await storageRemoveItem(storage_merchant_id)
        if (role_admin_name === role || role_watcher_name === role) {
          this.$store.commit('vendor/SET_VENDOR_PROFILE', { id: 0, status: vendor_status_approved })
          await storageSetItem(storage_merchant_id, 0)
        } else if (!isEmpty(token)) {
          await this.getVendorProfile()
        }

        this.$store.commit('app/SET_READY')
      } catch (e) {
        console.warn(`App init: ${e}`)
      }
    },
    async getVendorProfile() {
      try {
        const { status, id } = await this.$store.dispatch('vendor/getProfile')
        if (status === vendor_status_approved) {
          await storageSetItem(storage_merchant_id, id)
        } else {
          await storageSetItem(storage_merchant_id, -1)
        }
      } catch (e) {
        console.warn('App init vendor profile error:' + e)
      }
    }
  }
}
</script>
