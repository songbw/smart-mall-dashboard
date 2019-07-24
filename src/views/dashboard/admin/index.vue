<template>
  <div class="app-container">
    <el-row v-loading="summaryLoading">
      <el-col :span="4" class="panel-item">
        <div class="panel-title">订单支付总额<span class="panel-annotation">（万元）</span></div>
        <el-divider />
        <div class="panel-value">{{ orderGross }}</div>
      </el-col>
      <el-col :span="3" class="panel-item">
        <div class="panel-title">用户总数<span class="panel-annotation">（万人）</span></div>
        <el-divider />
        <div class="panel-value">{{ summary.customerTotalNum }}</div>
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
        <div class="panel-value">{{ perCustomerTransaction }}</div>
      </el-col>
      <el-col :span="3" class="panel-item">
        <div class="panel-title">订单均价<span class="panel-annotation">（元）</span></div>
        <el-divider />
        <div class="panel-value">{{ orderAveragePrice }}</div>
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
        <div class="data-title">订单支付总额 / 按品类</div>
        <el-card shadow="never">
          <ve-pie :data="chartCategoryData" :settings="chartPriceSettings" :loading="chartCategoryLoading" />
        </el-card>
      </el-col>
      <el-col :span="11">
        <div class="data-title">订单支付总额 / 按商户</div>
        <el-card shadow="never">
          <ve-pie :data="chartMerchantData" :settings="chartPriceSettings" :loading="chartMerchantLoading" />
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="60" style="margin-top: 20px">
      <el-col :span="11">
        <div class="data-title">订单支付趋势 / 按活动</div>
        <el-card shadow="never">
          <ve-line :data="chartPromotionData" :settings="chartPriceSettings" :loading="chartPromotionLoading" />
        </el-card>
      </el-col>
      <el-col :span="11">
        <div class="data-title">订单支付趋势 / 按时间</div>
        <el-card shadow="never">
          <ve-line :data="chartPeriodData" :settings="chartPriceSettings" :loading="chartPeriodLoading" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import moment from 'moment'
import {
  getSummaryDataApi,
  getPromotionDataApi,
  getMerchantDataApi,
  getPeriodDataApi
} from '@/api/statistics'

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
        returnOrderTotalNum: 0
      },
      chartPriceSettings: {
        dataType: 'normal',
        labelMap: {
          category: '类别',
          merchant: '商户',
          total: '支付总额',
          date: '日期',
          secKill: '秒杀',
          premium: '精品',
          normal: '普通',
          others: '其它',
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
        rows: [
          { category: '美妆', total: 230 },
          { category: '食品', total: 220 },
          { category: '母婴', total: 150 },
          { category: '家电', total: 150 },
          { category: '粮油', total: 20 }
        ]
      },
      chartMerchantData: {
        columns: ['merchant', 'total'],
        rows: [
          { merchant: '奥弋', total: 400 },
          { merchant: '嘉浦', total: 220 },
          { merchant: '红叶', total: 150 }
        ]
      },
      chartPromotionData: {
        columns: ['date', 'secKill', 'premium', 'normal', 'others'],
        rows: [
          { date: '2019/6/1', secKill: 80, premium: 30, normal: 20, others: 10 },
          { date: '2019/6/2', secKill: 20, premium: 60, normal: 50, others: 110 },
          { date: '2019/6/3', secKill: 50, premium: 90, normal: 10, others: 80 },
          { date: '2019/6/4', secKill: 120, premium: 10, normal: 30, others: 50 },
          { date: '2019/6/5', secKill: 90, premium: 200, normal: 80, others: 20 }
        ]
      },
      chartPeriodData: {
        columns: ['date', 'earlyMorning', 'morning', 'noon', 'afternoon', 'night', 'lateAtNight'],
        rows: []
      }
    }
  },
  computed: {
    orderGross: {
      get() {
        return this.summary.orderPaymentAmount > 0
          ? (this.summary.orderPaymentAmount / 10000).toFixed(4) : 0
      }
    },
    totalCustomer: {
      get() {
        return this.summary.customerTotalNum > 0
          ? (this.summary.customerTotalNum / 10000).toFixed(4) : 0
      }
    },
    perCustomerTransaction: {
      get() {
        return this.summary.orderCustomerTotalNum > 0
          ? (this.summary.orderPaymentAmount / this.summary.orderCustomerTotalNum).toFixed(2)
          : Number.parseFloat('0').toFixed(2)
      }
    },
    orderAveragePrice: {
      get() {
        return this.summary.orderTotalNum > 0
          ? (this.summary.orderPaymentAmount / this.summary.orderTotalNum).toFixed(2)
          : Number.parseFloat('0').toFixed(2)
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
        const { data } = await getSummaryDataApi()
        this.summary.orderPaymentAmount = data.result.orderPaymentAmount
        this.summary.orderTotalNum = data.result.orderCount
        this.summary.customerTotalNum = data.result.userNum
        this.summary.orderCustomerTotalNum = data.result.orderPeopleNum
        this.summary.returnOrderTotalNum = data.result.orderBackNum
      } catch (e) {
        console.warn('Dashboard get summary error:' + e)
      } finally {
        this.summaryLoading = false
      }
    },
    getChartData() {
      const params = this.getParameters()
      this.getMerchantData(params)
      this.getPeriodData(params)
    },
    getParameters() {
      const format = 'YYYY-MM-DD'
      const range = Number.parseInt(this.chartDataType)
      const startDate = moment().subtract(range, 'days').format(format)
      const endDate = moment().format(format)
      return { startDate, endDate }
    },
    async getMerchantData(params) {
      try {
        this.chartMerchantLoading = true
        const { data } = await getMerchantDataApi(params)
        const list = data.result
        if (Array.isArray(list)) {
          this.chartMerchantData.rows = list
            .map(item => {
              return {
                merchant: item.merchantName,
                total: item.orderPaymentAmount
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
        const list = data.result
        if (Array.isArray(list)) {
          this.chartPromotionData.rows = list
            .filter(item => moment(item.statisticsDate).isValid())
            .map(item => {
              const format = 'YYYY/MM/DD'
              const date = moment(item.statisticsDate).format(format)
              return {
                date
              }
            })
        }
      } catch (e) {
        console.warn('Dashboard get promotion error:' + e)
      } finally {
        this.chartPromotionLoading = false
      }
    },
    async getPeriodData(params) {
      try {
        this.chartPeriodLoading = true
        const { data } = await getPeriodDataApi(params)
        const list = data.result
        if (Array.isArray(list)) {
          this.chartPeriodData.rows = list
            .filter(item => moment(item.statisticsDate).isValid())
            .map(item => {
              const format = 'YYYY/MM/DD'
              const date = moment(item.statisticsDate).format(format)
              return {
                date,
                earlyMorning: item.earlyMorning,
                morning: item.morning,
                noon: item.noon,
                afternoon: item.afternoon,
                night: item.night,
                lateAtNight: item.lateAtNight
              }
            })
        }
      } catch (e) {
        console.warn('Dashboard get period error:' + e)
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
