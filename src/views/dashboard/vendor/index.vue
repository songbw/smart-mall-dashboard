<template>
  <div class="app-container">
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

