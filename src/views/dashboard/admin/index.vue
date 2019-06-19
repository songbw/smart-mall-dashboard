<template>
  <div class="dashboard-editor-container">
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

<style scoped>
  .dashboard-editor-container {
    padding: 32px;
    background-color: rgb(240, 242, 245);
  }
</style>
