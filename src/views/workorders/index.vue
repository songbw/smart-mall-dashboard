<template>
  <div class="app-container">
    <el-form :inline="true" label-width="120px" label-position="left">
      <el-form-item label="收货人电话">
        <el-input v-model="queryMobile" placeholder="输入收货人电话号码" clearable />
      </el-form-item>
      <el-form-item label="工单状态">
        <el-select v-model="queryStatus">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="售后类型">
        <el-select v-model="queryTypeId">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <el-form label-width="120px" label-position="left">
      <el-form-item label="子订单编号">
        <el-input v-model="queryOrderId" :clearable="true" placeholder="输入子订单编号" style="width: 500px" />
      </el-form-item>
    </el-form>
    <el-form :inline="true" label-width="120px" label-position="left">
      <el-form-item label="退款开始日期">
        <el-date-picker
          v-model="refundStartDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择开始日期"
        />
      </el-form-item>
      <el-form-item label="退款结束日期">
        <el-date-picker
          v-model="refundEndDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择结束日期"
        />
      </el-form-item>
    </el-form>
    <el-form :inline="true" label-width="120px" label-position="left">
      <el-form-item label="申请开始日期">
        <el-date-picker
          v-model="queryStartDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择开始日期"
        />
      </el-form-item>
      <el-form-item label="申请结束日期">
        <el-date-picker
          v-model="queryEndDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getWorkOrderList">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="workOrdersTable"
      v-loading="listLoading"
      :data="workOrderData"
      border
      fit
      style="width: 100%;"
    >
      <el-table-column label="编号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="子订单编号" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.orderId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收货人姓名" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.receiverName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收货人电话" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.receiverPhone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | timeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="退款时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.refundTime | timeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="售后类型" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="售后状态" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.status | statusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="80"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="handleViewWorkOrder(scope.row.id)"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="workOrderTotal"
      :page.sync="queryOffset"
      :limit.sync="queryLimit"
      @pagination="getWorkOrderList"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import trim from 'lodash/trim'
import Pagination from '@/components/Pagination'
import { getWorkOrderListApi } from '@/api/workOrders'
import { WorkOrderStatus, WorkOrderTypes } from './constants'
import { WorkOrderPermissions } from '@/utils/role-permissions'

export default {
  name: 'WorkOrders',
  components: { Pagination },
  filters: {
    statusFilter: status => {
      const find = WorkOrderStatus.find(option => option.value === status)
      return find ? find.label : status
    },
    timeFilter: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() && momentDate.isAfter('2000-01-01', 'year') ? momentDate.format(format) : ''
    }
  },
  data() {
    return {
      statusOptions: [{
        value: 0,
        label: '全部'
      }].concat(WorkOrderStatus),
      typeOptions: [{
        value: 0,
        label: '全部'
      }].concat(WorkOrderTypes),
      listLoading: false,
      workOrderData: [],
      workOrderTotal: 0,
      workOrderSelection: [],
      queryParams: null
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions',
      workOrdersQuery: 'workOrdersQuery'
    }),
    hasViewPermission() {
      return this.userPermissions.includes(WorkOrderPermissions.view)
    },
    queryMobile: {
      get() {
        return this.workOrdersQuery.receiverPhone
      },
      set(value) {
        this.$store.commit('workOrders/SET_SEARCH_DATA', { receiverPhone: trim(value) })
      }
    },
    queryStatus: {
      get() {
        return this.workOrdersQuery.status
      },
      set(value) {
        this.$store.commit('workOrders/SET_SEARCH_DATA', { status: value })
      }
    },
    queryTypeId: {
      get() {
        return this.workOrdersQuery.typeId
      },
      set(value) {
        this.$store.commit('workOrders/SET_SEARCH_DATA', { typeId: value })
      }
    },
    queryOrderId: {
      get() {
        return this.workOrdersQuery.orderId
      },
      set(value) {
        this.$store.commit('workOrders/SET_SEARCH_DATA', { orderId: value })
      }
    },
    queryStartDate: {
      get() {
        return this.workOrdersQuery.timeStart
      },
      set(value) {
        this.$store.commit('workOrders/SET_SEARCH_DATA', { timeStart: value })
      }
    },
    queryEndDate: {
      get() {
        return this.workOrdersQuery.timeEnd
      },
      set(value) {
        this.$store.commit('workOrders/SET_SEARCH_DATA', { timeEnd: value })
      }
    },
    refundStartDate: {
      get() {
        return this.workOrdersQuery.refundTimeStart
      },
      set(value) {
        this.$store.commit('workOrders/SET_SEARCH_DATA', { refundTimeStart: value })
      }
    },
    refundEndDate: {
      get() {
        return this.workOrdersQuery.refundTimeEnd
      },
      set(value) {
        this.$store.commit('workOrders/SET_SEARCH_DATA', { refundTimeEnd: value })
      }
    },
    queryOffset: {
      get() {
        return this.workOrdersQuery.pageIndex
      },
      set(value) {
        this.$store.commit('workOrders/SET_SEARCH_DATA', { pageIndex: value })
      }
    },
    queryLimit: {
      get() {
        return this.workOrdersQuery.pageSize
      },
      set(value) {
        this.$store.commit('workOrders/SET_SEARCH_DATA', { pageSize: value })
      }
    }
  },
  created() {
    this.getWorkOrderList()
  },
  methods: {
    getSearchParams() {
      const params = {}
      const keys = ['receiverPhone', 'orderId', 'timeStart', 'timeEnd', 'refundTimeStart', 'refundTimeEnd']
      keys.forEach(key => {
        if (!isEmpty(this.workOrdersQuery[key])) {
          params[key] = this.workOrdersQuery[key]
        }
      })
      if (this.queryStatus > 0) {
        params.status = this.queryStatus
      }
      if (this.queryTypeId > 0) {
        params.typeId = this.queryTypeId
      }
      if (!isEqual(this.queryParams, params)) {
        this.queryParams = { ...params }
        this.queryOffset = 1
      }
      return { ...params, pageIndex: this.queryOffset, pageSize: this.queryLimit }
    },
    async getWorkOrderList() {
      if (this.hasViewPermission) {
        try {
          this.listLoading = true
          const params = this.getSearchParams()
          const data = await getWorkOrderListApi(params)
          if (data) {
            this.workOrderTotal = data.total
            this.workOrderData = data.rows
            this.workOrderData.forEach(order => {
              const find = this.typeOptions.find(option => option.value === order.typeId)
              this.$set(order, 'typeName', find ? find.label : '')
            })
          }
        } catch (e) {
          console.warn('Work orders List error: ' + e)
        } finally {
          this.listLoading = false
        }
      } else {
        this.$message.warning('没有查看工单的权限，请联系管理员！')
      }
    },
    handleViewWorkOrder(id) {
      this.$router.push({
        name: 'ViewWorkOrder',
        params: { id }
      })
    },
    handleViewSubOrder(subOrderId) {
      this.$router.push({
        name: 'ViewSubOrder',
        params: { subId: subOrderId }
      })
    }
  }
}
</script>

<style scoped>
  .text-item {
    text-align: start
  }
</style>
