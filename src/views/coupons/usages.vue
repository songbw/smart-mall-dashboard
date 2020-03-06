<template>
  <div v-loading="containerLoading" class="app-container" :element-loading-text="containerLoadingText">
    <el-alert
      v-if="needBatchCode"
      title="优惠券提示"
      type="info"
      show-icon
      style="margin-bottom: 10px"
      description="此优惠券的领取方式为人工分配，需要预先批量生成或导入券码！如已操作，请忽略。"
    />
    <el-form :model="queryData" inline>
      <el-form-item label="使用状态">
        <el-select v-model="queryData.status" style="width: 90px">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="领取时间">
        <el-date-picker
          v-model="queryData.collectedStartDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择开始日期"
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item label="-">
        <el-date-picker
          v-model="queryData.collectedEndDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择结束日期"
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item label="使用时间">
        <el-date-picker
          v-model="queryData.consumedStartDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择开始日期"
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item label="-">
        <el-date-picker
          v-model="queryData.consumedEndDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择结束日期"
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getUsageData">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <div style="margin: 10px 0">
      <el-button :disabled="couponUsageTotal <= 0" type="primary" @click="handleExportUserCode">
        导出用户券码
      </el-button>
      <el-button v-if="needBatchCode" type="info" @click="handleBatchCode">
        批量生成券码
      </el-button>
      <el-button v-if="false" type="warning" @click="handleImportUserCode">批量导入券码</el-button>
      <el-button :disabled="!couldRedeem" type="warning" @click="handleShowRedeemDialog">
        发放优惠券
      </el-button>
    </div>
    <el-table
      ref="productsTable"
      v-loading="dataLoading"
      :data="couponUsageData"
      border
      fit
      style="width: 100%;"
    >
      <el-table-column label="用户券码" align="center" width="220">
        <template slot-scope="scope">
          <span>{{ scope.row.userCouponCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户OpenID" align="center" width="300">
        <template slot-scope="scope">
          <router-link
            v-if="scope.row.userOpenId"
            :to="{
              name: 'OpenIdProfile',
              params: { openId: scope.row.userOpenId.substring(appId.length), appId: appId }}"
            class="el-link el-link--primary is-underline"
          >
            {{ scope.row.userOpenId }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.status | usageStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="领取时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.collectedTime | timeFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="使用时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.consumedTime | timeFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消费订单" align="center">
        <template slot-scope="scope">
          <router-link
            v-for="orderId in scope.row.orderList"
            :key="orderId"
            :to="{ name: 'ViewMainOrder', params: { mainId: orderId }}"
            class="el-link el-link--primary is-underline"
          >
            {{ orderId }}
          </router-link>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="couponUsageTotal"
      :page.sync="queryData.offset"
      :limit.sync="queryData.limit"
      @pagination="getUsageData"
    />
    <el-dialog
      title="正在导出用户券码"
      :visible.sync="exportDialogVisible"
      :show-close="false"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      width="300px"
      center
    >
      <div style="display: flex;justify-content: center">
        <el-progress type="circle" :percentage="allExportProgress" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleCancelExport">取消</el-button>
      </span>
    </el-dialog>
    <redeem-dialog
      :dialog-visible="redeemDialogVisible"
      :app-id="appId"
      :code="redeemCode"
      @cancelled="redeemDialogVisible = false"
      @confirmed="handleRedeemCoupon"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import isString from 'lodash/isString'
import isNumber from 'lodash/isNumber'
import Pagination from '@/components/Pagination'
import RedeemDialog from './redeemDialog'
import { UsageStatusOptions } from './constants'
import {
  getCouponByIdApi,
  getCouponUsageByIdApi,
  batchUserCodeByIdApi,
  getNotCollectUserCodeApi,
  redeemCouponApi
} from '@/api/coupons'
import {
  coupon_status_on_sale
} from '@/utils/constants'

const timeFormat = time => {
  const format = 'YYYY-MM-DD HH:mm:ss'
  const momentDate = moment(time)
  if (momentDate.isValid()) {
    return momentDate.format(format)
  } else {
    return ''
  }
}
export default {
  name: 'CouponUsages',
  components: { Pagination, RedeemDialog },
  filters: {
    usageStatus: status => {
      const usage = UsageStatusOptions.find(option => status === option.value)
      return usage ? usage.label : ''
    },
    timeFormat: time => timeFormat(time)
  },
  data() {
    return {
      statusOptions: [{
        value: 0,
        label: '全部'
      }].concat(UsageStatusOptions),
      couponId: -1,
      queryData: {
        userName: '',
        status: 0,
        collectedStartDate: null,
        collectedEndDate: null,
        consumedStartDate: null,
        consumedEndDate: null,
        offset: 1,
        limit: 20
      },
      couponDataLoaded: false,
      dataLoading: false,
      batchCodeLoading: false,
      batchCodeLoadingText: '正在批量生成券码...',
      allExportCancelled: false,
      exportDialogVisible: false,
      allExportProgress: 0,
      couponData: null,
      couponUsageData: [],
      couponUsageTotal: 0,
      redeemDialogVisible: false,
      redeemCode: ''
    }
  },
  computed: {
    ...mapGetters({
      appId: 'platformAppId'
    }),
    containerLoading() {
      return this.batchCodeLoading
    },
    containerLoadingText() {
      return this.batchCodeLoading ? this.batchCodeLoadingText : ''
    },
    needBatchCode() {
      // 优惠券的领取方式为人工分配，需要批量生成或导入
      return this.couponDataLoaded ? this.couponData.rules.collect.type === 4 : false
    },
    couldRedeem() {
      return this.couponDataLoaded ? this.couponData.status === coupon_status_on_sale : false
    }
  },
  created() {
    this.couponId = this.$route.params.id
    this.getUsageData()
  },
  methods: {
    async getCouponData() {
      try {
        this.couponDataLoaded = false
        const { data } = await getCouponByIdApi({ id: this.couponId })
        this.couponData = data.result
        this.couponDataLoaded = true
      } catch (e) {
        console.warn('Get coupon error:' + e)
      }
    },
    getFilterParams() {
      const params = { id: this.couponId }
      Object.keys(this.queryData).forEach(key => {
        const value = this.queryData[key]
        if (isString(value) && !isEmpty(value)) {
          params[key] = value
        }
        if (isNumber(value) && value > 0) {
          params[key] = value
        }
      })
      return params
    },
    async getUsageData() {
      const params = this.getFilterParams()
      this.dataLoading = true
      try {
        if (!this.couponDataLoaded) {
          await this.getCouponData()
        }
        const { code, data } = await getCouponUsageByIdApi(params)
        if (code === 200) {
          this.couponUsageData = data.result.list.map(item => {
            const orderList = isEmpty(item.orderId) ? [] : item.orderId.split(',')
            return { ...item, orderList }
          })
          this.couponUsageTotal = data.result.total
        }
      } catch (e) {
        console.warn('Get coupon usages error: ' + e)
        this.couponUsageData = []
        this.couponUsageTotal = 0
      } finally {
        this.dataLoading = false
      }
    },
    async handleBatchCode() {
      this.batchCodeLoading = true
      try {
        const { code, msg } = await batchUserCodeByIdApi({ couponId: this.couponId })
        if (code === 200) {
          this.getUsageData()
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('handleBatchCode:' + e)
      } finally {
        this.batchCodeLoading = false
      }
    },
    handleCancelExport() {
      this.allExportCancelled = true
      this.exportDialogVisible = false
    },
    async handleExportUserCode() {
      this.allExportProgress = 0
      this.allExportCancelled = false
      this.exportDialogVisible = true
      let allUserCodes = []
      const params = this.getFilterParams()
      params.offset = 1
      params.limit = 100

      let pageTotal = 0
      let suc = true

      do {
        try {
          const { code, data } = await getCouponUsageByIdApi(params)
          if (code === 200) {
            const codeList = data.result.list.map(item => {
              const code = item.userCouponCode
              const statusOption = UsageStatusOptions.find(option => option.value === item.status)
              const status = statusOption ? statusOption.label : ''
              const collectedTime = timeFormat(item.collectedTime)
              const consumedTime = timeFormat(item.consumedTime)
              return { code, status, collectedTime, consumedTime, openId: item.userOpenId }
            })
            allUserCodes = allUserCodes.concat(codeList)
            pageTotal = data.result.pages
          }
          this.allExportProgress = parseInt(params.offset * 100 / pageTotal, 10)
          params.offset = params.offset + 1
        } catch (e) {
          suc = false
          console.warn('handleExportUserCode:' + e)
          break
        }
      } while (params.offset <= pageTotal && !this.allExportCancelled)
      if (suc && allUserCodes.length > 0 && !this.allExportCancelled) {
        this.exportToFile(allUserCodes)
      }
      this.allExportProgress = 0
      this.allExportCancelled = false
      this.exportDialogVisible = false
    },
    exportToFile(dataList) {
      import('@/utils/Export2Excel').then(excel => {
        const tHeader = ['用户券码', '状态', '领取时间', '消费时间', '领取用户OpenID']
        const filterVal = ['code', 'status', 'collectedTime', 'consumedTime', 'openId']
        const data = this.formatJson(filterVal, dataList)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '用户券码表'
        })
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
    handleImportUserCode() {
      this.$message.warning('此功能稍后提供')
    },
    async handleShowRedeemDialog() {
      try {
        // find not used user coupons
        const params = { couponId: this.couponId, offset: 1, limit: 1 }
        this.dataLoading = true
        const { code, data } = await getNotCollectUserCodeApi(params)
        if (code === 200 && Array.isArray(data.result.list) && data.result.list.length > 0) {
          this.redeemCode = data.result.list[0].userCouponCode
          this.redeemDialogVisible = true
        } else {
          this.$message.warning('未找到此优惠券待发放的券码！')
        }
      } catch (e) {
        console.warn('Find first not used coupon error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async handleRedeemCoupon(params) {
      try {
        this.dataLoading = true
        this.redeemDialogVisible = false
        const { code, msg } = await redeemCouponApi(params)
        if (code === 200) {
          await this.getUsageData()
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Redeem coupon code error:' + e)
      } finally {
        this.dataLoading = false
      }
    }
  }
}
</script>
