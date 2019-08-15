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
        <el-radio-group v-model="chartDataType" @change="onDataTypeChanged">
          <el-radio-button label="30">最近30天运营数据</el-radio-button>
          <el-radio-button label="7">最近7天运营数据</el-radio-button>
        </el-radio-group>
      </el-col>
    </el-row>
    <el-row :gutter="60" style="margin-top: 20px">
      <el-col :span="11">
        <div class="data-title">订单支付总额<span class="panel-annotation">（元）</span> / 按地区</div>
        <el-card shadow="never">
          <ve-pie
            :data="chartOrdersData"
            :loading="chartOrdersLoading"
            :settings="chartSettings"
            :data-empty="chartOrdersData.rows.length === 0"
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
import moment from 'moment'
import {
  getMerchantSumDataApi,
  getMerchantOrderDataApi,
  getMerchantUserDataApi
} from '@/api/statistics'

export default {
  name: 'VendorDashboard',
  data() {
    return {
      merchantId: null,
      summaryLoading: false,
      summary: {
        orderPaymentAmount: 0,
        orderTotalNum: 0,
        orderCustomerTotalNum: 0,
        returnOrderTotalNum: 0
      },
      chartDataType: '30',
      chartSettings: {
        dataType: 'KMB',
        labelMap: {
          date: '日期',
          orderUserCount: '下单人数',
          refundUserCount: '退单人数'
        }
      },
      chartOrdersLoading: false,
      chartOrdersData: {
        columns: ['cityName', 'orderAmount'],
        rows: []
      },
      chartUsersLoading: false,
      chartUsersData: {
        columns: ['date', 'orderUserCount', 'refundUserCount'],
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
    this.merchantId = this.$store.getters.vendorId
    this.getSummaryData()
    this.getChartData()
  },
  methods: {
    async getSummaryData() {
      try {
        this.summaryLoading = true
        const { data } = await getMerchantSumDataApi({ merchantId: this.merchantId })
        this.summary.orderPaymentAmount = data.orderAmount
        this.summary.orderTotalNum = data.orderCount
        this.summary.orderCustomerTotalNum = data.orderUserCount
        this.summary.returnOrderTotalNum = data.refundUserCount
      } catch (e) {
        console.warn('Dashboard get summary error:' + e)
      } finally {
        this.summaryLoading = false
      }
    },
    getParameters() {
      const format = 'YYYY-MM-DD'
      const range = Number.parseInt(this.chartDataType)
      const startDate = moment().subtract(range, 'days').format(format)
      const endDate = moment().subtract(1, 'days').format(format)
      return { merchantId: this.merchantId, startDate, endDate }
    },
    getChartData() {
      const params = this.getParameters()
      this.getOrderData(params)
      this.getUserData(params)
    },
    onDataTypeChanged(value) {
      this.getChartData()
    },
    async getOrderData(params) {
      try {
        this.chartOrdersLoading = true
        const { data } = await getMerchantOrderDataApi(params)
        if (Array.isArray(data)) {
          this.chartOrdersData.rows = data.map(item => {
            return { cityName: item.cityName, orderAmount: item.orderAmount }
          })
        }
      } catch (e) {
        console.warn('Dashboard get merchant order error:' + e)
      } finally {
        this.chartOrdersLoading = false
      }
    },
    async getUserData(params) {
      try {
        this.chartUsersLoading = true
        const { data } = await getMerchantUserDataApi(params)
        if (Array.isArray(data)) {
          this.chartUsersData.rows = data.map(item => {
            const { statisticDate, ...rest } = item
            return {
              date: statisticDate,
              ...rest
            }
          })
        }
      } catch (e) {
        console.warn('Dashboard get merchant user error:' + e)
      } finally {
        this.chartUsersLoading = false
      }
    }
  }
}
</script>

<style scoped>
  .panel-item {
    border-top: #DCDFE6 1px solid;
    border-right: #DCDFE6 1px solid;
    border-bottom: #DCDFE6 1px solid;
  }

  .panel-title {
    margin-top: 10px;
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

