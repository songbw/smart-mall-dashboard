<template>
  <div class="app-container">
    <el-row v-loading="summaryLoading">
      <el-col :span="6" class="panel-item">
        <div class="panel-title">订单支付总额<span class="panel-annotation">（元）</span></div>
        <el-divider />
        <div class="panel-value">{{ orderGross }}</div>
      </el-col>
      <el-col :span="6" class="panel-item">
        <div class="panel-title">订单总量<span class="panel-annotation">（单）</span></div>
        <el-divider />
        <div class="panel-value">{{ summary.orderTotalNum }}</div>
      </el-col>
      <el-col :span="6" class="panel-item">
        <div class="panel-title">下单人数<span class="panel-annotation">（人）</span></div>
        <el-divider />
        <div class="panel-value">{{ summary.orderCustomerTotalNum }}</div>
      </el-col>
      <el-col :span="6" class="panel-item">
        <div class="panel-title">退货单数<span class="panel-annotation">（单）</span></div>
        <el-divider />
        <div class="panel-value">{{ summary.returnOrderTotalNum }}</div>
      </el-col>
    </el-row>
    <el-row style="margin-top: 20px">
      <el-col :span="22">
        <el-radio-group @change="onDataTypeChanged" v-model="chartDataType">
          <el-radio-button label="30">最近30天运营数据</el-radio-button>
          <el-radio-button label="7">最近7天运营数据</el-radio-button>
        </el-radio-group>
      </el-col>
    </el-row>
    <el-row :gutter="60" style="margin-top: 20px">
      <el-col :span="11">
        <div class="data-title">订单支付总额变化趋势</div>
        <el-card shadow="never">
          <ve-line
            :data="chartOrdersData"
            :data-empty="chartOrdersData.rows.length === 0"
            :loading="chartOrdersLoading"
            :settings="chartSettings"
          />
        </el-card>
      </el-col>
      <el-col :span="11">
        <div class="data-title">用户数变化趋势</div>
        <el-card shadow="never">
          <ve-line
            :data="chartUsersData"
            :data-empty="chartUsersData.rows.length === 0"
            :loading="chartUsersLoading"
            :settings="chartSettings"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getMerchantSumDataApi } from '@/api/statistics'

export default {
  name: 'VendorDashboard',
  data() {
    return {
      summaryLoading: false,
      summary: {
        orderPaymentAmount: 0,
        orderTotalNum: 0,
        orderCustomerTotalNum: 0,
        returnOrderTotalNum: 0
      },
      chartDataType: '30',
      chartSettings: {
        dataType: 'normal',
        labelMap: {}
      },
      chartOrdersLoading: false,
      chartOrdersData: {
        columns: ['date'],
        rows: []
      },
      chartUsersLoading: false,
      chartUsersData: {
        columns: ['date'],
        rows: []
      }
    }
  },
  computed: {
    orderGross: {
      get() {
        if (this.summary.orderPaymentAmount > 10000) {
          return (this.summary.orderPaymentAmount / 10000).toFixed(2) + ' 万'
        } else if (this.summary.orderPaymentAmount > 0) {
          return this.summary.orderPaymentAmount
        } else {
          return 0
        }
      }
    }
  },
  created() {
    this.getSummaryData()
    this.getChartData()
  },
  methods: {
    async getSummaryData() {
      try {
        this.summaryLoading = true
        const { data } = await getMerchantSumDataApi()
        console.debug(JSON.stringify(data))
      } catch (e) {
        console.warn('Dashboard get summary error:' + e)
      } finally {
        this.summaryLoading = false
      }
    },
    getChartData() {
    },
    onDataTypeChanged(value) {
      this.getChartData()
    }
  }
}
</script>

<style scoped>
  .panel-item {
    border-right: #DCDFE6 1px solid;
    border-bottom: #DCDFE6 1px solid;
  }

  .panel-title {
    font-size: 18px;
    font-weight: bolder;
    text-align: center;
  }

  .panel-annotation {
    font-size: 10px;
  }

  .panel-value {
    font-size: 16px;
    text-align: center;
    margin-bottom: 12px;
  }

  .data-title {
    font-size: 18px;
    font-weight: bold;
    text-align: center;
  }
</style>

