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
        return this.userRole === 'admin' ? 'adminDashboard' : 'vendorDashboard'
      }
    }
  }
}
</script>
