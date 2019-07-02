<template>
  <div class="app-container">
    <el-form :inline="true">
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
    <el-form :inline="true">
      <el-form-item label="创建开始日期">
        <el-date-picker
          v-model="queryStartDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择开始日期"
        />
      </el-form-item>
      <el-form-item label="创建结束日期">
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
      stripe
      highlight-current-row
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        align="center"
        width="55"
      />
      <el-table-column label="工单编号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="子订单编号" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.orderId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | timeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="售后类型" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="售后状态" align="center" width="80">
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
      :page-sizes="[10, 20, 40, 80]"
      @pagination="getWorkOrderList"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import Pagination from '@/components/Pagination'
import {
  getWorkOrderListApi,
  getWorkOrderTypesApi
} from '@/api/workOrders'
import { WorkOrderStatus } from './constants'

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
      return momentDate.isValid() ? momentDate.format(format) : ''
    }
  },
  data() {
    return {
      statusOptions: [{
        value: 0,
        label: '全部'
      }].concat(WorkOrderStatus),
      typeOptions: [],
      listLoading: false,
      workOrderData: [],
      workOrderTotal: 0,
      workOrderSelection: []
    }
  },
  computed: {
    ...mapGetters({
      workOrdersQuery: 'workOrdersQuery'
    }),
    queryMobile: {
      get() {
        return this.workOrdersQuery.mobile
      },
      set(value) {
        this.$store.commit('workOrders/SET_SEARCH_DATA', { mobile: value })
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
    queryStartDate: {
      get() {
        return this.workOrdersQuery.createTimeStart
      },
      set(value) {
        this.$store.commit('workOrders/SET_SEARCH_DATA', { createTimeStart: value })
      }
    },
    queryEndDate: {
      get() {
        return this.workOrdersQuery.createTimeEnd
      },
      set(value) {
        this.$store.commit('workOrders/SET_SEARCH_DATA', { createTimeEnd: value })
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
    async getTypeOptions() {
      try {
        const data = await getWorkOrderTypesApi({ pageIndex: 1, pageSize: 100 })
        const options = data.rows.map(row => {
          return {
            value: row.id,
            label: row.name
          }
        })
        this.typeOptions = [{ value: -1, label: '全部' }].concat(options)
      } catch (e) {
        console.log('Get work order type error: ' + e)
      }
    },
    getSearchParams() {
      const params = {
        pageIndex: this.queryOffset,
        pageSize: this.queryLimit
      }
      const keys = ['mobile', 'createTimeStart', 'createTimeEnd']
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
      return params
    },
    async getWorkOrderList() {
      try {
        if (this.typeOptions.length === 0) {
          await this.getTypeOptions()
        }
        this.listLoading = true
        const params = this.getSearchParams()
        const data = await getWorkOrderListApi(params)
        this.workOrderTotal = data.total
        this.workOrderData = data.rows
        this.workOrderData.forEach(order => {
          const find = this.typeOptions.find(option => option.value === order.typeId)
          this.$set(order, 'typeName', find ? find.label : '')
        })
      } catch (e) {
        console.warn('Work orders List error: ' + e)
      } finally {
        this.listLoading = false
      }
    },
    handleSelectionChange(selection) {
      this.wokorderSelection = selection
    },
    handleViewWorkOrder(id) {
      this.$router.push({
        name: 'ViewWorkOrder',
        params: { id }
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
