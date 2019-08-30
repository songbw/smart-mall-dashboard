<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    append-to-body
    title="选择优惠券活动"
    width="70%"
    center
  >
    <el-form :inline="true" :model="query">
      <el-form-item label="名称">
        <el-input v-model="query.name" placeholder="输入名称关键字" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" style="width: 100px">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getCouponData">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="dialogCouponTable"
      v-loading="dataLoading"
      :data="couponData"
      border
      style="width: 100%"
      height="250"
      @selection-change="handleDialogSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
        align="center"
      />
      <el-table-column label="编号" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="80">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.status | couponStatusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="上线开始时间" align="center" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.releaseStartDate | dateFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上线结束时间" align="center" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.releaseEndDate | dateFilter }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="total"
      :page.sync="query.offset"
      :limit.sync="query.limit"
      @pagination="getCouponData"
    />
    <span slot="footer">
      <el-button @click="handleDialogCancel">取消</el-button>
      <el-button type="primary" @click="handleDialogConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import moment from 'moment'
import Pagination from '@/components/Pagination'
import { CouponStatusDefinition, CouponPublishedDefinition } from '@/utils/constants'
import { searchCouponsApi, getPublishedCouponsApi } from '@/api/coupons'

export default {
  name: 'CouponSelection',
  components: { Pagination },
  filters: {
    couponStatusFilter: (status) => {
      const item = CouponStatusDefinition.find(coupon => coupon.value === status)
      return item ? item.label : ''
    },
    dateFilter(date) {
      const format = 'YYYY-MM-DD'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : date
    }
  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      statusOptions: [{ value: 0, label: '全部' }].concat(CouponPublishedDefinition),
      query: {
        name: '',
        status: 0,
        offset: 1,
        limit: 20
      },
      dataLoading: false,
      total: 0,
      couponData: [],
      selection: []
    }
  },
  methods: {
    handleDialogSelectionChange(sel) {
      this.selection = sel
    },
    getCouponData() {
      const params = this.getFilterParam()
      if (params) {
        this.getFilterData(params)
      } else {
        this.getPublishedData()
      }
    },
    getFilterParam() {
      let filter = false
      const params = {
        offset: this.query.offset,
        limit: this.query.limit
      }
      if (this.query.name) {
        params.name = this.query.name
        filter = true
      }
      if (this.query.status !== 0) {
        params.status = this.query.status
        filter = true
      }
      return filter ? params : null
    },
    async getPublishedData() {
      try {
        const params = {
          pageNo: this.query.offset,
          pageSize: this.query.limit
        }
        this.dataLoading = true
        const { data } = await getPublishedCouponsApi(params)
        if (data.result && Array.isArray(data.result.list)) {
          this.couponData = data.result.list
            .map(item => ({
              id: item.id,
              name: item.name,
              releaseStartDate: item.releaseStartDate,
              releaseEndDate: item.releaseEndDate,
              status: item.status
            }))
          this.total = data.result.pageInfo.totalCount
        }
      } catch (e) {
        console.warn('Get published coupon error: ' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async getFilterData(params) {
      this.dataLoading = true
      try {
        const { data } = await searchCouponsApi(params)
        this.total = data.result.total
        this.couponData = data.result.list
          .map(item => ({
            id: item.id,
            name: item.name,
            releaseStartDate: item.releaseStartDate,
            releaseEndDate: item.releaseEndDate,
            status: item.status
          }))
      } catch (err) {
        console.warn('Search Coupons:' + err)
      } finally {
        this.dataLoading = false
      }
    },
    handleDialogCancel() {
      this.clearDialogData()
      this.$emit('onSelectionCancelled')
    },
    handleDialogConfirm() {
      if (this.selection.length > 0) {
        this.$emit('onSelectionConfirmed', this.selection)
        this.clearDialogData()
      } else {
        this.$message({
          showClose: true,
          message: '请选择需要的优惠券！',
          type: 'warning'
        })
      }
    },
    clearDialogData() {
      this.selection = []
      this.couponData = []
      this.total = 0
      this.query.name = ''
      this.query.status = 0
      this.query.offset = 1
      this.query.limit = 20
    }
  }
}
</script>

<style scoped>

</style>
