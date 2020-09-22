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
  storage_renter_id,
  role_admin_name,
  vendor_status_approved, platform_renter_id, role_renter_name
} from '@/utils/constants'

import {
  storageGetItem,
  storageSetItem
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
        const userData = {}
        const token = await storageGetItem(storage_key_token)
        userData.token = token === null ? '' : token

        const name = await storageGetItem(storage_key_name)
        userData.name = name === null ? '' : name

        const phone = await storageGetItem(storage_key_phone)
        userData.phone = phone === null ? '' : phone

        const role = await storageGetItem(storage_key_role)
        userData.role = role === null ? '' : role

        const permissions = await storageGetItem(storage_key_permissions)
        userData.permissions = permissions !== null ? permissions : ''
        this.$store.commit('user/SET_USER', userData)

        const appId = await storageGetItem(storage_platform_id)
        if (appId !== null) {
          this.$store.commit('app/SET_PLATFORM_ID', appId)
        }
        if (role_admin_name === role) {
          this.$store.commit('vendor/SET_VENDOR_PROFILE', {
            id: 0,
            renterId: platform_renter_id,
            status: vendor_status_approved
          })
          await storageSetItem(storage_merchant_id, 0)
          await storageSetItem(storage_renter_id, platform_renter_id)
        } else if (!isEmpty(token)) {
          if (role === role_renter_name) {
            await this.getRenterProfile()
          } else {
            await this.getVendorProfile()
          }
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
    },
    async getRenterProfile() {
      try {
        const { renterId } = await this.$store.dispatch('vendor/getRenterProfile')
        await storageSetItem(storage_merchant_id, 0)
        await storageSetItem(storage_renter_id, renterId)
      } catch (e) {
        console.warn('App init renter profile error:' + e)
      }
    }
  }
}
</script>
