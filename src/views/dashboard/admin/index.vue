<template>
  <div class="app-container">
    <panel-group @handleSetLineChartData="handleSetLineChartData" />
  </div>
</template>

<script>
import panelGroup from './panelGroup'

export default {
  name: 'AdminDashboard',
  components: {
    PanelGroup: panelGroup
  },
  data() {
    return {}
  },
  methods: {
    handleSetLineChartData(type) {
    }
  }
}
</script>
