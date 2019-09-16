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
  storage_merchant_id,
  role_admin_name,
  role_watcher_name,
  vendor_status_approved
} from '@/utils/constants'

export default {
  name: 'App',
  created() {
    this.initApp()
  },
  methods: {
    async initApp() {
      try {
        await localForage.ready()
        console.debug('App init localForage ' + localForage.driver())
        const token = await localForage.getItem(storage_key_token)
        if (!isEmpty(token)) {
          this.$store.commit('user/SET_TOKEN', token)
        }
        const name = await localForage.getItem(storage_key_name)
        if (!isEmpty(name)) {
          this.$store.commit('user/SET_NAME', name)
        }
        const phone = await localForage.getItem(storage_key_phone)
        if (!isEmpty(phone)) {
          this.$store.commit('user/SET_PHONE', phone)
        }
        const role = await localForage.getItem(storage_key_role)
        if (!isEmpty(role)) {
          this.$store.commit('user/SET_ROLE', role)
        }
        if (role_admin_name === role || role_watcher_name === role) {
          await localForage.setItem(storage_merchant_id, 0)
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
          await localForage.setItem(storage_merchant_id, id)
        } else {
          await localForage.setItem(storage_merchant_id, -1)
        }
      } catch (e) {
        console.warn('App init vendor profile error:' + e)
      }
    }
  }
}
</script>
