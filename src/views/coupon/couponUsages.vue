<template>
  <div class="app-container" v-loading="containerLoading" :element-loading-text="containerLoadingText">
    <el-alert v-if="needBatchCode" title="优惠券提示" type="info" show-icon style="margin-bottom: 10px"
              description="此优惠券的领取方式为人工分配，需要预先批量生成或导入券码！如已操作，请忽略。">
    </el-alert>
    <el-form inline :model="queryData">
      <el-form-item label="领取用户名">
        <el-input v-model="queryData.userName" placeholder="输入领取用户名" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryData.status" style="width: 90px">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="领取开始时间">
        <el-date-picker v-model="queryData.collectedStartDate" type="date" value-format="yyyy-MM-dd"
                        placeholder="选择开始日期" style="width: 150px" />
      </el-form-item>
      <el-form-item label="领取结束时间">
        <el-date-picker v-model="queryData.collectedEndDate" type="date" value-format="yyyy-MM-dd"
                        placeholder="选择结束日期" style="width: 150px" />
      </el-form-item>
    </el-form>
    <el-form inline :model="queryData">
      <el-form-item label="使用开始时间">
        <el-date-picker v-model="queryData.consumedStartDate" type="date" value-format="yyyy-MM-dd"
                        placeholder="选择开始日期" style="width: 150px" />
      </el-form-item>
      <el-form-item label="使用结束时间">
        <el-date-picker v-model="queryData.consumedEndDate" type="date" value-format="yyyy-MM-dd"
                        placeholder="选择结束日期" style="width: 150px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getUsageData">
          {{ $t('product_search_title') }}
        </el-button>
      </el-form-item>
    </el-form>
    <div v-if="needBatchCode" style="margin: 10px 0">
      <el-button :disabled="couponUsageTotal <= 0" type="primary" @click="handleExportUserCode">
        导出用户券码
      </el-button>
      <el-button type="info" @click="handleBatchCode">
        批量生成券码
      </el-button>
      <el-button type="warning" @click="handleImportUserCode">批量导入券码</el-button>
    </div>
    <el-table
      v-loading="dataLoading"
      ref="productsTable"
      :data="couponUsageData"
      border fit stripe highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="用户券码" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.userCouponCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户OpenID" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.userOpenId }}</span>
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
      <el-table-column label="消费时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.consumedTime | timeFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消费订单" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.orderId }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="couponUsageTotal"
                :page.sync="queryData.offset" :limit.sync="queryData.limit"
                :page-sizes="[20, 40, 80, 100]"
                @pagination="getUsageData" />
    <el-dialog
      title="正在导出用户券码"
      :visible.sync="exportDialogVisible"
      :show-close="false"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      width="300px"
      center>
      <div style="display: flex;justify-content: center">
        <el-progress type="circle" :percentage="allExportProgress"></el-progress>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleCancelExport">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import moment from 'moment'
  import isEmpty from 'lodash/isEmpty'
  import isString from 'lodash/isString'
  import isNumber from 'lodash/isNumber'
  import pagination from '@/components/Pagination'
  import { getCouponUsageByIdApi } from '@/api/coupons'
  import { usageStatusOptions } from './couponConstants'

  export default {
    name: 'CouponUsages',
    components: { pagination },
    filters: {
      usageStatus: status => {
        const usage = usageStatusOptions.find(option => status === option.value)
        return usage ? usage.label : ''
      },
      timeFormat: time => {
        const format = 'YYYY-MM-DD HH:mm:ss'
        let momentDate = moment(time)
        if (momentDate.isValid()) {
          return momentDate.format(format)
        } else {
          return ''
        }
      }
    },
    data() {
      return {
        statusOptions: [{
          value: 0,
          label: '全部'
        }].concat(usageStatusOptions),
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
        allExportProgress: 0
      }
    },
    computed: {
      ...mapGetters({
        couponData: 'currentCoupon',
        couponUsageData: 'couponUsage',
        couponUsageTotal: 'couponUsageTotal'
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
      }
    },
    created() {
      this.couponId = this.$route.params.id
      this.getUsageData()
    },
    methods: {
      async getCouponData() {
        try {
          await this.$store.dispatch('getCouponById', { id: this.couponId })
          this.couponDataLoaded = true
        } catch (e) {
          this.$log.warn('Get coupon error:' + e)
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
        this.$log.debug(params)
        this.dataLoading = true
        if (!this.couponDataLoaded) {
          await this.getCouponData()
        }
        this.$store.dispatch('getCouponUsageById', params).then(() => {
          this.dataLoading = false
        }).catch(err => {
          this.$log.warn('Get coupon usage: ' + err)
          this.dataLoading = false
        })
      },
      async handleBatchCode() {
        this.batchCodeLoading = true
        try {
          await this.$store.dispatch('batchUserCodeById', { couponId: this.couponId })
          this.getUsageData()
        } catch (e) {
          this.$log.warn('handleBatchCode:' + e)
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
        const allUserCodes = []
        const params = this.getFilterParams()
        params.offset = 1
        params.limit = 100

        let pageTotal = 0
        let suc = true
        let res = null
        let data = null
        do {
          try {
            res = await getCouponUsageByIdApi(params)
            data = res.result
            data.list.forEach(item => allUserCodes.push({ code: item.userCouponCode }))
            pageTotal = data.pages
            this.allExportProgress = parseInt(params.offset * 100 / pageTotal, 10)
            params.offset = params.offset + 1
          } catch (e) {
            suc = false
            this.$log.warn('handleExportUserCode:' + e)
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
        import('@/utils/exportToExcel').then(excel => {
          const tHeader = ['用户券码']
          const filterVal = ['code']
          const data = this.formatJson(filterVal, dataList)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '用户券码表'
          })
        })
      },
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => {
          if (j !== 'status') {
            return v[j]
          } else {
            const usage = usageStatusOptions.find(option => status === option.value)
            return usage ? usage.label : ''
          }
        }))
      },
      handleImportUserCode() {
        this.$message.warning('此功能稍后提供')
      }
    }
  }
</script>

<style scoped>

</style>
