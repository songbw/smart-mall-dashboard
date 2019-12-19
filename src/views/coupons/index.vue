<template>
  <div class="app-container">
    <el-form :inline="true" :model="queryData">
      <el-form-item label="运营平台">
        <el-input readonly :value="currentAppName" />
      </el-form-item>
      <el-form-item label="优惠券名称">
        <el-input v-model="queryName" placeholder="输入名称关键字" clearable maxlength="20" />
      </el-form-item>
      <el-form-item label="优惠券状态">
        <el-select v-model="queryStatus">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <el-form :inline="true" :model="queryData">
      <el-form-item label="开始时间">
        <el-date-picker
          v-model="queryStartDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择开始日期"
        />
      </el-form-item>
      <el-form-item label="结束时间">
        <el-date-picker
          v-model="queryEndDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getCouponData">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <div v-if="hasEditPermission" class="ops-button-group">
      <el-button
        type="primary"
        icon="el-icon-edit"
        class="ops-button"
        @click="handleCreateCoupon"
      >
        新建优惠券
      </el-button>
      <el-button
        type="info"
        icon="el-icon-scissors"
        class="ops-button"
        @click="handleConsumeCoupon"
      >
        核销优惠券
      </el-button>
    </div>
    <el-table
      ref="productsTable"
      v-loading="dataLoading"
      :data="couponData"
      border
      fit
      style="width: 100%;"
    >
      <el-table-column label="编号" align="center" width="80">
        <template slot-scope="scope">
          <router-link
            :to="{ name: 'CouponDetail', params: { id: scope.row.id, readOnly: true }}"
            class="el-link el-link--primary is-underline"
          >
            {{ scope.row.id }}
          </router-link>
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
      <el-table-column label="优惠券类型" align="center" width="120">
        <template slot-scope="scope">
          <span> {{ scope.row.couponType | couponTypeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="领取方式" align="center" width="120">
        <template slot-scope="scope">
          <span> {{ scope.row.collectType | couponCollectFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="80">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.status | couponStatusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="上线时间" align="center" width="140">
        <template slot-scope="scope">
          <div>开始:{{ scope.row.releaseStartDate | dateFilter }}</div>
          <div>结束:{{ scope.row.releaseEndDate | dateFilter }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150">
        <template slot-scope="scope">
          <el-dropdown v-if="hasEditPermission" placement="bottom" trigger="click" @command="handleOpsAction">
            <el-button type="primary" icon="el-icon-arrow-down">
              选择操作
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                :command="`start:${scope.$index}`"
                :disabled="scope.row.status !== initStatus"
                icon="el-icon-sell"
              >
                发布优惠券
              </el-dropdown-item>
              <el-dropdown-item
                :command="`view:${scope.$index}`"
                icon="el-icon-view"
                divided
              >
                查看优惠券
              </el-dropdown-item>
              <el-dropdown-item
                :command="`edit:${scope.$index}`"
                :disabled="scope.row.status !== initStatus"
                icon="el-icon-edit"
              >
                修改优惠券
              </el-dropdown-item>
              <el-dropdown-item
                :command="`usage:${scope.$index}`"
                icon="el-icon-collection"
              >
                优惠券记录
              </el-dropdown-item>
              <el-dropdown-item
                :command="`stop:${scope.$index}`"
                :disabled="scope.row.status === initStatus || scope.row.status === offShelvesStatus"
                icon="el-icon-sold-out"
                divided
              >
                下线优惠券
              </el-dropdown-item>
              <el-dropdown-item
                :command="`delete:${scope.$index}`"
                :disabled="scope.row.status !== initStatus"
                icon="el-icon-delete"
              >
                删除优惠券
              </el-dropdown-item>
              <el-dropdown-item
                :command="`clone:${scope.$index}`"
                icon="el-icon-document-copy"
              >
                复制优惠券
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button
            v-else-if="hasViewPermission"
            type="primary"
            icon="el-icon-view"
            @click="handleViewCoupon(scope.row.id)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="couponTotal"
      :page.sync="queryOffset"
      :limit.sync="queryLimit"
      @pagination="getCouponData"
    />
    <clone-dialog
      :dialog-visible="cloneDialogVisible"
      @cancelled="cloneDialogVisible = false"
      @confirmed="handleCloneCoupon"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import isEqual from 'lodash/isEqual'
import moment from 'moment'
import Pagination from '@/components/Pagination'
import {
  coupon_status_init,
  coupon_status_published,
  coupon_status_on_sale,
  coupon_status_off_shelves,
  CouponStatusDefinition
} from '@/utils/constants'
import {
  getCouponsApi,
  searchCouponsApi,
  updateCouponApi,
  deleteCouponApi,
  consumeCouponApi,
  getCouponByIdApi,
  createCouponApi
} from '@/api/coupons'
import { CouponTypeOptions, CouponCollectOptions } from './constants'
import { CouponPermissions } from '@/utils/role-permissions'
import CloneDialog from './cloneDialog'

export default {
  name: 'Coupon',
  components: { Pagination, CloneDialog },
  filters: {
    couponStatusFilter: (status) => {
      const item = CouponStatusDefinition.find(coupon => coupon.value === status)
      return item ? item.label : ''
    },
    couponTypeFilter: type => {
      const find = CouponTypeOptions.find(option => option.value === type)
      return find ? find.label : ''
    },
    couponCollectFilter: type => {
      const find = CouponCollectOptions.find(option => option.value === type)
      return find ? find.label : ''
    },
    dateFilter(date) {
      const format = 'YYYY-MM-DD'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : date
    }
  },
  data() {
    return {
      initStatus: coupon_status_init,
      onSaleStatus: coupon_status_on_sale,
      offShelvesStatus: coupon_status_off_shelves,
      statusOptions: [{
        value: 0,
        label: '全部'
      }].concat(CouponStatusDefinition),
      dataLoading: false,
      cloneDialogVisible: false,
      cloneCouponId: -1,
      couponData: [],
      couponTotal: 0,
      queryParams: null
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions',
      queryData: 'couponQuery',
      appList: 'platformAppList',
      appId: 'platformAppId'
    }),
    hasViewPermission() {
      return this.userPermissions.includes(CouponPermissions.view)
    },
    hasEditPermission() {
      return this.userPermissions.includes(CouponPermissions.update)
    },
    currentAppName() {
      const find = this.appList.find(item => item.appId === this.appId)
      return find ? find.name : ''
    },
    queryName: {
      get() {
        return this.queryData.name
      },
      set(value) {
        this.$store.commit('coupons/SET_SEARCH_DATA', { name: value })
      }
    },
    queryStatus: {
      get() {
        return this.queryData.status
      },
      set(value) {
        this.$store.commit('coupons/SET_SEARCH_DATA', { status: value })
      }
    },
    queryStartDate: {
      get() {
        return this.queryData.startDate
      },
      set(value) {
        const start = moment(value).set({ 'hour': 0, 'minute': 0, 'second': 0 })
        if (start.isValid() && (this.queryEndDate === null || start.isBefore(this.queryEndDate))) {
          this.$store.commit('coupons/SET_SEARCH_DATA', { startDate: start.format('YYYY-MM-DD HH:mm:ss') })
        } else {
          if (value) {
            this.$message.warning('开始日前必须早于结束日期')
          }
          this.$store.commit('coupons/SET_SEARCH_DATA', { startDate: null })
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
          this.$store.commit('coupons/SET_SEARCH_DATA', { endDate: end.format('YYYY-MM-DD HH:mm:ss') })
        } else {
          if (value) {
            this.$message.warning('结束日期必须晚于开始日期')
          }
          this.$store.commit('coupons/SET_SEARCH_DATA', { endDate: null })
        }
      }
    },
    queryOffset: {
      get() {
        return this.queryData.offset
      },
      set(value) {
        this.$store.commit('coupons/SET_SEARCH_DATA', { offset: value })
      }
    },
    queryLimit: {
      get() {
        return this.queryData.limit
      },
      set(value) {
        this.$store.commit('coupons/SET_SEARCH_DATA', { limit: value })
      }
    }
  },
  watch: {
    appId: function(value, old) {
      this.queryOffset = 1
      this.getCouponData()
    }
  },
  created() {
    this.getCouponData()
  },
  methods: {
    getCouponData() {
      if (this.hasViewPermission) {
        const params = this.getFilterParams()
        if (params !== null) {
          this.getFilterData(params)
        } else {
          this.queryAllCouponData()
        }
      } else {
        this.$message.warning('没有查看优惠券权限，请联系管理员！')
      }
    },
    async queryAllCouponData() {
      this.dataLoading = true
      try {
        const { data } = await getCouponsApi({
          appId: this.appId,
          offset: this.queryOffset,
          limit: this.queryLimit
        })
        this.couponTotal = data.result.total
        this.couponData = data.result.list
      } catch (err) {
        console.warn('Get Coupons:' + err)
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
      if (!isEqual(this.queryParams, params)) {
        this.queryParams = { ...params }
        this.queryOffset = 1
      }
      if (needFilter) {
        params.offset = this.queryOffset
        params.limit = this.queryLimit
        params.appId = this.appId
        return params
      } else {
        return null
      }
    },
    async getFilterData(params) {
      this.dataLoading = true
      try {
        const { data } = await searchCouponsApi(params)
        this.couponTotal = data.result.total
        this.couponData = data.result.list
      } catch (err) {
        console.warn('Search Coupons:' + err)
      } finally {
        this.dataLoading = false
      }
    },
    handleCreateCoupon() {
      this.$router.push({ name: 'CreateCoupon' })
    },
    handleEditCoupon(id) {
      this.$router.push({
        name: 'CouponDetail',
        params: { id, readOnly: false }
      })
    },
    handlePostStartCoupon(coupon) {
      if (coupon.collectType === 4) {
        this.$alert('此优惠券的领取方式为人工分配，需要在优惠券活动开始后，批量生成或导入用户券码。', '提示', {
          confirmButtonText: '确定',
          type: 'info',
          callback: (_) => {
          }
        })
      }
    },
    async handleStartCoupon(id) {
      const dateNow = moment()
      const coupon = this.couponData.find(item => item.id === id)
      if (dateNow.isAfter(coupon.releaseEndDate)) {
        this.$confirm('优惠券上线结束时间需要晚于当前时间，请修改后重新发布！', '警告', {
          confirmButtonText: '修改',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.handleEditCoupon(id)
        }).catch(() => {
        })
        return
      }

      try {
        await this.$confirm('发布此优惠券将不能进行修改，请确认是否要继续？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const { code, msg } = await updateCouponApi({ id, status: coupon_status_published })
        if (code === 200) {
          this.getCouponData()
          this.handlePostStartCoupon(coupon)
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Update coupon ' + e)
      }
    },
    handleViewCoupon(id) {
      this.$router.push({
        name: 'CouponDetail',
        params: { id, readOnly: true }
      })
    },
    handleViewUsageCoupon(id) {
      this.$router.push({
        name: 'CouponUsages',
        params: { id }
      })
    },
    async handleStopCoupon(id) {
      try {
        await this.$confirm('下线此优惠券将导致活动停止，请确认是否要继续？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await updateCouponApi({ id, status: coupon_status_off_shelves })
        this.getCouponData()
      } catch (e) {
        console.warn('Stop coupon:' + e)
      }
    },
    async handleDeleteCoupon(id) {
      try {
        await this.$confirm('删除此优惠券将不会再恢复，请确认是否要继续？', '警告', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deleteCouponApi({ id })
        if (this.couponData.length === 1 && this.queryOffset > 1) {
          this.queryOffset = this.queryOffset - 1
        }
        this.getCouponData()
      } catch (e) {
        console.warn('Delete coupon:' + e)
      }
    },
    handleShowCloneDialog(id) {
      this.cloneCouponId = id
      this.cloneDialogVisible = true
    },
    async handleCloneCoupon(params) {
      this.cloneDialogVisible = false
      if (this.cloneCouponId >= 0) {
        try {
          this.dataLoading = true
          const srcRes = await getCouponByIdApi({ id: this.cloneCouponId })
          if (srcRes.code === 200) {
            const coupon = srcRes.data.result
            coupon.appId = params.appId
            coupon.name = params.name
            coupon.status = coupon_status_init
            coupon.releaseNum = 0
            coupon.rules.code = ''
            const { code, msg } = await createCouponApi(coupon)
            if (code === 200) {
              this.$message.warning('复制优惠券成功，请切换到对应运营平台查看！')
              if (this.appId === params.appId) {
                this.getCouponData()
              }
            } else {
              this.$message.warning(msg)
            }
          }
        } catch (e) {
          console.warn('Handle clone coupon error:' + e)
        } finally {
          this.dataLoading = false
        }
      }
    },
    handleOpsAction(action) {
      const cmd = action.split(':')[0]
      const index = Number.parseInt(action.split(':')[1])
      const id = this.couponData[index].id
      switch (cmd) {
        case 'start':
          this.handleStartCoupon(id)
          break
        case 'view':
          this.handleViewCoupon(id)
          break
        case 'edit':
          this.handleEditCoupon(id)
          break
        case 'usage':
          this.handleViewUsageCoupon(id)
          break
        case 'stop':
          this.handleStopCoupon(id)
          break
        case 'delete':
          this.handleDeleteCoupon(id)
          break
        case 'clone':
          this.handleShowCloneDialog(id)
          break
        default:
          break
      }
    },
    async handleConsumeCoupon() {
      try {
        const action = await this.$prompt('请输入待核销券码', '核销优惠券', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        const response = await consumeCouponApi({ userCouponCode: action.value })
        if (response.code === 200) {
          this.$message.success('核销优惠券码成功！')
          const id = response.data.id
          this.handleViewUsageCoupon(id)
        } else {
          const msg = response.msg || '核销优惠券码失败'
          this.$message.error(msg + '，请仔细核查券码！')
        }
      } catch (e) {
        console.warn('Consume coupon user code: ' + e)
      }
    }
  }
}
</script>

<style scoped>
  .ops-button-group {
    margin: 10px 0;
  }

  .ops-button {
    margin: 0 10px;
  }
</style>
