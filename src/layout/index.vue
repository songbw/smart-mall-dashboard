<template>
  <div :class="classObj" class="app-wrapper">
    <sidebar class="sidebar-container" />
    <div class="main-container">
      <nav-bar />
      <div v-if="!vendorLoading && !vendorApproved">
        <el-alert
          title="企业未审核通过"
          type="error"
          description="企业信息还未通过审核，请完善后提交审核"
          show-icon
        />
      </div>
      <app-main v-if="appReady" />
      <page-loading v-else />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PageLoading from '@/components/PageLoading'
import { NavBar, Sidebar, AppMain } from './components'

export default {
  name: 'Layout',
  components: {
    NavBar,
    Sidebar,
    AppMain,
    PageLoading
  },
  computed: {
    ...mapGetters([
      'appReady',
      'vendorLoading',
      'vendorApproved'
    ]),
    sidebar() {
      return this.$store.state.app.sidebar
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/mixin.scss";
  @import "~@/styles/variables.scss";

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
  }

  .hideSidebar {
    width: calc(100% - 54px)
  }

  .openSidebar {
    width: 100%;
  }
</style>
