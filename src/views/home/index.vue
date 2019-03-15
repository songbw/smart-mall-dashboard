<template>
  <div class="dashboard-editor-container">
    <panel-group @handleSetLineChartData="handleSetLineChartData"/>
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <tendency-chart :chart-data="currentChartData"/>
    </el-row>
  </div>
</template>

<script>
  import panelGroup from './panelGroup'
  import tendencyChart from './tendencyChart'

  const lineChartData = {
    users: {
      actualData: [120, 82, 91, 154, 162, 140, 145]
    },
    sales: {
      actualData: [120, 90, 100, 138, 142, 130, 130]
    },
    orders: {
      actualData: [120, 82, 91, 154, 162, 140, 130]
    }
  }

  export default {
    name: 'Home',
    components: {
      TendencyChart: tendencyChart,
      PanelGroup: panelGroup
    },
    data() {
      return {
        currentChartData: lineChartData.users
      }
    },
    methods: {
      handleSetLineChartData(type) {
        this.currentChartData = lineChartData[type]
      }
    }
  }
</script>

<style scoped>
  .dashboard-editor-container {
    padding: 32px;
    background-color: rgb(240, 242, 245);

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }

  }
</style>
