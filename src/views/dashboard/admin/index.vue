<template>
  <div class="app-container">
    <el-row v-loading="summaryLoading">
      <el-col :span="4" class="panel-item">
        <div class="panel-title">订单支付总额<span class="panel-annotation">（元）</span></div>
        <el-divider />
        <div class="panel-value">{{ orderGross }}</div>
      </el-col>
      <el-col :span="3" class="panel-item">
        <div class="panel-title">用户总数<span class="panel-annotation">（人）</span></div>
        <el-divider />
        <div class="panel-value">{{ totalCustomer }}</div>
      </el-col>
      <el-col :span="3" class="panel-item">
        <div class="panel-title">订单总量<span class="panel-annotation">（单）</span></div>
        <el-divider />
        <div class="panel-value">{{ summary.orderTotalNum }}</div>
      </el-col>
      <el-col :span="3" class="panel-item">
        <div class="panel-title">下单人数<span class="panel-annotation">（人）</span></div>
        <el-divider />
        <div class="panel-value">{{ summary.orderCustomerTotalNum }}</div>
      </el-col>
      <el-col :span="3" class="panel-item">
        <div class="panel-title">退货单数<span class="panel-annotation">（单）</span></div>
        <el-divider />
        <div class="panel-value">{{ summary.returnOrderTotalNum }}</div>
      </el-col>
      <el-col :span="3" class="panel-item">
        <div class="panel-title">客单价<span class="panel-annotation">（元）</span></div>
        <el-divider />
        <div class="panel-value">{{ summary.perCustomerTransaction }}</div>
      </el-col>
      <el-col :span="3" class="panel-item">
        <div class="panel-title">订单均价<span class="panel-annotation">（元）</span></div>
        <el-divider />
        <div class="panel-value">{{ summary.orderAveragePrice }}</div>
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
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="11">
        <div class="data-title">订单支付总额<span class="panel-annotation">（元）</span> / 按品类</div>
        <el-card shadow="never">
          <ve-pie
            :data="chartCategoryData"
            :loading="chartCategoryLoading"
            :settings="chartPieSettings"
            :data-empty="chartCategoryData.rows.length === 0"
          />
        </el-card>
      </el-col>
      <el-col :span="11">
        <div class="data-title">订单支付总额<span class="panel-annotation">（元）</span> / 按商户</div>
        <el-card shadow="never">
          <ve-pie
            :data="chartMerchantData"
            :loading="chartMerchantLoading"
            :settings="chartPieSettings"
            :data-empty="chartMerchantData.rows.length === 0"
          />
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="11">
        <div class="data-title">订单支付趋势<span class="panel-annotation">（元）</span> / 按活动</div>
        <el-card shadow="never">
          <ve-line
            :data="chartPromotionData"
            :data-empty="chartPromotionData.rows.length === 0"
            :loading="chartPromotionLoading"
            :settings="chartPriceSettings"
          />
        </el-card>
      </el-col>
      <el-col :span="11">
        <div class="data-title">订单支付趋势<span class="panel-annotation">（元）</span> / 按时间</div>
        <el-card shadow="never">
          <ve-line
            :data="chartPeriodData"
            :data-empty="chartPeriodData.rows.length === 0"
            :loading="chartPeriodLoading"
            :settings="chartPriceSettings"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import sortBy from 'lodash/sortBy'
import isNumber from 'lodash/isNumber'
import moment from 'moment'
import {
  getCategoryDataApi,
  getMerchantDataApi,
  getPeriodDataApi,
  getPromotionDataApi,
  getSummaryDataApi
} from '@/api/statistics'
import { role_admin_name } from '@/utils/constants'

const floatToFixed = (value, precision) =>
  parseFloat((Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision)).toFixed(2))
const convertToNumber = value => isNumber(value) ? floatToFixed(value, 2)
  : floatToFixed(Number.parseFloat(value), 2)
const convertToInt = value => Number.isInteger(value) ? value : Math.round(convertToNumber(value))

export default {
  name: 'AdminDashboard',
  data() {
    return {
      summaryLoading: false,
      chartCategoryLoading: false,
      chartMerchantLoading: false,
      chartPromotionLoading: false,
      chartPeriodLoading: false,
      chartDataType: '30',
      summary: {
        orderPaymentAmount: 0,
        customerTotalNum: 0,
        orderTotalNum: 0,
        orderCustomerTotalNum: 0,
        returnOrderTotalNum: 0,
        perCustomerTransaction: 0,
        orderAveragePrice: 0
      },
      chartPieSettings: {
        limitShowNum: 5,
        dataType: 'KMB',
        labelMap: {
          category: '类别',
          merchant: '商户'
        }
      },
      chartPriceSettings: {
        dataType: 'KMB',
        labelMap: {
          allDay: '全天',
          earlyMorning: '凌晨',
          morning: '上午',
          noon: '中午',
          afternoon: '下午',
          night: '晚上',
          lateAtNight: '深夜'
        }
      },
      chartCategoryData: {
        columns: ['category', 'total'],
        rows: []
      },
      chartMerchantData: {
        columns: ['merchant', 'total'],
        rows: []
      },
      chartPromotionData: {
        columns: [],
        rows: []
      },
      chartPeriodData: {
        columns: ['date', 'allDay', 'earlyMorning', 'morning', 'noon', 'afternoon', 'night', 'lateAtNight'],
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
    },
    totalCustomer: {
      get() {
        if (this.summary.customerTotalNum > 10000) {
          return (this.summary.customerTotalNum / 10000).toFixed(2) + ' 万'
        } else if (this.summary.customerTotalNum > 0) {
          return this.summary.customerTotalNum
        } else {
          return 0
        }
      }
    }
  },
  created() {
    if (this.$store.getters.userRole === role_admin_name) {
      this.prepareData()
    }
  },
  methods: {
    async prepareData() {
      await this.getSummaryData()
      await this.getChartData()
    },
    async getSummaryData() {
      try {
        this.summaryLoading = true
        const { data } = await getSummaryDataApi()
        this.summary.orderPaymentAmount = convertToNumber(data.orderAmount)
        this.summary.orderTotalNum = convertToInt(data.orderCount)
        this.summary.customerTotalNum = convertToInt(data.userCount)
        this.summary.orderCustomerTotalNum = convertToInt(data.orderUserCount)
        this.summary.returnOrderTotalNum = convertToInt(data.refundOrderCount)
        this.summary.perCustomerTransaction = convertToNumber(data.perCustomerPrice)
        this.summary.orderAveragePrice = convertToNumber(data.avgOrderPrice)
      } catch (e) {
        console.warn('Dashboard get summary error:' + e)
      } finally {
        this.summaryLoading = false
      }
    },
    async getChartData() {
      const params = this.getParameters()
      await this.getCategoryData(params)
      await this.getMerchantData(params)
      await this.getPromotionData(params)
      await this.getPeriodData(params)
    },
    getParameters() {
      const format = 'YYYY-MM-DD'
      const range = Number.parseInt(this.chartDataType)
      const startDate = moment().subtract(range, 'days').format(format)
      const endDate = moment().subtract(1, 'days').format(format)
      return { startDate, endDate }
    },
    async getCategoryData(params) {
      try {
        this.chartCategoryLoading = true
        const { data } = await getCategoryDataApi(params)
        if (data && Array.isArray(data)) {
          this.chartCategoryData.rows = data
            .map(item => {
              return {
                category: item.categoryName,
                total: convertToNumber(item.orderAmount)
              }
            })
        }
      } catch (e) {
        console.warn('Dashboard get category error:' + e)
      } finally {
        this.chartCategoryLoading = false
      }
    },
    async getMerchantData(params) {
      try {
        this.chartMerchantLoading = true
        const { data } = await getMerchantDataApi(params)
        if (Array.isArray(data)) {
          this.chartMerchantData.rows = data
            .map(item => {
              return {
                merchant: item.merchantName,
                total: convertToNumber(item.orderAmount)
              }
            })
        }
      } catch (e) {
        console.warn('Dashboard get merchant error:' + e)
      } finally {
        this.chartMerchantLoading = false
      }
    },
    async getPromotionData(params) {
      try {
        this.chartPromotionLoading = true
        const { data } = await getPromotionDataApi(params)
        if (Array.isArray(data) && data.length > 0) {
          this.chartPromotionData.columns = Object.keys(data[0])
          const rows = data
            .map(item => {
              const format = 'MM/DD'
              const { date, ...others } = item
              const dataFormat = moment(date).format(format)
              return { date: dataFormat, dateWithYear: date, ...others }
            })
          this.chartPromotionData.rows = sortBy(rows, ['dateWithYear'])
        }
      } catch (e) {
        console.warn('Dashboard get promotion error:' + e)
        this.chartPromotionData.rows = []
      } finally {
        this.chartPromotionLoading = false
      }
    },
    async getPeriodData(params) {
      try {
        this.chartPeriodLoading = true
        const { data } = await getPeriodDataApi(params)
        if (Array.isArray(data)) {
          const rows = data
            .filter(item => moment(item.statisticsDate).isValid())
            .map(item => {
              const format = 'MM/DD'
              const date = moment(item.statisticsDate).format(format)
              const dayData = {
                date,
                dateWithYear: date,
                earlyMorning: convertToNumber(item.earlyMorning),
                morning: convertToNumber(item.morning),
                noon: convertToNumber(item.noon),
                afternoon: convertToNumber(item.afternoon),
                night: convertToNumber(item.night),
                lateAtNight: convertToNumber(item.lateAtNight)
              }
              dayData.allDay = floatToFixed(dayData.earlyMorning + dayData.morning + dayData.noon +
                dayData.afternoon + dayData.night + dayData.lateAtNight, 2)
              return dayData
            })
          this.chartPeriodData.rows = sortBy(rows, ['dateWithYear'])
        }
      } catch (e) {
        console.warn('Dashboard get period error:' + e)
        this.chartPeriodData.rows = []
      } finally {
        this.chartPeriodLoading = false
      }
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
