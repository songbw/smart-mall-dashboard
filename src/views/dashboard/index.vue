<template>
  <div class="dashboard-container">
    <component :is="roleDashboard" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import isEmpty from 'lodash/isEmpty'
import PageLoading from '@/components/PageLoading'
import adminDashboard from './admin'
import vendorDashboard from './vendor'
import {
  role_watcher_name,
  role_admin_name
} from '@/utils/constants'

export default {
  name: 'Dashboard',
  components: { PageLoading, adminDashboard, vendorDashboard },
  computed: {
    ...mapGetters([
      'userRole'
    ]),
    roleDashboard() {
      if (isEmpty(this.userRole)) {
        return 'PageLoading'
      } else {
        return this.userRole === role_watcher_name || this.userRole === role_admin_name
          ? 'adminDashboard'
          : 'vendorDashboard'
      }
    }
  }
}
</script>
