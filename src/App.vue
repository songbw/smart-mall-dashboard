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
  storage_key_role
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
        const role = await localForage.getItem(storage_key_role)
        if (!isEmpty(role)) {
          this.$store.commit('user/SET_ROLE', role)
        }
      } catch (e) {
        console.warn(`App init: ${e}`)
      }
    }
  }
}
</script>
