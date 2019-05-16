<template>
  <div class="app-container">
    <el-form :inline="true" :model="queryData">
      <el-form-item label="名称" class="form-item">
        <el-input v-model="queryName" placeholder="输入名称关键字" clearable />
      </el-form-item>
      <el-form-item label="状态" class="form-item">
        <el-select v-model="queryStatus">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
    </el-form>
    <el-form :inline="true" :model="queryData">
      <el-form-item label="开始时间" class="form-item">
        <el-date-picker v-model="queryStartDate" type="date" value-format="yyyy-MM-dd"
                        placeholder="选择开始日期" />
      </el-form-item>
      <el-form-item label="结束时间" class="form-item">
        <el-date-picker v-model="queryEndDate" type="date" value-format="yyyy-MM-dd"
                        placeholder="选择结束日期" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getCouponData">
          {{ $t('product_search_title') }}
        </el-button>
      </el-form-item>
    </el-form>
    <div class="ops-button-group">
      <el-button type="primary" icon="el-icon-edit" class="ops-button"
                 @click="handleCreateCoupon">
        新建优惠券
      </el-button>
    </div>
    <el-table
      v-loading="dataLoading"
      ref="productsTable"
      :data="couponData"
      border fit stripe highlight-current-row
      style="width: 100%;"
    >
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
      <el-table-column label="供应商" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.supplierMerchantName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总量" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.releaseTotal }}</span>
        </template>
      </el-table-column>
      <el-table-column label="已发放数量" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.releaseNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.status | couponStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发布开始时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.releaseStartDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发布结束时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.releaseEndDate }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('aggregation_table_ops_title')" align="center" width="120">
        <template slot-scope="scope">
          <el-dropdown placement="bottom" trigger="click" @command="handleOpsAction">
            <el-button type="primary" icon="el-icon-arrow-down">
              操作
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="`start:${scope.$index}`" :disabled="scope.row.status !== 1"
                                icon="el-icon-time">
                发布
              </el-dropdown-item>
              <el-dropdown-item :command="`view:${scope.$index}`"
                                icon="el-icon-view" divided>
                查看
              </el-dropdown-item>
              <el-dropdown-item :command="`edit:${scope.$index}`" :disabled="scope.row.status !== 1"
                                icon="el-icon-edit">
                修改
              </el-dropdown-item>
              <el-dropdown-item :command="`usage:${scope.$index}`" :disabled="scope.row.status === 1"
                                icon="el-icon-collection">
                记录
              </el-dropdown-item>
              <el-dropdown-item :command="`stop:${scope.$index}`" :disabled="scope.row.status !== 2"
                                icon="el-icon-sold-out" divided>
                下线
              </el-dropdown-item>
              <el-dropdown-item :command="`delete:${scope.$index}`" :disabled="scope.row.status === 2"
                                icon="el-icon-delete">
                删除
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total"
                :page.sync="queryOffset" :limit.sync="queryLimit"
                :page-sizes="[20, 40, 80, 100]"
                @pagination="getCouponData" />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import moment from 'moment'
  import pagination from '@/components/Pagination'

  export default {
    name: "Coupon",
    components: { pagination },
    filters: {
      couponStatus: (status) => {
        switch (status) {
          case 1:
            return '未开始'
          case 2:
            return '已发布'
          case 3:
            return '已下线'
        }
      }
    },
    data() {
      return {
        statusOptions: [{
          value: 0,
          label: '全部'
        }, {
          value: 1,
          label: '未开始'
        }, {
          value: 2,
          label: '已发布'
        }, {
          value: 3,
          label: '已下线'
        }],
        dataLoading: false,
      }
    },
    computed: {
      ...mapGetters({
        couponData: 'allCouponList',
        total: 'couponTotalNum',
        queryData: 'couponQuery'
      }),
      queryName: {
        get() {
          return this.queryData.name
        },
        set(value) {
          this.$store.commit('setQueryData', { name: value })
        }
      },
      queryStatus: {
        get() {
          return this.queryData.status
        },
        set(value) {
          this.$store.commit('setQueryData', { status: value })
        }
      },
      queryStartDate: {
        get() {
          return this.queryData.startDate
        },
        set(value) {
          const start = moment(value).set({ 'hour': 0, 'minute': 0, 'second': 0 })
          if (start.isValid() && (this.queryEndDate === null || start.isBefore(this.queryEndDate))) {
            this.$store.commit('setQueryData', { startDate: start.format('YYYY-MM-DD HH:mm:ss') })
          } else {
            if (value) {
              this.$message.warn('开始日前必须早于结束日期')
            }
            this.$store.commit('setQueryData', { startDate: null })
          }

        }
      },
      queryEndDate: {
        get() {
          return this.queryData.endDate
        },
        set(value) {
          const end = moment(value).set({ 'hour': 23, 'minute': 59, 'second': 59 })
          if (end.isValid() && (this.queryStartDate === null || end.isAfter(this.queryStartDate))) {
            this.$store.commit('setQueryData', { endDate: end.format('YYYY-MM-DD HH:mm:ss') })
          } else {
            if (value) {
              this.$message.warn('结束日期必须晚于开始日期')
            }
            this.$store.commit('setQueryData', { endDate: null })
          }
        }
      },
      queryOffset: {
        get() {
          return this.queryData.offset
        },
        set(value) {
          this.$store.commit('setQueryData', { offset: value })
        }
      },
      queryLimit: {
        get() {
          return this.queryData.limit
        },
        set(value) {
          this.$store.commit('setQueryData', { limit: value })
        }
      }
    },
    created() {
      this.getCouponData()
    },
    methods: {
      getCouponData() {
        const params = this.getFilterParams()
        if (params !== null) {
          this.getFilterData(params)
        } else {
          this.queryAllCouponData()
        }
      },
      async queryAllCouponData() {
        this.dataLoading = true
        try {
          await this.$store.dispatch('getCoupons', { offset: this.queryOffset, limit: this.queryLimit })
        } catch (err) {
          this.$log.warn('Get Coupons:' + err)
        } finally {
          this.dataLoading = false
        }
      },
      getFilterParams() {
        const params = {}
        let needFilter = false
        if (this.queryName && this.queryName !== '') {
          params.name = this.queryName
          needFilter = true
        }
        if (this.queryStatus !== 0) {
          params.status = this.queryStatus
          needFilter = true
        }
        if (this.queryStartDate && this.queryStartDate.trim()) {
          params.releaseStartDate = this.queryStartDate
          needFilter = true
        }
        if (this.queryEndDate && this.queryEndDate.trim()) {
          params.releaseEndDate = this.queryEndDate
          needFilter = true
        }
        if (needFilter) {
          params.offset = this.queryOffset
          params.limit = this.queryLimit
          return params
        } else {
          return null
        }
      },
      async getFilterData(params) {
        this.dataLoading = true
        try {
          await this.$store.dispatch('searchCoupons', params)
        } catch (err) {
          this.$log.warn('Search Coupons:' + err)
        } finally {
          this.dataLoading = false
        }
      },
      handleFilter() {
        this.queryOffset = 1
        this.getCouponData()
      },
      handleCreateCoupon() {
        this.$router.push({ name: 'CreateCoupon' })
      },
      handleEditCoupon(index) {
        this.$router.push({
          name: 'CouponDetail',
          params: { id: this.couponData[index].id, readOnly: false }
        })
      },
      async handleStartCoupon(index) {
        try {
          await this.$confirm('上线此优惠券将导致活动立即开始，请确认是否要继续？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            center: true
          })
          await this.$store.dispatch('updateCoupon', { id: this.couponData[index].id, status: 2 })
        } catch (e) {
          this.$log.warn('Update coupon ' + e)
        }
      },
      handleViewCoupon(index) {
        this.$router.push({
          name: 'CouponDetail',
          params: { id: this.couponData[index].id, readOnly: true }
        })
      },
      handleViewUsageCoupon(index) {
        this.$router.push({
          name: 'CouponUsages',
          params: { id: this.couponData[index].id }
        })
      },
      async handleStopCoupon(index) {
        try {
          await this.$confirm('下线此优惠券将导致活动停止，请确认是否要继续？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            center: true
          })
          await this.$store.dispatch('updateCoupon', { id: this.couponData[index].id, status: 3 })
        } catch (e) {
          this.$log.warn('Stop coupon:' + e)
        }
      },
      async handleDeleteCoupon(index) {
        try {
          await this.$confirm('删除此优惠券将不会再恢复，请确认是否要继续？', '警告', {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning',
            center: true
          })
          await this.$store.dispatch('deleteCouponById', { id: this.couponData[index].id })
          this.getCouponData()
        } catch (e) {
          this.$log.warn('Delete coupon:' + e)
        }
      },
      handleOpsAction(action) {
        const cmd = action.split(':')[0]
        const index = Number.parseInt(action.split(':')[1])
        switch (cmd) {
          case 'start':
            this.handleStartCoupon(index)
            break
          case 'view':
            this.handleViewCoupon(index)
            break
          case 'edit':
            this.handleEditCoupon(index)
            break
          case 'usage':
            this.handleViewUsageCoupon(index)
            break
          case 'stop':
            this.handleStopCoupon(index)
            break
          case 'delete':
            this.handleDeleteCoupon(index)
            break
        }
      }
    }
  }
</script>

<style scoped>
  .form-item {
    width: 300px;
  }

  .ops-button-group {
    margin: 10px 0;
  }

  .ops-button {
    margin: 0 10px;
  }
</style>
