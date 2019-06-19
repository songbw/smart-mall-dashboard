<template>
  <div class="dashboard-editor-container">
    <vendor-info />
    <panel-group @handleSetLineChartData="handleSetLineChartData" />
  </div>
</template>

<script>
import VendorInfo from './vendorInfo'
import PanelGroup from './panelGroup'

export default {
  name: 'VendorDashboard',
  components: {
    PanelGroup,
    VendorInfo
  },
  methods: {
    handleSetLineChartData(type) {
    }
  }
}
</script>

<style scoped>
  .dashboard-editor-container {
    padding: 32px;
    background-color: rgb(240, 242, 245);
  }
</style>
